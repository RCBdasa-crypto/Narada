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
- **База данных:** SQLite (встроенный модуль Node.js `node:sqlite`)
- **Тесты:** Jest (backend), Vitest (frontend), Playwright (E2E)

## Локальный запуск

```bash
npm run install:all
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001/api/todos

## Установка на компьютер (установочный файл)

### Почему установщик мог быть огромным (4+ ГБ)?

Если **setup.exe** или zip весит гигабайты — в него случайно попали папки **`node_modules`** (сотни МБ–ГБ) и dev-инструменты (Playwright, тесты). Само приложение — **~1–3 МБ** в архиве, после установки **~60–80 МБ**.

**Используйте lite-версию** с GitHub Releases (без node_modules).

### Вариант 1 — лёгкий архив (~200 КБ)

**Скачать:** https://github.com/RCBdasa-crypto/Narada/releases/download/v1.0.1/Narada-Todo-1.0.1-lite.zip

В архиве есть `installer\windows\Narada-Setup.iss` для Inno Setup.

**Windows:** распакуйте → `installer\windows\install.bat` → ярлык на рабочем столе.

**Linux:** `./installer/linux/install.sh` → команда `narada-todo`.

При установке скачается ~60 МБ серверных зависимостей (нужен **Node.js 22.5+** — без Python и компилятора C++).

### Вариант 2 — setup.exe (~1–3 МБ)

1. Скачайте **lite**-архив и распакуйте
2. Установите [Inno Setup](https://jrsoftware.org/isinfo.php)
3. Откройте **`installer\windows\Narada-Setup.iss`** (файл уже в архиве)
4. **Build → Compile** → `release\Narada-Todo-Setup-1.0.0.exe`

> **Важно:** не компилируйте setup.exe из папки, где уже есть `node_modules` — используйте обновлённый `.iss` с явным списком файлов.

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
