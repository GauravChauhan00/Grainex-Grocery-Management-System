@echo off
setlocal
cd /d "%~dp0"

echo Opening backend and frontend in two terminal windows...
start "Grocery Backend" cmd /k call "%~dp0START_BACKEND_WINDOWS.bat"
start "Grocery Frontend" cmd /k call "%~dp0START_FRONTEND_WINDOWS.bat"

echo After both servers start, open http://127.0.0.1:5173 in your browser.
pause
