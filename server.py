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
import secrets
import base64
from http.cookies import SimpleCookie
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

# ─── Environment & Config Loader ──────────────────────────────────────────────
def load_env_file():
    env_path = os.path.join(DIRECTORY, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k:
                            os.environ[k] = v
        except Exception as e:
            log_debug(f"Error loading .env: {e}")

load_env_file()

def get_admin_emails():
    load_env_file()
    # Read comma-separated admin emails from environment (set via .env)
    raw = os.environ.get("ADMIN_EMAILS", "")
    if not raw:
        # Fallback to keys.json if present
        keys_file = os.path.join(DIRECTORY, "keys.json")
        if os.path.exists(keys_file):
            try:
                with open(keys_file, "r", encoding="utf-8") as f:
                    k_data = json.load(f)
                    raw = k_data.get("admin_emails", "")
            except Exception:
                pass
    return [e.strip().lower() for e in raw.split(",") if e.strip()]

def get_google_oauth_config():
    load_env_file()
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "").strip()
    # Ignore placeholder template brackets <...>
    if client_id.startswith("<") and client_id.endswith(">"):
        client_id = ""
    if client_secret.startswith("<") and client_secret.endswith(">"):
        client_secret = ""
    if not client_id or not client_secret:
        # Fallback to keys.json
        keys_file = os.path.join(DIRECTORY, "keys.json")
        if os.path.exists(keys_file):
            try:
                with open(keys_file, "r", encoding="utf-8") as f:
                    k_data = json.load(f)
                    if not client_id:
                        client_id = k_data.get("google_client_id", "").strip()
                    if not client_secret:
                        client_secret = k_data.get("google_client_secret", "").strip()
            except Exception:
                pass
    return client_id, client_secret

def parse_jwt_payload_unverified(jwt_token):
    try:
        parts = jwt_token.split(".")
        if len(parts) >= 2:
            payload_b64 = parts[1]
            padded = payload_b64 + "=" * (-len(payload_b64) % 4)
            decoded_bytes = base64.urlsafe_b64decode(padded)
            return json.loads(decoded_bytes.decode("utf-8"))
    except Exception as e:
        log_debug(f"JWT decode error: {e}")
    return {}

# ─── Server-Side Session Store ────────────────────────────────────────────────
SESSION_LOCK = threading.Lock()
SESSIONS = {}  # session_token -> {"email": email, "role": role, "created_at": float}

def create_session(email, role=None):
    clean_email = email.strip().lower()
    if not role:
        admin_list = get_admin_emails()
        role = "admin" if clean_email in admin_list else "user"
    token = secrets.token_hex(32)
    with SESSION_LOCK:
        SESSIONS[token] = {
            "email": clean_email,
            "role": role,
            "created_at": time.time()
        }
    return token, role

def get_session_from_cookie(cookie_header):
    if not cookie_header:
        return None, None
    try:
        cookie = SimpleCookie()
        cookie.load(cookie_header)
        if "session_token" in cookie:
            token = cookie["session_token"].value
            with SESSION_LOCK:
                sess = SESSIONS.get(token)
                if sess:
                    return token, sess
    except Exception as e:
        log_debug(f"Cookie parsing error: {e}")
    return None, None

def delete_session(cookie_header):
    token, _ = get_session_from_cookie(cookie_header)
    if token:
        with SESSION_LOCK:
            SESSIONS.pop(token, None)
            return True
    return False

