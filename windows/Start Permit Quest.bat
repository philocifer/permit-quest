@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>&1
if %errorlevel%==0 (
    set "PY=py -3"
    goto run
)
where python >nul 2>&1
if %errorlevel%==0 (
    set "PY=python"
    goto run
)

echo Python 3 is not installed.
echo Install it from https://www.python.org/downloads/ and run this again.
pause
exit /b 1

:run
echo Permit Quest
echo.
echo On this computer, open http://localhost:8000
echo.
echo On a phone on the same Wi-Fi, use one of these addresses:
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4"') do echo   http://%%A:8000
echo.
echo Leave this window open while the app is in use.
echo Press Ctrl+C to stop the server.
echo.
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://localhost:8000"
%PY% -m http.server 8000 --bind 0.0.0.0
pause
