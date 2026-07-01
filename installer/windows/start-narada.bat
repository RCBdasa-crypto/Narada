@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

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
  echo [ОШИБКА] Node.js не найден. Установите с https://nodejs.org/
  pause
  exit /b 1
)

if not exist "frontend\dist\index.html" (
  echo [ОШИБКА] Не найден frontend\dist\index.html
  pause
  exit /b 1
)

if not exist "backend\node_modules\express" (
  echo [ОШИБКА] Зависимости не установлены. Запустите install.bat
  pause
  exit /b 1
)

echo ========================================
echo   Narada To-Do
echo ========================================
echo Программа: %CD%
echo Данные:    %USER_DATA%
echo Сайт:      http://localhost:3001
echo.
echo НЕ ЗАКРЫВАЙТЕ это окно — это сервер!
echo ========================================
echo.

set NODE_ENV=production
set FRONTEND_DIST=%CD%\frontend\dist

:: Запуск сервера в фоне, ожидание готовности, затем браузер
start /b cmd /c "node backend\src\server.js >> "%LOG_FILE%" 2>&1"

echo Ожидание запуска сервера...
set /a WAIT=0
:waitloop
timeout /t 1 /nobreak >nul
set /a WAIT+=1
powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri 'http://localhost:3001/api/todos' -UseBasicParsing -TimeoutSec 2).StatusCode | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 goto :ready
if !WAIT! geq 15 goto :failed
goto :waitloop

:ready
echo Сервер запущен!
start "" http://localhost:3001
echo.
echo Браузер открыт. Для остановки закройте это окно.
echo Лог: %LOG_FILE%
echo.
:keepalive
timeout /t 3600 /nobreak >nul
goto :keepalive

:failed
echo.
echo [ОШИБКА] Сервер не запустился за 15 секунд.
echo.
echo Последние строки лога:
echo ----------------------------------------
powershell -NoProfile -Command "Get-Content '%LOG_FILE%' -Tail 20 -ErrorAction SilentlyContinue"
echo ----------------------------------------
echo.
echo Полный лог: %LOG_FILE%
echo.
echo Запустите diagnose.bat для проверки.
pause
exit /b 1