def require_auth(handler):
    """
    Helper check that endpoints can use to reject requests without a valid session.
    Returns the session dict if authenticated; otherwise sends 401 and returns None.
    """
    cookie_header = handler.headers.get("Cookie", "")
    _, session = get_session_from_cookie(cookie_header)
    if not session:
        handler.send_response(401)
        handler.send_header("Content-Type", "application/json")
        handler.end_headers()
        handler.wfile.write(json.dumps({
            "authenticated": False,
            "error": "Unauthorized: Valid session required"
        }).encode("utf-8"))
        return None
    return session

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

        # Apply rate limiting to all API & Auth endpoints
        if parsed_url.path.startswith("/auth/") or parsed_url.path in ("/api/video", "/api/search", "/api/drive-proxy", "/api/rates"):
            client_ip = self.client_address[0]
            if is_rate_limited(client_ip):
                self.send_response(429)
                self.send_header("Content-Type", "application/json")
                self.send_header("Retry-After", "60")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Too Many Requests: Rate limit of 60 req/min exceeded. Please slow down."
                }).encode("utf-8"))
                return

        if parsed_url.path == "/auth/google/login":
            client_id, client_secret = get_google_oauth_config()
            if not client_id or not client_secret:
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                html_resp = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Google OAuth Setup Required</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                        .card { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 28px; max-width: 540px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                        h2 { margin-top: 0; color: #38bdf8; }
                        code { background: #090d16; padding: 3px 6px; border-radius: 4px; color: #f43f5e; font-size: 13px; }
                        pre { background: #090d16; padding: 12px; border-radius: 8px; color: #a5f3fc; overflow-x: auto; font-size: 12.5px; }
                        a { color: #38bdf8; text-decoration: none; }
                        .btn { display: inline-block; background: #38bdf8; color: #0f172a; padding: 10px 18px; border-radius: 8px; font-weight: 700; margin-top: 14px; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>⚠️ Google OAuth Credentials Required</h2>
                        <p>To enable real Google Sign-In, please add your Google OAuth credentials to your <code>.env</code> file:</p>
                        <pre>GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com\nGOOGLE_CLIENT_SECRET=your-client-secret\nADMIN_EMAILS=ativsandillya2008@gmail.com</pre>
                        <p>Make sure this Authorized Redirect URI is added in Google Cloud Console:</p>
                        <pre>http://127.0.0.1:8088/auth/google/callback</pre>
                        <a href="/" class="btn">← Back to Workspace</a>
                    </div>
                </body>
                </html>
                """
                self.wfile.write(html_resp.encode("utf-8"))
                return

            state = secrets.token_hex(16)
            host = self.headers.get("Host", f"127.0.0.1:{PORT}")
            redirect_uri = f"http://{host}/auth/google/callback"

            oauth_params = {
                "client_id": client_id,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "state": state,
                "access_type": "online",
                "prompt": "select_account"
            }
            google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(oauth_params)}"

            self.send_response(302)
            self.send_header("Location", google_auth_url)
            self.send_header("Set-Cookie", f"oauth_state={state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600")
            self.end_headers()
            return

        if parsed_url.path == "/auth/google/callback":
            params = urllib.parse.parse_qs(parsed_url.query)
            code = params.get("code", [""])[0].strip()
            state = params.get("state", [""])[0].strip()
            error = params.get("error", [""])[0].strip()

            if error:
                log_debug(f"Google OAuth returned error: {error}")
                self.send_response(302)
                self.send_header("Location", f"/?auth_error={urllib.parse.quote(error)}")
                self.end_headers()
                return

            # CSRF State Validation
            cookie_header = self.headers.get("Cookie", "")
            cookie = SimpleCookie()
            if cookie_header:
                try:
                    cookie.load(cookie_header)
                except Exception:
                    pass
            stored_state = cookie["oauth_state"].value if "oauth_state" in cookie else ""

            if not state or not stored_state or state != stored_state:
                log_debug(f"OAuth state mismatch: received={state}, stored={stored_state}")
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "CSRF State validation failed. Please try logging in again."}).encode("utf-8"))
                return

            client_id, client_secret = get_google_oauth_config()
            host = self.headers.get("Host", f"127.0.0.1:{PORT}")
            redirect_uri = f"http://{host}/auth/google/callback"

            try:
                # Exchange authorization code for tokens
                token_url = "https://oauth2.googleapis.com/token"
                token_data = urllib.parse.urlencode({
                    "code": code,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                }).encode("utf-8")

                token_req = urllib.request.Request(
                    token_url,
                    data=token_data,
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "OmniAI/1.0"
                    }
                )
                with urllib.request.urlopen(token_req, timeout=10) as token_res:
                    token_json = json.loads(token_res.read().decode("utf-8"))

                access_token = token_json.get("access_token", "")
                id_token = token_json.get("id_token", "")

                # Fetch verified user info from Google's UserInfo API
                userinfo_url = "https://openidconnect.googleapis.com/v1/userinfo"
                userinfo_req = urllib.request.Request(
                    userinfo_url,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "User-Agent": "OmniAI/1.0"
                    }
                )
                with urllib.request.urlopen(userinfo_req, timeout=8) as uinfo_res:
                    user_info = json.loads(uinfo_res.read().decode("utf-8"))

                email = user_info.get("email", "").strip()
                name = user_info.get("name", "").strip()

                # Validate claims if id_token present
                if id_token:
                    claims = parse_jwt_payload_unverified(id_token)
                    iss = claims.get("iss", "")
                    aud = claims.get("aud", "")
                    exp = claims.get("exp", 0)
                    if iss not in ("accounts.google.com", "https://accounts.google.com"):
                        log_debug(f"Warning: Unexpected JWT issuer: {iss}")
                    if aud and client_id and aud != client_id:
                        log_debug(f"Warning: JWT audience mismatch: {aud} vs {client_id}")
                    if exp and exp < time.time():
                        log_debug("Warning: JWT expired")

                if not email:
                    raise ValueError("No verified email returned from Google OAuth")

                log_debug(f"Google OAuth verified email: {email} (name: {name})")

                # Create server-side session
                session_token, role = create_session(email)

                # Set session cookie and redirect back to app
                self.send_response(302)
                self.send_header("Location", "/?auth_success=1")
                self.send_header("Set-Cookie", f"session_token={session_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400")
                # Clear oauth_state cookie
                self.send_header("Set-Cookie", "oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
                self.end_headers()
                return

            except Exception as e:
                log_debug(f"Google OAuth token exchange failed: {e}\n{traceback.format_exc()}")
                self.send_response(302)
                self.send_header("Location", f"/?auth_error={urllib.parse.quote(str(e))}")
                self.end_headers()
                return

        if parsed_url.path == "/auth/me":
            cookie_header = self.headers.get("Cookie", "")
            _, session = get_session_from_cookie(cookie_header)
            if session:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "authenticated": True,
                    "email": session["email"],
                    "role": session["role"],
                    "created_at": session["created_at"]
                }).encode("utf-8"))
            else:
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "authenticated": False,
                    "error": "No active session found"
                }).encode("utf-8"))
            return

        if parsed_url.path == "/auth/logout":
            cookie_header = self.headers.get("Cookie", "")
            delete_session(cookie_header)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Set-Cookie", "session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "logged_out",
                "authenticated": False
            }).encode("utf-8"))
            return

        if parsed_url.path == "/api/rates":
            rates_data = {}
            try:
                # Fetch European Central Bank reference exchange rates via Frankfurter API (no key needed)
                rates_req = urllib.request.Request(
                    "https://api.frankfurter.app/latest?from=USD",
                    headers={"User-Agent": "OmniAI/1.0"}
                )
                with urllib.request.urlopen(rates_req, timeout=5) as rates_res:
                    rates_data = json.loads(rates_res.read().decode("utf-8"))
            except Exception as e:
                log_debug(f"Rates fetch failed: {e}")
                # Reliable fallback reference rates if offline
                rates_data = {
                    "base": "USD",
                    "date": time.strftime("%Y-%m-%d"),
                    "rates": {
                        "INR": 86.85,
                        "EUR": 0.92,
                        "GBP": 0.79,
                        "JPY": 154.20,
                        "CAD": 1.38,
                        "AUD": 1.52,
                        "CNY": 7.24
                    },
                    "fallback": True
                }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rates_data).encode("utf-8"))
            return

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
            query = params.get("q", [""])[0].strip()
            tavily_key = params.get("key", [""])[0].strip()
            log_debug(f"Received Tavily search query: {query}")
            
            # Read from keys.json if key wasn't passed in URL query
            if not tavily_key:
                keys_file = os.path.join(DIRECTORY, "keys.json")
                if os.path.exists(keys_file):
                    try:
                        with open(keys_file, "r", encoding="utf-8") as f:
                            k_data = json.load(f)
                            tavily_key = k_data.get("tavily", "").strip()
                    except Exception as e:
                        log_debug(f"Error reading keys.json in search: {e}")
            if not tavily_key:
                tavily_key = os.environ.get("TAVILY_API_KEY", "").strip()
            
            results = []
            answer = ""
            error_msg = ""
            
            if not query:
                error_msg = "No search query provided."
            elif not tavily_key:
                error_msg = "Tavily Search API key not configured."
                log_debug(error_msg)
            else:
                try:
                    tavily_url = "https://api.tavily.com/search"
                    payload = json.dumps({
                        "api_key": tavily_key,
                        "query": query,
                        "search_depth": "basic",
                        "include_answer": True,
                        "max_results": 5
                    }).encode("utf-8")
                    
                    req = urllib.request.Request(
                        tavily_url,
                        data=payload,
                        headers={
                            "Content-Type": "application/json",
                            "User-Agent": "OmniAI/1.0"
                        }
                    )
                    with urllib.request.urlopen(req, timeout=8) as res:
                        t_data = json.loads(res.read().decode("utf-8"))
                        answer = t_data.get("answer", "")
                        raw_results = t_data.get("results", [])
                        for r in raw_results:
                            results.append({
                                "title": r.get("title", "Untitled Source"),
                                "url": r.get("url", ""),
                                "content": r.get("content", ""),
                                "snippet": (r.get("content", "") or "")[:350]
                            })
                        log_debug(f"Tavily search successful. Extracted {len(results)} structured results.")
                except urllib.error.HTTPError as he:
                    error_body = ""
                    try:
                        error_body = he.read().decode("utf-8")
                    except Exception:
                        pass
                    error_msg = f"Tavily API HTTP {he.code}: {he.reason} - {error_body}"
                    log_debug(f"Tavily HTTP error: {error_msg}")
                except Exception as e:
                    error_msg = f"Tavily search error: {str(e)}"
                    log_debug(f"Tavily error: {error_msg}\n{traceback.format_exc()}")
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "query": query,
                "answer": answer,
                "results": results,
                "error": error_msg
            }).encode("utf-8"))

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

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)

        # Apply rate limiting to all POST endpoints
        if parsed_url.path.startswith("/auth/") or parsed_url.path.startswith("/api/"):
            client_ip = self.client_address[0]
            if is_rate_limited(client_ip):
                self.send_response(429)
                self.send_header("Content-Type", "application/json")
                self.send_header("Retry-After", "60")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Too Many Requests: Rate limit of 60 req/min exceeded. Please slow down."
                }).encode("utf-8"))
                return

        if parsed_url.path == "/auth/logout":
            cookie_header = self.headers.get("Cookie", "")
            delete_session(cookie_header)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Set-Cookie", "session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "logged_out",
                "authenticated": False
            }).encode("utf-8"))
            return

        else:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler) as httpd:
        print(f"[SERVER] Serving HTTP on 127.0.0.1 port {PORT} (localhost-only)...")
        httpd.serve_forever()
