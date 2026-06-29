@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

title Narada To-Do — установка

echo.
echo ========================================
echo   Narada To-Do — установка
echo ========================================
echo.

:: Определяем корень проекта (папка с package.json)
set "APP_DIR=%~dp0"
if exist "%APP_DIR%..\..\package.json" (
  set "APP_DIR=%APP_DIR%..\.."
) else if exist "%APP_DIR%..\package.json" (
  set "APP_DIR=%APP_DIR%.."
)

cd /d "%APP_DIR%"
echo Папка приложения: %CD%
echo.

:: Проверка Node.js
where node >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден.
  echo.
  echo Установите Node.js 18+ с сайта: https://nodejs.org/
  echo После установки перезапустите этот файл.
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo Node.js: %NODE_VER%
echo.

:: Установка зависимостей
echo [1/3] Установка зависимостей...
call npm install
if errorlevel 1 goto :error

call npm install --prefix backend
if errorlevel 1 goto :error

call npm install --prefix frontend
if errorlevel 1 goto :error

:: Сборка фронтенда
echo.
echo [2/3] Сборка интерфейса...
call npm run build --prefix frontend
if errorlevel 1 goto :error

:: Ярлык на рабочем столе
echo.
echo [3/3] Создание ярлыка...
set "START_SCRIPT=%APP_DIR%installer\windows\start-narada.bat"
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\Narada To-Do.lnk"

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
echo Запуск: дважды щёлкните «Narada To-Do» на рабочем столе
echo        или запустите: installer\windows\start-narada.bat
echo.
echo Приложение откроется в браузере: http://localhost:3001
echo.
pause
exit /b 0

:error
echo.
echo [ОШИБКА] Установка прервана.
pause
exit /b 1
