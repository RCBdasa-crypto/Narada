; Скрипт Inno Setup для сборки setup.exe на Windows
; Скачайте Inno Setup: https://jrsoftware.org/isinfo.php
; Откройте этот файл в Inno Setup Compiler и нажмите Compile

#define MyAppName "Narada To-Do"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Narada"
#define MyAppURL "https://github.com/RCBdasa-crypto/Narada"
#define MyAppExeName "start-narada.bat"

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
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[Tasks]
Name: "desktopicon"; Description: "Создать ярлык на рабочем столе"; GroupDescription: "Дополнительно:"

[Files]
Source: "..\..\*"; DestDir: "{app}"; Excludes: "node_modules\*,release\*,.git\*,e2e-data\*,test-results\*,playwright-report\*,frontend\node_modules\*,backend\node_modules\*,*.db"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\installer\windows\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\installer\windows\{#MyAppExeName}"; Tasks: desktopicon
Name: "{group}\Удалить {#MyAppName}"; Filename: "{app}\installer\windows\uninstall.bat"

[Run]
Filename: "{app}\installer\windows\install.bat"; Description: "Установить зависимости и собрать приложение"; Flags: postinstall shellexec skipifsilent
Filename: "{app}\installer\windows\{#MyAppExeName}"; Description: "Запустить {#MyAppName}"; Flags: postinstall shellexec skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  if not RegKeyExists(HKLM, 'SOFTWARE\Node.js') and
     not RegKeyExists(HKCU, 'SOFTWARE\Node.js') then
  begin
    if MsgBox('Node.js не обнаружен. Для работы приложения нужен Node.js 18+.' + #13#10 +
              'Продолжить установку? (Node.js можно установить с nodejs.org)',
              mbConfirmation, MB_YESNO) = IDNO then
      Result := False;
  end;
end;
