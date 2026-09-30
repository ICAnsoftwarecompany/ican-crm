# pages/my-work — My Work route

> **Documentation update:** 2026-10-01 00:55 (Africa/Cairo) — folder created.

| File | Route | What it does |
|---|---|---|
| `MyWorkPage.jsx` | `/my-work` | Sets the page header, reads the viewer's focus (`useMyWorkFocus`) and the tenant modules (`authStore.user.modules`), then composes `MyWorkFocusTabs`, `MyWorkSummary` and `MyWorkBoard` from `features/my-work`. |

Thin by design: every rule, section and data hook lives in [`features/my-work`](../../features/my-work/README.md).
Navigation entry: Overview → `nav.myWork` in `app/navigation/navigation.config.js`.
