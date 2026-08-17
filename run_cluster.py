import subprocess
import time
import os
import re
import sys

# Paths
workspace_dir = os.path.dirname(os.path.abspath(__file__))
brain_scratch_dir = r"C:\Users\siyar\.gemini\antigravity\brain\003abe96-923e-49fe-b7fc-7576e406e509\scratch"
os.makedirs(brain_scratch_dir, exist_ok=True)
url_file = os.path.join(brain_scratch_dir, "tunnel_url.txt")

subdomain = "ativ-omni-ai"

def run_server():
    print("[SERVER] Starting local python server with search routing on port 8088...")
    pythonw_path = sys.executable.replace("python.exe", "pythonw.exe")
    return subprocess.Popen(
        [pythonw_path, "server.py"],
        cwd=workspace_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=0x08000000
    )

def start_tunnel_process():
    cmds = [
        [r"C:\WINDOWS\System32\OpenSSH\ssh.exe", "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-o", "StrictHostKeyChecking=no", "-R", "80:127.0.0.1:8088", "serveo.net"]
    ]
    
    for idx, cmd in enumerate(cmds):
        print(f"[TUNNEL] Attempting command (index {idx}): {' '.join(cmd)}")
        try:
            p = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                creationflags=0x08000000
            )
            
            # Read stdout to extract the active Tunnel URL
            start_time = time.time()
            url_found = False
            while True:
                line = p.stdout.readline()
                if not line:
                    break
                print(f"[TUNNEL-OUT] {line.strip()}")
                
                if "https://" in line and "serveousercontent.com" in line:
                    match = re.search(r"https://[a-zA-Z0-9\.\-]+\.serveousercontent\.com", line)
                    if match:
                        url = match.group(0)
                        with open(url_file, "w") as f:
                            f.write(url)
                        print(f"\n[SUCCESS] Active Tunnel URL: {url}\n", flush=True)
                        url_found = True
                        break
                
                # If no URL found within 8 seconds, break to try fallback
                if time.time() - start_time > 8 and not url_found:
                    print("[TUNNEL] Timeout waiting for URL. Trying fallback/retry...")
                    p.terminate()
                    break
                    p.terminate()
                    break
                    
            if url_found:
                return p
        except Exception as e:
            print(f"[TUNNEL] Error starting command: {e}")
            time.sleep(2)
            
    return None

def main():
    print("=== OMNIAI UNIFIED CLUSTER DAEMON ===")
    
    # Clean up port 8088 on start to prevent address conflicts
    try:
        output = subprocess.check_output("netstat -ano", shell=True).decode()
        for line in output.splitlines():
            if "127.0.0.1:8088" in line and "LISTENING" in line:
                pid = line.strip().split()[-1]
                subprocess.run(f"taskkill /F /PID {pid}", shell=True)
    except Exception as e:
        print("Address cleanup error:", e)
        
    server_proc = None
    tunnel_proc = None
    
    try:
        while True:
            # 1. Monitor Web Server
            if server_proc is None or server_proc.poll() is not None:
                if server_proc is not None:
                    print("[SERVER] Web server exited. Restarting...")
                server_proc = run_server()
                time.sleep(1)
                
            # 2. Monitor SSH Tunnel
            if tunnel_proc is None or tunnel_proc.poll() is not None:
                if tunnel_proc is not None:
                    print("[TUNNEL] Tunnel exited. Restarting...")
                tunnel_proc = start_tunnel_process()
                time.sleep(2)
                
            # Sleep brief period before next health check poll
            time.sleep(3)
            
    except KeyboardInterrupt:
        print("Shutting down daemon...")
    finally:
        if server_proc:
            server_proc.terminate()
        if tunnel_proc:
            tunnel_proc.terminate()

if __name__ == "__main__":
    main()
