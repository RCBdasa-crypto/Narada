; Минимальный установщик Narada To-Do (~1-3 МБ setup.exe)
;
; ВАЖНО: этот файл должен лежать в:
;   Narada-Todo-1.0.0-lite\installer\windows\Narada-Setup.iss
;
; Рядом в корне архива должны быть папки backend\ и frontend\dist\

#define MyAppName "Narada To-Do"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Narada"
#define MyAppURL "https://github.com/RCBdasa-crypto/Narada"
#define MyAppExeName "start-narada.bat"

; Проверка при компиляции: есть ли backend\src
#ifexist "..\..\backend\src\server.js"
  ; ok
#else
  #error "Не найден ..\..\backend\src\server.js. Распакуйте ПОЛНЫЙ lite-архив и откройте .iss из installer\windows\"
#endif

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Narada-Todo
DefaultGroupName={#MyAppName}
OutputDir=..\..\release
OutputBaseFilename=Narada-Todo-Setup-{#MyAppVersion}
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[Tasks]
Name: "desktopicon"; Description: "Создать ярлык на рабочем столе"; GroupDescription: "Дополнительно:"

; Пути относительно этой папки (installer\windows\) — два уровня вверх = корень архива
[Files]
Source: "..\..\backend\src\*"; DestDir: "{app}\backend\src"; Flags: recursesubdirs
Source: "..\..\backend\package.json"; DestDir: "{app}\backend"
Source: "..\..\backend\package-lock.json"; DestDir: "{app}\backend"
Source: "..\..\frontend\dist\*"; DestDir: "{app}\frontend\dist"; Flags: recursesubdirs
Source: "..\..\installer\windows\install.bat"; DestDir: "{app}\installer\windows"
Source: "..\..\installer\windows\start-narada.bat"; DestDir: "{app}\installer\windows"
Source: "..\..\installer\windows\uninstall.bat"; DestDir: "{app}\installer\windows"
Source: "..\..\installer\windows\diagnose.bat"; DestDir: "{app}\installer\windows"
Source: "..\..\README.md"; DestDir: "{app}"; Flags: skipifsourcedoesntexist

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\installer\windows\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\installer\windows\{#MyAppExeName}"; Tasks: desktopicon
Name: "{group}\Удалить {#MyAppName}"; Filename: "{app}\installer\windows\uninstall.bat"

[Run]
Filename: "{app}\installer\windows\install.bat"; Description: "Установить зависимости (~60 МБ)"; Flags: postinstall shellexec skipifsilent
Filename: "{app}\installer\windows\{#MyAppExeName}"; Description: "Запустить {#MyAppName}"; Flags: postinstall shellexec skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  if not RegKeyExists(HKLM, 'SOFTWARE\Node.js') and
     not RegKeyExists(HKCU, 'SOFTWARE\Node.js') then
  begin
    MsgBox('Node.js не обнаружен. Для работы нужен Node.js 18+.' + #13#10 +
           'Скачайте с nodejs.org и установите перед запуском приложения.',
           mbInformation, MB_OK);
  end;
end;
