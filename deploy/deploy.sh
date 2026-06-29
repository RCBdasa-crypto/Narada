#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/narada-todo}"
REPO_URL="${REPO_URL:-https://github.com/RCBdasa-crypto/Narada.git}"
BRANCH="${BRANCH:-main}"

echo "==> Deploying Narada To-Do to ${APP_DIR}"

mkdir -p "$(dirname "$APP_DIR")"

if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

docker compose pull 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo "==> Deployment complete"
docker compose ps
