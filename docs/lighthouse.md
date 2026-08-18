# Lighthouse

Ночная проверка: workflow [lighthouse](../.github/workflows/lighthouse.yml).

- Расписание: `0 2 * * *` (05:00 МСК).
- Вручную: Actions → **lighthouse** → Run workflow.
- Утром: открыть последний успешный run, вкладка **Summary** (оценки) и артефакт **lighthouse-report** (HTML/JSON, 14 дней).

Первый прогон: [run 32186156223](https://github.com/Box781/frontend-project-387/actions/runs/32186156223) (ручной `workflow_dispatch`). Страницы: `/`, `/book/intro-call`, `/admin`. Сервер — production-сборка UI + API на `127.0.0.1:3000`.

## Оценки

| URL | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/` | 76 | 100 | 100 | 90 |
| `/book/intro-call` | 68 | 100 | 100 | 90 |
| `/admin` | 76 | 100 | 100 | 90 |

Автоматические проверки доступности прошли. Календарь всё равно самый тяжёлый по Performance.

## Какие правки нужны

По отчёту, не по догадкам. Делать отдельными issue/PR, не в этом шаге.

1. **Meta description.** Аудит `Document does not have a meta description` на всех трёх URL. Без него SEO 90. Добавить описание в `frontend/index.html` (и при появлении уникальных title — своё на страницах).
2. **Сжатие и кэш статики.** `Enable text compression`, `Use efficient cache lifetimes`, `Serve static assets with an efficient cache policy`. Локальный/контейнерный Hono отдаёт JS/CSS без gzip и без `Cache-Control`. На Render часть этого может закрыть CDN, в Docker — нет. Имеет смысл сжимать `public` и кэшировать `/assets/*`.
3. **Лишний и блокирующий JS.** `Reduce unused JavaScript`, `Eliminate render-blocking resources`, слабые FCP/LCP. Календарь (`/book/intro-call`, Performance 68) тянет date-picker на весь бандл. Разрезать маршрут через `React.lazy` и не грузить admin-страницы гостю.
4. **Уникальный title.** Lighthouse не завалил `document-title`: везде есть «Call Booking». Для людей и SEO всё равно нужны заголовки вкладок по страницам — это уже пункт бэклога в [`roadmap.md`](roadmap.md).

Доступность календаря для скринридера в этом прогоне автоматом не красная. Если команда всё равно хочет подписи дней — это ручная проверка, не из JSON Lighthouse.
