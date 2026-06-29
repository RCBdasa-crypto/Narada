#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$APP_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js не найден. Сначала запустите: ./installer/linux/install.sh"
  exit 1
fi

if [ ! -f "$APP_DIR/frontend/dist/index.html" ]; then
  echo "Сначала выполните установку: ./installer/linux/install.sh"
  exit 1
fi

export NODE_ENV=production
export DATA_DIR="$APP_DIR/backend/data"
export UPLOADS_DIR="$APP_DIR/backend/uploads"
export FRONTEND_DIST="$APP_DIR/frontend/dist"

(xdg-open http://localhost:3001 >/dev/null 2>&1 || open http://localhost:3001 >/dev/null 2>&1) &
node backend/src/server.js
