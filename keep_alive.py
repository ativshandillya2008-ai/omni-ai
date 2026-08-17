import urllib.request
import subprocess
import os
import sys
import time

PORT = 8088
DIRECTORY = r"C:\Users\siyar\.gemini\antigravity\scratch\omni-orchestrator"

def is_server_working(port):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=2) as res:
            return res.status == 200
    except Exception:
        return False

def restart_cluster():
    print(f"[KEEP-ALIVE] Server on port {PORT} not responding. Performing full cluster cleanup and restart...")
    try:
        output = subprocess.check_output("netstat -ano", shell=True).decode()
        for line in output.splitlines():
            if f":{PORT}" in line and "LISTENING" in line:
                pid = line.strip().split()[-1]
                subprocess.run(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run("taskkill /F /IM ssh.exe", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as e:
        print("Cleanup error:", e)
        
    os.chdir(DIRECTORY)
    pythonw_path = sys.executable.replace("python.exe", "pythonw.exe")
    creation_flags = 0x08000000
    if hasattr(subprocess, 'CREATE_NEW_PROCESS_GROUP'):
        creation_flags |= subprocess.CREATE_NEW_PROCESS_GROUP
        
    subprocess.Popen(
        [pythonw_path, "run_cluster.py"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=creation_flags
    )
    print("[KEEP-ALIVE] Restarted run_cluster.py successfully.")

if __name__ == "__main__":
    restart_cluster()

