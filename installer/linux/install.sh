#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$APP_DIR"

echo "========================================"
echo "  Narada To-Do — установка (lite)"
echo "========================================"
echo "Папка: $APP_DIR"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "[ОШИБКА] Node.js не найден. Установите Node.js 18+"
  exit 1
fi

if [ ! -f "$APP_DIR/frontend/dist/index.html" ]; then
  echo "[ОШИБКА] Нет frontend/dist/. Скачайте lite-архив с GitHub Releases."
  exit 1
fi

echo "[1/2] Установка серверных зависимостей (только runtime)..."
npm install --omit=dev --prefix backend

echo "[2/2] Создание команды запуска..."
INSTALL_BIN="$HOME/.local/bin"
mkdir -p "$INSTALL_BIN"

cat > "$INSTALL_BIN/narada-todo" << EOF
#!/usr/bin/env bash
cd "$APP_DIR"
export NODE_ENV=production
export DATA_DIR="$APP_DIR/backend/data"
export UPLOADS_DIR="$APP_DIR/backend/uploads"
export FRONTEND_DIST="$APP_DIR/frontend/dist"
xdg-open http://localhost:3001 >/dev/null 2>&1 || true
node backend/src/server.js
EOF

chmod +x "$INSTALL_BIN/narada-todo"

echo
echo "Готово! Запуск: narada-todo"
echo "Размер после установки: ~60-80 МБ"
echo
