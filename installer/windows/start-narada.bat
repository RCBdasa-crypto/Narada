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

set "USER_DATA=%APPDATA%\Narada-Todo"
set "DATA_DIR=%USER_DATA%\data"
set "UPLOADS_DIR=%USER_DATA%\uploads"
set "LOG_FILE=%USER_DATA%\narada.log"

if not exist "%USER_DATA%" mkdir "%USER_DATA%"
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"
if not exist "%UPLOADS_DIR%" mkdir "%UPLOADS_DIR%"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ОШИБКА] Node.js не найден!
  echo Скачайте и установите: https://nodejs.org/
  echo После установки перезагрузите компьютер.
  pause
  exit /b 1
)

if not exist "frontend\dist\index.html" (
  echo [ОШИБКА] Не найден frontend\dist\index.html
  pause
  exit /b 1
)

if not exist "backend\node_modules\express" (
  echo.
  echo [ОШИБКА] Зависимости не установлены!
  echo.
  echo Щёлкните ПРАВОЙ кнопкой на install.bat
  echo и выберите «Запуск от имени администратора»:
  echo   %APP_DIR%\installer\windows\install.bat
  pause
  exit /b 1
)

set NODE_ENV=production
set FRONTEND_DIST=%CD%\frontend\dist

echo.
echo ========================================
echo   Narada To-Do
echo ========================================
echo  Сайт:   http://localhost:3001
echo  Данные: %USER_DATA%
echo.
echo  НЕ ЗАКРЫВАЙТЕ это окно!
echo ========================================
echo.

start /min cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3001"

node backend\src\server.js
set ERR=%errorlevel%

if %ERR% neq 0 (
  echo. >> "%LOG_FILE%"
  echo ===== Ошибка %date% %time% ===== >> "%LOG_FILE%"
)

echo.
echo ========================================
if %ERR% neq 0 (
  echo [ОШИБКА] Сервер не запустился!
  echo.
  echo Скопируйте ВЕСЬ текст выше и отправьте преподавателю.
  echo.
  echo Или запустите: installer\windows\diagnose.bat
) else (
  echo Сервер остановлен.
)
echo ========================================
pause
