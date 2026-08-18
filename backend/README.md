# Backend

TypeScript + [Hono](https://hono.dev), данные в памяти. API совпадает с [`../api-contract`](../api-contract). После перезапуска хранилище сбрасывается; при старте создаются типы `intro-call` и `demo`.

```bash
npm ci
npm run dev
```

Сервер: http://localhost:3000. Слушает `HOST` (по умолчанию `0.0.0.0`) и `PORT` (по умолчанию `3000`).

Фронтенд: `VITE_API_BASE_URL=http://localhost:3000`.

В продакшен-образе задайте `PUBLIC_DIR` на собранный UI (`frontend/dist`) — сервер отдаёт SPA с того же порта.
