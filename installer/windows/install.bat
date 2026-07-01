@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

title Narada To-Do — установка

echo.
echo ========================================
echo   Narada To-Do — установка
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
echo Папка приложения: %CD%
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден.
  echo Установите Node.js 18+ с https://nodejs.org/
  pause
  exit /b 1
)

echo Node.js:
node --version
echo.

if not exist "frontend\dist\index.html" (
  echo [ОШИБКА] Не найден frontend\dist\index.html
  echo Скачайте lite-архив с GitHub Releases.
  pause
  exit /b 1
)

echo [1/2] Установка серверных зависимостей (~30-60 МБ)...
call npm install --omit=dev --prefix backend
if errorlevel 1 goto :error

echo.
echo [2/2] Создание ярлыка...
set "START_SCRIPT=%APP_DIR%installer\windows\start-narada.bat"
set "SHORTCUT=%USERPROFILE%\Desktop\Narada To-Do.lnk"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $s = $ws.CreateShortcut('%SHORTCUT%'); ^
   $s.TargetPath = '%START_SCRIPT%'; ^
   $s.WorkingDirectory = '%APP_DIR%'; ^
   $s.IconLocation = 'shell32.dll,13'; ^
   $s.Description = 'Narada To-Do с заметками'; ^
   $s.Save()"

echo.
echo ========================================
echo   Установка завершена!
echo ========================================
echo.
echo Запуск: ярлык «Narada To-Do» на рабочем столе
echo        или installer\windows\start-narada.bat
echo.
echo ВАЖНО: не закрывайте чёрное окно — это сервер!
echo Браузер: http://localhost:3001
echo.
pause
exit /b 0

:error
echo.
echo [ОШИБКА] Установка прервана.
pause
exit /b 1
