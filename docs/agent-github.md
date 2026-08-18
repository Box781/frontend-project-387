# Агент в GitHub: проверка интеграции

Цель шага — не новые фичи, а устойчивый процесс: триггеры, права, расходы, уже пройденные сценарии.

Run-ы: [Actions](https://github.com/Box781/frontend-project-387/actions).  
OpenCode: [workflow opencode](https://github.com/Box781/frontend-project-387/actions/workflows/opencode.yml).  
Lighthouse: [workflow lighthouse](https://github.com/Box781/frontend-project-387/actions/workflows/lighthouse.yml).

## Триггеры

| Workflow | Когда запускается | Когда нет |
| --- | --- | --- |
| `opencode.yml` | Комментарий человека с `/oc` или `/opencode` (в начале или после пробела) в issue/PR или в review comment | Обычные комментарии без команды; ответы ботов (`github-actions[bot]`, `dependabot[bot]`, `user.type == Bot`) |
| `lighthouse.yml` | Cron раз в сутки `0 2 * * *` (05:00 МСК) или **Run workflow** | Push и PR |
| `release-please.yml` | Push в `main` | Комментарии |
| `e2e.yml` | Push и pull_request | Комментарии `/oc` |

Агент не подписан на каждый комментарий: без `/oc` job `if` сразу false. Ответ агента идёт от `github-actions[bot]` и не проходит фильтр ботов — самозапуска нет.

## Permissions

| Workflow | Права | Зачем |
| --- | --- | --- |
| OpenCode | `contents`, `pull-requests`, `issues`: write | Коммит, PR, комментарий в issue. `id-token` убран: работаем через `GITHUB_TOKEN`, не через OIDC App |
| Lighthouse | `contents: read` | Только checkout и артефакт |
| release-please | `contents`, `pull-requests`: write | Release-PR. `issues: write` не нужен |
| e2e | `contents: read` | Тесты не пишут в репозиторий |
| hexlet-check | не трогаем | Файл курса |

## Расходы

- OpenCode: модель `opencode/big-pickle` — для fix/PR нужна способность к коду; для одного explain тоже она, отдельный дешёвый workflow не заводили. `timeout-minutes: 20` и `share: false`.
- Lighthouse без LLM, один прогон ночью, не на каждый push.
- Смотреть минуты и логи: вкладка Actions, фильтр по имени workflow.

## Уже пройденные сценарии

1. Issue: [#1](https://github.com/Box781/frontend-project-387/issues/1) и [#2](https://github.com/Box781/frontend-project-387/issues/2) — `/oc explain` и план.
2. PR и ревью: агент открыл [#4](https://github.com/Box781/frontend-project-387/pull/4), доработал по двум `/oc` (общий + строка в diff), PR смёржен. См. [`pr-cycle.md`](pr-cycle.md).
3. Schedule: [lighthouse](https://github.com/Box781/frontend-project-387/actions/workflows/lighthouse.yml) — cron плюс ручной [run 32186156223](https://github.com/Box781/frontend-project-387/actions/runs/32186156223).

## Самооценка

С первого прохода:

- Triage issue #2: explain и план без правок кода — сразу полезная постановка.
- Ручной Lighthouse: отчёт и артефакт с первого `workflow_dispatch`.
- Conventional Commits на фикс-PR агента (`fix: …`).

Несколько итераций:

- Первый `/oc` (issue #1): OIDC GitHub App упал (`p.rest`) — перешли на `GITHUB_TOKEN`.
- `/oc fix` по #2: первый run завис ~20 мин, отменили; второй открыл PR.
- Ревью в той же ветке: `git push` не проходил, пока checkout не получил `persist-credentials`.

Итог: разбор и отчёты чаще сходятся с первого раза; запись в репозиторий (ветка, PR, push) потребовала настройки токена. Это ожидаемо: модель отвечает быстро, а права GitHub — отдельно.
