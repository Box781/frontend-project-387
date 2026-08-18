### Hexlet tests and linter status:
[![Actions Status](https://github.com/Box781/frontend-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Box781/frontend-project-387/actions)

# Call Booking

Упрощённый сервис записи на звонок по мотивам [Cal.com](https://cal.com). Разработка идёт Design First: сначала API-контракт, затем фронтенд и бэкенд по нему.

Контракт: [`api-contract/`](api-contract/).  
Интерфейс: [`frontend/`](frontend/).  
Бэкенд: [`backend/`](backend/).  
E2E: [`e2e/`](e2e/). Коммиты: [`docs/commits.md`](docs/commits.md).  
План развития (фичи и баги для агента): [`docs/roadmap.md`](docs/roadmap.md).

Локально: `make backend` и в другом терминале `make frontend`.  
Сценарии бронирования: `make e2e`.

## Docker

Образ собирает UI и API в один контейнер. Приложение слушает `HOST=0.0.0.0` и порт из `PORT`.

```bash
docker build -t call-booking .
docker run --rm -e PORT=8080 -p 8080:8080 call-booking
```

Откройте http://localhost:8080.

## Деплой

Публичная ссылка: [https://call-booking-jey6.onrender.com](https://call-booking-jey6.onrender.com)

Сервис на Render, Free, Docker runtime. Слушает `PORT`, который задаёт платформа.

