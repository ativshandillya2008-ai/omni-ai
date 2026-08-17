import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import re
import os
import traceback

PORT = 8088
DIRECTORY = r"C:\Users\siyar\.gemini\antigravity\scratch\omni-orchestrator"

def log_debug(msg):
    with open(r"C:\Users\siyar\.gemini\antigravity\brain\003abe96-923e-49fe-b7fc-7576e406e509\scratch\server_debug.log", "a") as f:
        f.write(msg + "\n")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == "/api/video":
            params = urllib.parse.parse_qs(parsed_url.query)
            query = params.get("q", [""])[0]
            log_debug(f"Received video query: {query}")
            
            video_url = ""
            if query:
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
                            # Prioritize fight/combat matching files in results if fighting keywords present
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
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"videoUrl": video_url}).encode("utf-8"))
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
            self.send_header("Access-Control-Allow-Origin", "*")
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
                        raw_data = res.read()
                        
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
                                    raw_data = conf_res.read()
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
            self.send_header("Access-Control-Allow-Origin", "*")
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
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
        print(f"[SERVER] Serving HTTP on 0.0.0.0 port {PORT}...")
        httpd.serve_forever()
