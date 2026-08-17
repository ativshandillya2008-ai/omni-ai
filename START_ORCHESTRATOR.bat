@echo off
title OmniAI Orchestrator Server (Self-Healing Loop)
echo ==================================================
echo         OMNIAI ORCHESTRATOR DASHBOARD
echo         [SELF-HEALING AUTO-RESTART ACTIVE]
echo ==================================================
echo.
echo Launching local GPU cluster interface...
echo Opening browser at http://127.0.0.1:8088...
echo.

:: Open default browser
start http://127.0.0.1:8088

:server_loop
echo [%time%] Starting web server on port 8088 (bound to 127.0.0.1)...
python -m http.server 8088 --bind 127.0.0.1

if %ERRORLEVEL% neq 0 (
    echo [%time%] Python server failed or terminated, attempting Node http-server...
    npx -y http-server -p 8088 -a 127.0.0.1
)

echo.
echo [%time%] WARNING: Server process terminated or crashed!
echo Automatically restarting in 3 seconds...
timeout /t 3 >nul
goto server_loop
