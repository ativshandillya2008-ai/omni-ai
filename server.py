import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import re
import os
import traceback
import time
import threading
from collections import defaultdict

PORT = 8088
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# ─── In-Memory Rate Limiter ───────────────────────────────────────────────────
RATE_LIMIT_LOCK = threading.Lock()
RATE_LIMIT_STORE = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 60  # Maximum 60 requests per minute per IP
RATE_LIMIT_WINDOW = 60        # Sliding window in seconds

def is_rate_limited(ip, max_requests=RATE_LIMIT_MAX_REQUESTS, window=RATE_LIMIT_WINDOW):
    now = time.time()
    with RATE_LIMIT_LOCK:
        timestamps = RATE_LIMIT_STORE[ip]
        valid_timestamps = [t for t in timestamps if now - t < window]
        if len(valid_timestamps) >= max_requests:
            RATE_LIMIT_STORE[ip] = valid_timestamps
            return True
        valid_timestamps.append(now)
        RATE_LIMIT_STORE[ip] = valid_timestamps
        return False

# ─── Safe Capped Stream Reader ────────────────────────────────────────────────
MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024  # 10 MB maximum
CHUNK_SIZE = 8192                      # 8 KB per chunk

def read_response_capped(res, max_bytes=MAX_DOWNLOAD_BYTES, chunk_size=CHUNK_SIZE):
    """
    Reads an HTTP response stream in chunks up to max_bytes.
    Rejects immediately if Content-Length header exceeds limit.
    Enforces a running byte-count cap during read to prevent memory exhaustion.
    """
    cl = res.headers.get("Content-Length")
    if cl:
        try:
            if int(cl) > max_bytes:
                raise ValueError(f"Content-Length ({cl} bytes) exceeds maximum limit of {max_bytes // (1024 * 1024)}MB.")
        except ValueError as ve:
            if "exceeds maximum limit" in str(ve):
                raise
    
    chunks = []
    total_bytes = 0
    while True:
        chunk = res.read(chunk_size)
        if not chunk:
            break
        total_bytes += len(chunk)
        if total_bytes > max_bytes:
            raise ValueError(f"Download size exceeded maximum limit of {max_bytes // (1024 * 1024)}MB during transfer.")
        chunks.append(chunk)
    return b"".join(chunks)

