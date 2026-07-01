@echo off

echo Removing Narada To-Do shortcut...
set "SHORTCUT=%USERPROFILE%\Desktop\Narada To-Do.lnk"
if exist "%SHORTCUT%" del "%SHORTCUT%"

echo.
echo Shortcut removed.
echo Data is in: %APPDATA%\Narada-Todo\
echo.
pause