FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm install --prefix backend && npm install --prefix frontend

COPY backend ./backend
COPY frontend ./frontend

RUN npm run build --prefix frontend

FROM node:22-alpine

WORKDIR /app

COPY backend/package.json ./backend/
RUN npm install --omit=dev --prefix backend

COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/data /app/uploads

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data
ENV UPLOADS_DIR=/app/uploads
ENV FRONTEND_DIST=/app/frontend/dist

EXPOSE 3001

CMD ["node", "backend/src/server.js"]
