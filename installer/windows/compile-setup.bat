@echo off
setlocal

set "ISS_DIR=%~dp0"
set "APP_ROOT=%ISS_DIR%..\.."

cd /d "%APP_ROOT%"

if not exist "backend\src\server.js" (
  echo [ERROR] backend\src not found.
  echo Extract full Narada-Todo-1.0.0-lite.zip first.
  pause
  exit /b 1
)

if not exist "frontend\dist\index.html" (
  echo [ERROR] frontend\dist not found.
  pause
  exit /b 1
)

set "ISCC="
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" set "ISCC=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if exist "C:\Program Files\Inno Setup 6\ISCC.exe" set "ISCC=C:\Program Files\Inno Setup 6\ISCC.exe"

if "%ISCC%"=="" (
  echo Inno Setup not found. Install from https://jrsoftware.org/isinfo.php
  pause
  exit /b 1
)

echo Building setup.exe...
"%ISCC%" "%ISS_DIR%Narada-Setup.iss"
if errorlevel 1 (
  echo [ERROR] Build failed.
  pause
  exit /b 1
)

echo Done: %APP_ROOT%\release\Narada-Todo-Setup-1.0.0.exe
pause