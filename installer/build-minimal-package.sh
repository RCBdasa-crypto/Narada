#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="1.0.0"
OUT_DIR="$ROOT/release"
ARCHIVE="Narada-Todo-${VERSION}-lite"

echo "==> Сборка ЛЁГКОГО установочного архива (без node_modules)"
mkdir -p "$OUT_DIR"

# Собираем фронтенд заранее — пользователю не нужен npm install для frontend
echo "==> Сборка frontend..."
npm run build --prefix "$ROOT/frontend" >/dev/null

STAGING="$OUT_DIR/$ARCHIVE"
rm -rf "$STAGING"
mkdir -p "$STAGING/backend/src" "$STAGING/frontend/dist" "$STAGING/installer/windows" "$STAGING/installer/linux"

cp -r "$ROOT/backend/src/"* "$STAGING/backend/src/"
cp "$ROOT/backend/package.json" "$ROOT/backend/package-lock.json" "$STAGING/backend/"
cp -r "$ROOT/frontend/dist/"* "$STAGING/frontend/dist/"
cp "$ROOT/installer/windows/"*.bat "$STAGING/installer/windows/"
cp "$ROOT/installer/windows/Narada-Setup.iss" "$STAGING/installer/windows/"
cp "$ROOT/installer/windows/README-InnoSetup.txt" "$STAGING/installer/windows/"
cp "$ROOT/installer/linux/"*.sh "$STAGING/installer/linux/"
cp "$ROOT/README.md" "$STAGING/"

chmod +x "$STAGING/installer/linux/"*.sh

cd "$OUT_DIR"
rm -f "${ARCHIVE}.zip"
zip -r "${ARCHIVE}.zip" "$ARCHIVE" -q

SIZE=$(du -h "${ARCHIVE}.zip" | cut -f1)
echo "==> Готово: $OUT_DIR/${ARCHIVE}.zip ($SIZE)"
echo
echo "Этот архив НЕ содержит node_modules."
echo "После распаковки запустите installer\\windows\\install.bat (~60 МБ загрузки)."
