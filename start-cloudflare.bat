@echo off
start
cloudflared.exe tunnel --url http://localhost:3000
pause >null
echo Cloudflare tunnel stopped, press any key to restart else close this window.
goto start