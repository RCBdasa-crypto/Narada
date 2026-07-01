@echo off
setlocal EnableDelayedExpansion

title Narada To-Do Install

echo.
echo ========================================
echo   Narada To-Do - Install
echo ========================================
echo.

set "SCRIPT_DIR=%~dp0"

if exist "%SCRIPT_DIR%..\..\backend\package.json" (
  set "APP_DIR=%SCRIPT_DIR%..\.."
) else if exist "%SCRIPT_DIR%..\backend\package.json" (
  set "APP_DIR=%SCRIPT_DIR%.."
) else (
  set "APP_DIR=%SCRIPT_DIR%"
)

cd /d "%APP_DIR%"
echo App folder: %CD%
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found.
  echo Install Node.js 22.5+ from https://nodejs.org/
  pause
  exit /b 1
)

node -e "const p=process.versions.node.split('.').map(Number);if(p[0]<22||(p[0]===22&&p[1]<5)){console.error('[ERROR] Node.js 22.5+ required (built-in SQLite). Current: '+process.version);process.exit(1)}"
if errorlevel 1 (
  pause
  exit /b 1
)

echo Node.js:
node --version
echo.

if not exist "frontend\dist\index.html" (
  echo [ERROR] frontend\dist\index.html not found.
  pause
  exit /b 1
)

echo [1/2] Installing server dependencies...
call npm install --omit=dev --prefix backend
if errorlevel 1 goto :error

echo.
echo [2/2] Creating desktop shortcut...
set "START_SCRIPT=%APP_DIR%installer\windows\start-narada.bat"
set "SHORTCUT=%USERPROFILE%\Desktop\Narada To-Do.lnk"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%START_SCRIPT%'; $s.WorkingDirectory = '%APP_DIR%'; $s.IconLocation = 'shell32.dll,13'; $s.Description = 'Narada To-Do'; $s.Save()"

echo.
echo ========================================
echo   Install complete!
echo ========================================
echo.
echo Run: Desktop shortcut "Narada To-Do"
echo  or: installer\windows\start-narada.bat
echo.
echo Data folder: %APPDATA%\Narada-Todo\
echo.
pause
exit /b 0

:error
echo.
echo [ERROR] Install failed.
pause
exit /b 1