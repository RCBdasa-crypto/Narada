# Деплой Narada To-Do на сервер

Приложение разворачивается на `109.196.102.114` в `/opt/narada-todo` и доступно по адресу:

**https://todo-app.shastrasevaka.ru**

## Автоматический деплой (GitHub Actions)

Добавьте в **Settings → Secrets and variables → Actions** репозитория:

| Secret | Значение |
|--------|----------|
| `SSH_HOST` | `109.196.102.114` |
| `SSH_USER` | ваш SSH-пользователь (например `root`) |
| `SSH_PRIVATE_KEY` | приватный SSH-ключ (полный PEM) |
| `SSH_PORT` | `22` (опционально) |

После настройки секретов:
1. Сделайте push в `main`, или
2. Запустите workflow **Deploy** вручную (Actions → Deploy → Run workflow)

## Ручной деплой на сервере

Подключитесь к серверу по SSH и выполните:

```bash
curl -fsSL https://raw.githubusercontent.com/RCBdasa-crypto/Narada/main/deploy/deploy.sh | bash
```

Или:

```bash
git clone https://github.com/RCBdasa-crypto/Narada.git /opt/narada-todo
cd /opt/narada-todo
docker compose build
docker compose up -d
```

## Архитектура (не затрагивает другие сайты)

- Приложение слушает только `127.0.0.1:3010` (не занимает 80/443)
- Traefik проксирует `todo-app.shastrasevaka.ru` → `127.0.0.1:3010`
- `shastrasevaka.ru` и другие проекты продолжают работать через свой nginx/Traefik

## Данные

- SQLite: Docker volume `todo-data`
- Файлы: Docker volume `todo-uploads`

Данные сохраняются между перезапусками контейнера.

## Проверка

```bash
curl -I https://todo-app.shastrasevaka.ru/
curl https://todo-app.shastrasevaka.ru/api/todos
```
