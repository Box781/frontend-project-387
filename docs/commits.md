# Conventional Commits

Все коммиты, включая коммиты агента, следуют [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional-scope): <description>
```

Типы: `feat`, `fix`, `docs`, `ci`, `chore`, `refactor`, `test`.

Примеры:

- `feat: add in-memory booking API`
- `fix: reject overlapping slots across event types`
- `ci: run Playwright on pull requests`
- `docs: describe booking e2e scenarios`

`feat` повышает MINOR, `fix` — PATCH, `feat!` или `BREAKING CHANGE` — MAJOR.

По этим сообщениям [release-please](https://github.com/googleapis/release-please) открывает release-PR с changelog и новой версией после пуша в `main`.
