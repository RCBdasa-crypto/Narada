@echo off
chcp 65001 >nul
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

where node >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден.
  echo Установите Node.js 18+ с https://nodejs.org/
  echo Затем запустите install.bat
  pause
  exit /b 1
)

if not exist "frontend\dist\index.html" (
  echo [ОШИБКА] Не найден frontend\dist\index.html
  echo Сначала запустите: installer\windows\install.bat
  pause
  exit /b 1
)

if not exist "backend\node_modules\express" (
  echo [ОШИБКА] Зависимости не установлены.
  echo Запустите: installer\windows\install.bat
  pause
  exit /b 1
)

echo ========================================
echo   Narada To-Do — запуск
echo ========================================
echo Папка: %CD%
echo.
echo НЕ ЗАКРЫВАЙТЕ это окно пока работаете с приложением!
echo Адрес: http://localhost:3001
echo Остановка: закройте окно или Ctrl+C
echo ========================================
echo.

set NODE_ENV=production
set DATA_DIR=%CD%\backend\data
set UPLOADS_DIR=%CD%\backend\uploads
set FRONTEND_DIST=%CD%\frontend\dist

:: Открыть браузер через 2 секунды после старта сервера
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3001"

node backend\src\server.js
if errorlevel 1 (
  echo.
  echo [ОШИБКА] Сервер не запустился. См. текст ошибки выше.
  pause
)
