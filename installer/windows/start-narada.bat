@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

if exist "%SCRIPT_DIR%..\..\backend\package.json" (
  set "APP_DIR=%SCRIPT_DIR%..\.."
) else if exist "%SCRIPT_DIR%..\backend\package.json" (
  set "APP_DIR=%SCRIPT_DIR%.."
) else (
  set "APP_DIR=%SCRIPT_DIR%"
)

cd /d "%APP_DIR%"

set "USER_DATA=%APPDATA%\Narada-Todo"
set "DATA_DIR=%USER_DATA%\data"
set "UPLOADS_DIR=%USER_DATA%\uploads"

if not exist "%USER_DATA%" mkdir "%USER_DATA%"
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"
if not exist "%UPLOADS_DIR%" mkdir "%UPLOADS_DIR%"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js not found!
  echo Install from https://nodejs.org/ and restart PC.
  pause
  exit /b 1
)

if not exist "frontend\dist\index.html" (
  echo [ERROR] frontend\dist\index.html not found.
  pause
  exit /b 1
)

if not exist "backend\node_modules\express" (
  echo.
  echo [ERROR] Dependencies not installed!
  echo Run as Administrator: installer\windows\install.bat
  pause
  exit /b 1
)

set NODE_ENV=production
set FRONTEND_DIST=%CD%\frontend\dist

echo.
echo ========================================
echo   Narada To-Do - Server running
echo ========================================
echo   URL:  http://localhost:3001
echo   Data: %USER_DATA%
echo.
echo   DO NOT CLOSE THIS WINDOW!
echo ========================================
echo.

start /min cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3001"

node backend\src\server.js
set ERR=%errorlevel%

echo.
echo ========================================
if not %ERR%==0 (
  echo [ERROR] Server failed! Error code: %ERR%
  echo Run: installer\windows\diagnose.bat
) else (
  echo Server stopped.
)
echo ========================================
pause