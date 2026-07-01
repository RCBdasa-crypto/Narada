@echo off
chcp 65001 >nul
setlocal

set "ISS_DIR=%~dp0"
set "APP_ROOT=%ISS_DIR%..\.."

cd /d "%APP_ROOT%"

echo Проверка файлов проекта...
if not exist "backend\src\server.js" (
  echo.
  echo [ОШИБКА] Не найдена папка backend\src\
  echo.
  echo Распакуйте ПОЛНЫЙ архив Narada-Todo-1.0.0-lite.zip
  echo и запускайте этот файл из папки:
  echo   installer\windows\compile-setup.bat
  echo.
  echo Сейчас ожидалось: %APP_ROOT%\backend\src\
  pause
  exit /b 1
)

if not exist "frontend\dist\index.html" (
  echo.
  echo [ОШИБКА] Не найдена папка frontend\dist\
  echo Скачайте lite-архив с GitHub Releases.
  pause
  exit /b 1
)

set "ISCC="
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" set "ISCC=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if exist "C:\Program Files\Inno Setup 6\ISCC.exe" set "ISCC=C:\Program Files\Inno Setup 6\ISCC.exe"

if "%ISCC%"=="" (
  echo.
  echo Inno Setup не найден. Установите с https://jrsoftware.org/isinfo.php
  echo Затем откройте вручную: installer\windows\Narada-Setup.iss
  pause
  exit /b 1
)

echo Сборка setup.exe...
"%ISCC%" "%ISS_DIR%Narada-Setup.iss"
if errorlevel 1 (
  echo.
  echo [ОШИБКА] Сборка не удалась.
  pause
  exit /b 1
)

echo.
echo Готово: %APP_ROOT%\release\Narada-Todo-Setup-1.0.0.exe
pause
