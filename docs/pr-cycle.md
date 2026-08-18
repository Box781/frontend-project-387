# Цикл issue → PR → review → merge

Issue: [#2 время в календаре какое-то странное](https://github.com/Box781/frontend-project-387/issues/2)

## Что произошло

1. `/oc fix this` в issue — агент открыл [PR #4](https://github.com/Box781/frontend-project-387/pull/4) с `Closes #2` и коммитом `fix: show booking slots in UTC`.
2. Ревью двумя типами комментариев с `/oc`:
   - общий в обсуждении PR: суффикс UTC на кнопках слотов;
   - к строке в `frontend/src/lib/dates.ts`: `toUtcDate` без `getTimezoneOffset`.
3. Агент пушнул в ту же ветку: `fix: use UTC components in toUtcDate and add UTC suffix to slot buttons`.
4. PR смёржен, issue закрыт.
5. [release-please PR #3](https://github.com/Box781/frontend-project-387/pull/3) обновил changelog секции Bug Fixes, предложенная версия `1.0.0` (уже была из `feat: import`, `fix` в том же релизе не поднимает major).
