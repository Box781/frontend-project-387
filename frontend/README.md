# Frontend

Vite + React + TypeScript + shadcn/ui. Данные только через HTTP API по контракту из `../api-contract`.

## Запуск

В одном терминале — бэкенд:

```bash
cd ../backend && npm run dev
```

В другом — UI:

```bash
cp .env.example .env
npm run dev
```

UI: http://localhost:5173  
API: http://localhost:3000

## Страницы

| URL | Кто | Что делает |
| --- | --- | --- |
| `/` | Гость | Список типов встреч |
| `/book/:eventTypeId` | Гость | Календарь, слоты, форма записи |
| `/booked` | Гость | Подтверждение |
| `/admin` | Владелец | Предстоящие встречи |
| `/admin/event-types` | Владелец | Создание типов событий |
