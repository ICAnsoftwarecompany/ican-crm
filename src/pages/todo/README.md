# pages/todo — "My to-do list" (`/todo`)

> **Documentation update:** 2026-10-02 03:00 (Africa/Cairo) — folder created (To-Do separated from `/tasks`).

**Owns:** the route page `TodoPage.jsx` only — route composition, no business logic.

**What it shows:** the signed-in user's **To-Dos** (`type: 'todo'`, never other tasks): a page header with
**New to-do** (opens the short To-Do form preset to the open tab), and the To-Do list (Today / This week /
This month / Overdue, quick add, tick to complete). `?taskId=` opens the task drawer, which edits a To-Do with the
To-Do form.

**Built from** `features/tasks` public exports: `useTodoList`, `TodoPanelView`, `TodoFormDialog`, `TaskDrawer`.
Rules and the form model live there (`utils/todoPeriods.js`, `utils/todoForm.js`) — see
[features/tasks/README.md](../../features/tasks/README.md) and the spec
[docs/tasks/TASKS-TODO-SPEC.md](../../../docs/tasks/TASKS-TODO-SPEC.md).

**Navigation:** main sidebar → Workspace → **قائمة مهامي / My to-do list** (`ClipboardCheck`), right under Tasks.
The header has its own To-Do button and side panel (`TodoNavbarButton`, `TodoSidebarPanel`). The old
`/tasks?smart=todo` link redirects here.

**Known gaps:** same as the To-Do list (client-side "mine" from the latest 200 tasks, periods not stored by the
backend yet); not visually verified with real data.
