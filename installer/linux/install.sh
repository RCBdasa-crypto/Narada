#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$APP_DIR"

echo "========================================"
echo "  Narada To-Do — установка"
echo "========================================"
echo
echo "Папка приложения: $APP_DIR"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "[ОШИБКА] Node.js не найден."
  echo "Установите Node.js 18+: https://nodejs.org/"
  exit 1
fi

echo "Node.js: $(node --version)"
echo

echo "[1/3] Установка зависимостей..."
npm install
npm install --prefix backend
npm install --prefix frontend

echo
echo "[2/3] Сборка интерфейса..."
npm run build --prefix frontend

echo
echo "[3/3] Создание команды запуска..."
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
echo "========================================"
echo "  Установка завершена!"
echo "========================================"
echo
echo "Запуск: narada-todo"
echo "        (если ~/.local/bin не в PATH — добавьте его)"
echo
echo "Или: ./installer/linux/start.sh"
echo "Браузер: http://localhost:3001"
echo
