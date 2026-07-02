# AGENTS.md

## Cursor Cloud specific instructions

Narada is a To-Do app with notes and file attachments. Two services in dev:

- **Backend** — Node.js + Express + SQLite (`better-sqlite3`), serves the API on port `3001`. Source in `backend/src`. Data is written to `backend/data/todos.db` and uploads to `backend/uploads/` (both gitignored).
- **Frontend** — React + Vite dev server on port `5173`, proxies `/api` and `/uploads` to `http://localhost:3001` (see `frontend/vite.config.js`).

Dependencies are installed per-package (`backend/`, `frontend/`, and root each have their own `package-lock.json`); the update script handles refreshing them.

### Run / build / test (commands live in the root `package.json` and `README.md`)

- Run both dev servers together: `npm run dev` (uses `concurrently`; backend via `node --watch`, frontend via `vite`). Open the app at `http://localhost:5173`.
- Unit tests: `npm test` (backend Jest + frontend Vitest). There is **no lint script** configured in this repo.
- E2E tests: `npm run test:e2e` (Playwright). Requires the chromium browser: `npx playwright install --with-deps chromium`. The Playwright config builds the frontend and starts the backend in production mode on port `3001` itself, so the test harness serves the built UI + API from one process — do not start a separate server on `3001` while running E2E (it reuses an existing server only when `CI` is unset).

### Non-obvious notes

- In dev, the backend only mounts the API (`/api/todos`) and `/uploads`; it does NOT serve the React UI. Static frontend serving is gated behind `NODE_ENV=production` (see `backend/src/server.js`), which is how the Docker image and Playwright run it. For manual dev, always use the Vite server on `5173`.
- Storage locations are overridable via `DATA_DIR` and `UPLOADS_DIR` env vars; production/Docker uses `/app/data` and `/app/uploads`.
