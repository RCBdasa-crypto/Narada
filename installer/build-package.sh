#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="1.0.0"
OUT_DIR="$ROOT/release"
ARCHIVE="Narada-Todo-${VERSION}"

echo "==> Сборка установочного архива $ARCHIVE.zip"
mkdir -p "$OUT_DIR"

STAGING="$OUT_DIR/$ARCHIVE"
rm -rf "$STAGING"
mkdir -p "$STAGING"

tar -cf - -C "$ROOT" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='release' \
  --exclude='e2e-data' \
  --exclude='test-results' \
  --exclude='playwright-report' \
  --exclude='backend/data' \
  --exclude='backend/uploads' \
  --exclude='*.db' \
  . | tar -xf - -C "$STAGING"

chmod +x "$STAGING/installer/linux/"*.sh
chmod +x "$STAGING/installer/build-package.sh" 2>/dev/null || true

cd "$OUT_DIR"
rm -f "${ARCHIVE}.zip"
zip -r "${ARCHIVE}.zip" "$ARCHIVE" -q

echo "==> Готово: $OUT_DIR/${ARCHIVE}.zip"
ls -lh "$OUT_DIR/${ARCHIVE}.zip"
echo
echo "Windows: распакуйте архив и запустите installer\\windows\\install.bat"
echo "Linux:   распакуйте и выполните ./installer/linux/install.sh"
echo "setup.exe: откройте installer/windows/Narada-Setup.iss в Inno Setup Compiler"
