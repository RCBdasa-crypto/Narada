@echo off
chcp 65001 >nul

echo Удаление ярлыка Narada To-Do...
set "SHORTCUT=%USERPROFILE%\Desktop\Narada To-Do.lnk"
if exist "%SHORTCUT%" del "%SHORTCUT%"

echo.
echo Ярлык удалён.
echo.
echo Папку приложения можно удалить вручную, если она больше не нужна.
echo Данные хранятся в: backend\data и backend\uploads
echo.
pause
