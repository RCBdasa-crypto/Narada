Сборка setup.exe (Inno Setup)
=============================

СТРУКТУРА ПАПОК (обязательно!):
  Narada-Todo-1.0.0-lite\
    backend\src\server.js      <-- должен существовать!
    frontend\dist\index.html   <-- должен существовать!
    installer\windows\
      Narada-Setup.iss         <-- открывать ЭТОТ файл
      compile-setup.bat

СПОСОБ 1 (рекомендуется):
  Дважды щёлкните compile-setup.bat

СПОСОБ 2 (Inno Setup вручную):
  1. Установите Inno Setup: https://jrsoftware.org/isinfo.php
  2. File -> Open -> выберите installer\windows\Narada-Setup.iss
     (НЕ перетаскивайте файл в Inno Setup из другой папки!)
  3. Build -> Compile (Ctrl+F9)
  4. setup.exe: release\Narada-Todo-Setup-1.0.0.exe

ОШИБКА "No files found ... backend\src":
  Путь должен быть: ...\Narada-Todo-1.0.0-lite\backend\src\
  НЕ: ...\installer\windows\backend\src\

  Решение: распакуйте архив заново, откройте .iss через File->Open
  из папки installer\windows\

Без setup.exe: запустите install.bat
