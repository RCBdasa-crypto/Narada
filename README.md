# Narada — To-Do с заметками

Веб-приложение для ведения списка дел с заметками и вложениями.

**Демо:** https://todo-app.shastrasevaka.ru

**Репозиторий:** https://github.com/RCBdasa-crypto/Narada

## Возможности

- CRUD по записям (создание, редактирование, удаление)
- Заголовок и текст заметки
- Прикрепление файлов и изображений
- Превью изображений в списке дел
- Хранение данных на сервере (SQLite + файловое хранилище)

## Стек

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **База данных:** SQLite (better-sqlite3)
- **Тесты:** Jest (backend), Vitest (frontend), Playwright (E2E)

## Локальный запуск

```bash
npm run install:all
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001/api/todos

## Тесты

```bash
npm test           # unit-тесты
npm run build --prefix frontend
npm run test:e2e   # E2E (Playwright)
```

## Деплой

Приложение разворачивается через Docker Compose на порту `127.0.0.1:3010` и проксируется Traefik на `todo-app.shastrasevaka.ru`.

```bash
./deploy/deploy.sh
```

Автодеплой настроен через GitHub Actions (`.github/workflows/deploy.yml`).

## Структура проекта

```
backend/     — Node.js API
frontend/    — React UI
e2e/         — Playwright E2E тесты
deploy/      — скрипты и конфиги деплоя
```