def log_debug(msg):
    try:
        log_path = os.path.join(DIRECTORY, "server_debug.log")
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    except Exception:
        pass

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)

        # Apply rate limiting to all API endpoints
        if parsed_url.path in ("/api/video", "/api/search", "/api/drive-proxy"):
            client_ip = self.client_address[0]
            if is_rate_limited(client_ip):
                self.send_response(429)
                self.send_header("Content-Type", "application/json")
                self.send_header("Retry-After", "60")
                self.end_headers()
        if parsed_url.path == "/api/keys":
            keys_file = os.path.join(DIRECTORY, "keys.json")
            data = {}
            if os.path.exists(keys_file):
                try:
                    with open(keys_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                except Exception as e:
                    log_debug(f"Error reading keys.json: {e}")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        if parsed_url.path == "/api/video":
            params = urllib.parse.parse_qs(parsed_url.query)
            query = params.get("q", [""])[0]
            luma_key = params.get("luma_key", [""])[0]
            log_debug(f"Received video query: {query}, Luma key provided: {bool(luma_key)}")
            
            video_url = ""
            engine_name = "Tenor Motion Loop"
            
            # Step A: If Luma AI key is provided, attempt real Luma Dream Machine generation
            if luma_key and query:
                try:
                    log_debug(f"Attempting Luma Dream Machine generation for: {query}")
                    luma_url = "https://api.lumalabs.ai/dream-machine/v1/generations"
                    luma_payload = json.dumps({
                        "prompt": query,
                        "aspect_ratio": "16:9",
                        "loop": True
                    }).encode("utf-8")
                    
                    luma_req = urllib.request.Request(
                        luma_url,
                        data=luma_payload,
                        headers={
                            "Authorization": f"Bearer {luma_key}",
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "User-Agent": "OmniAI/1.0"
                        }
                    )
                    with urllib.request.urlopen(luma_req, timeout=10) as luma_res:
                        gen_data = json.loads(luma_res.read().decode("utf-8"))
                        gen_id = gen_data.get("id")
                        log_debug(f"Luma generation created, ID: {gen_id}")
                        
                        # Poll for completion (up to 45 seconds)
                        if gen_id:
                            poll_url = f"https://api.lumalabs.ai/dream-machine/v1/generations/{gen_id}"
                            for _ in range(15):
                                time.sleep(3)
                                poll_req = urllib.request.Request(
                                    poll_url,
                                    headers={
                                        "Authorization": f"Bearer {luma_key}",
                                        "Accept": "application/json"
                                    }
                                )
                                with urllib.request.urlopen(poll_req, timeout=8) as poll_res:
                                    poll_data = json.loads(poll_res.read().decode("utf-8"))
                                    state = poll_data.get("state")
                                    log_debug(f"Luma poll state: {state}")
                                    if state == "completed":
                                        video_url = poll_data.get("assets", {}).get("video", "")
                                        engine_name = "Luma Dream Machine"
                                        break
                                    elif state == "failed":
                                        log_debug(f"Luma generation failed: {poll_data.get('failure_reason')}")
                                        break
                except Exception as e:
                    log_debug(f"Luma generation error: {e}. Falling back to Tenor loop engine.")
            
            # Step B: Fallback to Tenor search if no video URL from Luma
            if not video_url and query:
                try:
                    search_url = f"https://tenor.com/search/{urllib.parse.quote(query)}-gifs"
                    log_debug(f"Fetching Tenor search URL: {search_url}")
                    req = urllib.request.Request(
                        search_url,
                        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                    )
                    with urllib.request.urlopen(req, timeout=5) as res:
                        html = res.read().decode("utf-8")
                        mp4s = re.findall(r'https://media\.tenor\.com/[a-zA-Z0-9\-_]+/[^"\']+\.mp4', html)
                        if mp4s:
                            unique_mp4s = list(dict.fromkeys(mp4s))
                            matched = unique_mp4s[0]
                            lower_query = query.lower()
                            if "fight" in lower_query or "combat" in lower_query or "vs" in lower_query or "punch" in lower_query:
                                for link in unique_mp4s:
                                    link_lower = link.lower()
                                    if "fight" in link_lower or "vs" in link_lower or "punch" in link_lower or "combat" in link_lower or "goku-naruto" in link_lower or "dragonball" in link_lower:
                                        matched = link
                                        break
                            video_url = matched
                            log_debug(f"Matched MP4 URL: {video_url}")
                except Exception as e:
                    log_debug(f"Video search error: {e}")
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"videoUrl": video_url, "engine": engine_name}).encode("utf-8"))

        elif parsed_url.path == "/api/search":
            params = urllib.parse.parse_qs(parsed_url.query)
            query = params.get("q", [""])[0]
            log_debug(f"Received search query: {query}")
            
            results = []
            if query:
                try:
                    search_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
                    log_debug(f"Fetching DuckDuckGo URL: {search_url}")
                    req = urllib.request.Request(
                        search_url,
                        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                    )
                    with urllib.request.urlopen(req, timeout=5) as res:
                        html = res.read().decode("utf-8")
                        log_debug(f"HTML response length: {len(html)}")
                        snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.DOTALL)
                        titles = re.findall(r'<a[^>]+class="result__a"[^>]*>(.*?)</a>', html, re.DOTALL)
                        log_debug(f"Found snippets count: {len(snippets)}, titles count: {len(titles)}")
                        
                        for i in range(min(5, len(snippets), len(titles))):
                            clean_t = re.sub(r'<[^>]+>', '', titles[i]).strip()
                            clean_s = re.sub(r'<[^>]+>', '', snippets[i]).strip()
                            results.append({
                                "title": clean_t,
                                "snippet": clean_s
                            })
                except Exception as e:
                    err_msg = f"Exception: {e}\n{traceback.format_exc()}"
                    log_debug(err_msg)
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"results": results}).encode("utf-8"))

        elif parsed_url.path == "/api/drive-proxy":
            params = urllib.parse.parse_qs(parsed_url.query)
            drive_url = params.get("url", [""])[0]
            log_debug(f"Received proxy request for Google Drive file: {drive_url}")
            
            parsed_drive = urllib.parse.urlparse(drive_url)
            file_id = ""
            
            # Extract File ID from standard patterns
            # Pattern A: /file/d/FILE_ID/view
            match_d = re.search(r'/file/d/([a-zA-Z0-9\-_]+)', parsed_drive.path)
            if match_d:
                file_id = match_d.group(1)
            else:
                # Pattern B: ?id=FILE_ID
                qs = urllib.parse.parse_qs(parsed_drive.query)
                if "id" in qs:
                    file_id = qs["id"][0]
            
            log_debug(f"Extracted File ID: {file_id}")
            
            result_text = ""
            error_msg = ""
            
            if file_id:
                try:
                    # Attempt a direct download fetch from google export endpoint
                    direct_download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
                    log_debug(f"Fetching from Drive export API: {direct_download_url}")
                    
                    req = urllib.request.Request(
                        direct_download_url,
                        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                    )
                    
                    with urllib.request.urlopen(req, timeout=8) as res:
                        raw_data = read_response_capped(res, max_bytes=MAX_DOWNLOAD_BYTES, chunk_size=CHUNK_SIZE)
                        
                        # Inspect the content-type header
                        content_type = res.headers.get("Content-Type", "")
                        log_debug(f"Returned content-type: {content_type}, size: {len(raw_data)} bytes")
                        
                        if "html" in content_type.lower():
                            # Clean and extract text from HTML page
                            html_str = raw_data.decode("utf-8", errors="ignore")
                            # Check if it was a confirmation page (for large files scanner)
                            confirm_match = re.search(r'confirm=([a-zA-Z0-9\-_]+)', html_str)
                            if confirm_match:
                                confirm_token = confirm_match.group(1)
                                confirmed_url = f"https://drive.google.com/uc?export=download&confirm={confirm_token}&id={file_id}"
                                log_debug(f"Retrying with confirmation token: {confirmed_url}")
                                
                                conf_req = urllib.request.Request(
                                    confirmed_url,
                                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                                )
                                with urllib.request.urlopen(conf_req, timeout=8) as conf_res:
                                    raw_data = read_response_capped(conf_res, max_bytes=MAX_DOWNLOAD_BYTES, chunk_size=CHUNK_SIZE)
                                    content_type = conf_res.headers.get("Content-Type", "")
                            
                            if "html" in content_type.lower():
                                text_content = re.sub(r'<[^>]+>', ' ', html_str)
                                text_content = re.sub(r'\s+', ' ', text_content).strip()
                                result_text = text_content[:8000]
                            else:
                                result_text = raw_data.decode("utf-8", errors="ignore")[:8000]
                        else:
                            # It is a raw text/csv/json/docx file, convert to utf-8 string
                            result_text = raw_data.decode("utf-8", errors="ignore")[:8000]
                            
                except Exception as e:
                    error_msg = str(e)
                    log_debug(f"Drive crawl failed: {e}\n{traceback.format_exc()}")
            else:
                error_msg = "Invalid URL layout. Could not isolate Google Drive File ID."
                
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "fileId": file_id,
                "text": result_text,
                "error": error_msg
            }).encode("utf-8"))
        else:
            super().do_GET()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler) as httpd:
        print(f"[SERVER] Serving HTTP on 127.0.0.1 port {PORT} (localhost-only)...")
        httpd.serve_forever()
