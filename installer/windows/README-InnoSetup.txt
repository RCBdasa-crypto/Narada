Сборка setup.exe (Inno Setup)
=============================

ВАЖНО: распакуйте ВЕСЬ архив, не только папку installer!

Структура должна быть такой:
  Narada-Todo-1.0.0-lite\
    backend\src\...
    frontend\dist\...
    installer\windows\Narada-Setup.iss   <-- этот файл

СПОСОБ 1 (проще всего):
  Дважды щёлкните compile-setup.bat

СПОСОБ 2 (вручную):
  1. Установите Inno Setup: https://jrsoftware.org/isinfo.php
  2. Откройте installer\windows\Narada-Setup.iss
  3. Build -> Compile (Ctrl+F9)
  4. setup.exe появится в папке release\

Если ошибка "No files found matching ... backend\src":
  - Вы открыли .iss не из полного архива
  - Распакуйте архив заново, например в C:\Narada-Todo\
  - Не копируйте только .iss отдельно

Без setup.exe: запустите install.bat
