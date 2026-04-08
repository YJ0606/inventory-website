@echo off
echo Starting TMT Inventory System...
start "TMT Backend" cmd /k "cd /d %~dp0backend && npm install && node server.js"
timeout /t 5 /nobreak > nul
start "TMT Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm start"
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
