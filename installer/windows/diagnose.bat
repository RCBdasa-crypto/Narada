@echo off
chcp 65001 >nul
echo ========================================
echo   Narada To-Do — диагностика
echo ========================================
echo.

set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%..\..\backend\package.json" (
  set "APP_DIR=%SCRIPT_DIR%..\.."
) else (
  set "APP_DIR=%SCRIPT_DIR%"
)
cd /d "%APP_DIR%"

echo [1] Папка программы: %CD%
echo.

echo [2] Node.js:
where node 2>nul && node --version || echo    НЕ НАЙДЕН - установите с nodejs.org
echo.

echo [3] Файлы:
if exist "frontend\dist\index.html" (echo    frontend\dist  OK) else (echo    frontend\dist  ОТСУТСТВУЕТ)
if exist "backend\src\server.js"   (echo    backend\src    OK) else (echo    backend\src    ОТСУТСТВУЕТ)
if exist "backend\node_modules\express" (echo    node_modules OK) else (echo    node_modules ОТСУТСТВУЕТ - запустите install.bat)
echo.

echo [4] Данные пользователя:
set "USER_DATA=%APPDATA%\Narada-Todo"
echo    %USER_DATA%
if exist "%USER_DATA%" (echo    папка существует) else (echo    будет создана при запуске)
echo.

echo [5] Порт 3001:
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 3001); $c.Close(); Write-Host '    занят (сервер уже запущен?)' } catch { Write-Host '    свободен' }"
echo.

echo [6] Тест запуска сервера (5 сек)...
set NODE_ENV=production
set DATA_DIR=%APPDATA%\Narada-Todo\data
set UPLOADS_DIR=%APPDATA%\Narada-Todo\uploads
set FRONTEND_DIST=%CD%\frontend\dist
mkdir "%DATA_DIR%" 2>nul
mkdir "%UPLOADS_DIR%" 2>nul
start /b node backend\src\server.js
timeout /t 3 /nobreak >nul
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/todos' -UseBasicParsing; Write-Host '    API отвечает:' $r.StatusCode } catch { Write-Host '    API НЕ отвечает:' $_.Exception.Message }"
taskkill /f /im node.exe >nul 2>&1
echo.

echo ========================================
echo Если node_modules отсутствует:
echo   installer\windows\install.bat
echo Если API не отвечает — пришлите файл:
echo   %APPDATA%\Narada-Todo\narada.log
echo ========================================
pause
