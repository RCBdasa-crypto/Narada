@echo off
echo ========================================
echo   Narada To-Do - Diagnostics
echo ========================================
echo.

set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%..\..\backend\package.json" (
  set "APP_DIR=%SCRIPT_DIR%..\.."
) else (
  set "APP_DIR=%SCRIPT_DIR%"
)
cd /d "%APP_DIR%"

echo [1] App folder: %CD%
echo.

echo [2] Node.js:
where node 2>nul && node --version || echo    NOT FOUND
echo.

echo [3] Files:
if exist "frontend\dist\index.html" (echo    frontend\dist  OK) else (echo    frontend\dist  MISSING)
if exist "backend\src\server.js" (echo    backend\src    OK) else (echo    backend\src    MISSING)
if exist "backend\node_modules\express" (echo    node_modules OK) else (echo    node_modules MISSING - run install.bat)
echo.

echo [4] User data: %APPDATA%\Narada-Todo
echo.

echo [5] Port 3001:
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 3001); $c.Close(); Write-Host '    in use' } catch { Write-Host '    free' }"
echo.

echo [6] API test...
set NODE_ENV=production
set DATA_DIR=%APPDATA%\Narada-Todo\data
set UPLOADS_DIR=%APPDATA%\Narada-Todo\uploads
set FRONTEND_DIST=%CD%\frontend\dist
mkdir "%DATA_DIR%" 2>nul
mkdir "%UPLOADS_DIR%" 2>nul
start /b node backend\src\server.js
timeout /t 3 /nobreak >nul
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/todos' -UseBasicParsing; Write-Host '    API OK:' $r.StatusCode } catch { Write-Host '    API FAIL:' $_.Exception.Message }"
taskkill /f /im node.exe >nul 2>&1
echo.
pause