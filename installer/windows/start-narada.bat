@echo off
chcp 65001 >nul
setlocal

set "APP_DIR=%~dp0"
if exist "%APP_DIR%..\..\package.json" (
  set "APP_DIR=%APP_DIR%..\.."
) else if exist "%APP_DIR%..\package.json" (
  set "APP_DIR=%APP_DIR%.."
)

cd /d "%APP_DIR%"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js не найден. Сначала запустите install.bat
  pause
  exit /b 1
)

if not exist "frontend\dist\index.html" (
  echo Сначала выполните установку: installer\windows\install.bat
  pause
  exit /b 1
)

echo Запуск Narada To-Do...
echo Откройте в браузере: http://localhost:3001
echo Для остановки закройте это окно или нажмите Ctrl+C
echo.

set NODE_ENV=production
set DATA_DIR=%APP_DIR%backend\data
set UPLOADS_DIR=%APP_DIR%backend\uploads
set FRONTEND_DIST=%APP_DIR%frontend\dist

start "" http://localhost:3001
node backend\src\server.js

pause
