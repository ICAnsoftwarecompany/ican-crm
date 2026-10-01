# features/tasks — Tasks and To-Do

> **Documentation update:** 2026-10-02 02:40 (Africa/Cairo) — F2: `EntityTasksPanel`, `CreateTaskButton`, `TaskablePicker`, `useEntityTasks`, registry `getPath`/`fromRecord`, Linked-to filter (§2, §3, §4, §6, §7).
> 2026-10-02 01:35 (Africa/Cairo) — README created with the To-Do (F1) work: taskable
> registry, To-Do periods, shared payload builder, To-Do panel, new form fields.

**Status:** CURRENT for tasks; To-Do **PARTIAL** (works on today's API; periods and "mine" are computed client-side
until the backend contract in the spec lands).

**Full spec (Arabic, includes the backend contract):** [docs/tasks/TASKS-TODO-SPEC.md](../../../docs/tasks/TASKS-TODO-SPEC.md)
· summary in [docs/3-FEATURES.md → Tasks](../../../docs/3-FEATURES.md#tasks).

## 1. What it owns

- The task domain on `/api/tenant/tasks`: list, create, update, status, read, assignees, notes, attachments.
- **To-Do = a task with `type: 'todo'`**, usually personal (no taskable), that may belong to a **period**
  (day / week / month) instead of an exact time. Same model, same endpoints — no separate API.
- The **taskable registry**: which CRM records a task can be linked to (lead, customer, …) and how they are sent.
- UI: `/tasks` workspace (smart views incl. **My to-do list**, list / board / calendar), `TaskDrawer`, `TaskForm`,
  header button + sidebar panel, and the reusable **To-Do panel** used by `/tasks?smart=todo` and My Work.

## 2. Folder map

| Path | Owns |
|---|---|
| `index.js` | Public API (§4). Other features import from here only. |
| `api/tasksApi.js` | HTTP calls (form-data for create/update). Unchanged endpoints. |
| `hooks/useTasks.js` | `useTasks(params)`, `useTaskInfo`, `useTaskMutations` (invalidate tasks, leads, customers). |
| `hooks/useTodoList.js` | `useTodoList(view)` → `{ groups, counts, quickAdd, toggleDone, pendingIds, isLoading, error, refetch, isAdding }`. Shares the `{ per_page: 200 }` cache with the calendar and My Work. |
| `hooks/useEntityTasks.js` | `useEntityTasks(type, id)` → `{ open, closed, toggleDone, … }` for one record (same params/cache key the drawer always used); `splitEntityTasks` keeps only tasks really linked to it. Tested. |
| `hooks/useCurrentUserId.js` | Signed-in user id from `authStore`. |
| `constants/taskableTypes.js` | Taskable registry: `registerTaskableType`, `resolveTaskableAlias`, `toBackendTaskableType`, `getTaskTaskable`, `buildTaskablePayload`. Tested. |
| `utils/taskMeta.js` | Labels/meta, `getTaskDateTime`, **`getTaskDeadline`** (date-only = end of day), `isTaskOverdue` (closed tasks never overdue). |
| `utils/todoPeriods.js` | Period ranges (week starts Saturday), `buildTodoSchedule`, `groupTodoItems(view)`, `isTaskOnMyList`. Tested. |
| `utils/taskPayload.js` | `buildTaskPayload(form)` / `taskToFormValues(task)` — the only place request bodies are built (form, quick add, calendar drag). Tested. |
| `components/TaskForm.jsx` + `components/form/` | Form; `TaskLinkFields` (linked to + record no.), `TaskScheduleFields` (date/time, or To-Do period). |
| `components/TaskDrawer.jsx` | Details, edit, status, notes, attachments; shows `TaskLinkChip` and the period badge. |
| `components/TaskLinkChip.jsx` | "Lead #15 · name" / "Personal"; a link to the record page when `getPath` resolves (`linkable={false}` inside buttons). |
| `components/entity/` | `EntityTasksPanel` (a record's tasks + quick actions + drawer; customer drawer Tasks tab), `CreateTaskButton` (form opened linked, typed and pre-titled; also in the conversation header). Tested. |
| `components/form/TaskablePicker.jsx` | Leads Center search (`useCustomers` from `features/customers`) → id via the type's `fromRecord`; a typed number can be used as-is. |
| `components/todo/` | `TodoPanel` (owns view), `TodoPanelView` (presentational, tested), `TodoViewTabs`, `TodoQuickAdd`, `TodoItemRow`. |
| `components/board/`, `workspace/`, `TaskKanbanView`, `TaskCalendarView`, `TasksNavbarButton`, `TasksSidebarPanel` | Existing workspace UI (boards are static, see gaps). |
| `repositories/taskBoardRepository.js` | Static board/list definitions. |
| `workflow/taskWorkflowDefinition.js` | Workflow-engine module definition. |

Route page: `pages/tasks/TasksPage.jsx` (`?view=list|board|calendar`, `?taskId=`, `?smart=todo`).

## 3. Rules (tested)

| Rule | Where |
|---|---|
| A period To-Do is saved with `due_date` = last day of the period, `due_time` = '', `period_type`, `period_date` = first day | `buildTodoSchedule` |
| Week starts Saturday (`DEFAULT_WEEK_START = 6`) for every user, so a "week" To-Do means the same for the whole team | `todoPeriods.js` |
| Deadline: date + time, or end of day when there is no time. Overdue = deadline passed and not completed/cancelled | `taskMeta.js` |
| On my list: I am the assignee / in `users[]`, or I created it and it has no users | `isTaskOnMyList` |
| A To-Do with no users is assigned to the current user; default visibility `private` | `buildTaskPayload`, `TaskForm` |
| No link → `taskable_type: ''` and `taskable_id: ''` (never a lead with an empty id) | `buildTaskablePayload` |
| Groups per view: overdue · timed · untimed · carried (today only, needs `period_type` from the backend) · done | `groupTodoItems` |
| Dragging a period To-Do in the calendar turns it into a dated To-Do | `calendar/adapters/taskEventAdapter.js` |
| A Leads Center record links through its lead: `lead.id` → `lead_id` → record id | `taskableFromCrmRecord` |
| A record's tasks never include personal tasks or other records, even if the backend ignores the filter | `splitEntityTasks` / `isTaskLinkedTo` |

## 4. Public API

```js
import {
  useTasks, useTaskMutations, useTodoList,
  TaskDrawer, TaskLinkChip, TodoPanel, TodoPanelView,
  EntityTasksPanel, CreateTaskButton, useEntityTasks,
  taskableFromCrmRecord, isTaskLinkedTo, getTaskLinkPath,
  getTaskDateTime, getTaskDeadline, getTaskDueDate, isTaskClosed, isTaskCompleted, isTaskOverdue,
  registerTaskableType, getTaskableTypes, resolveTaskableAlias, toBackendTaskableType,
  getTaskTaskable, isPersonalTask, buildTaskablePayload,
  buildTaskPayload, taskToFormValues, TASK_FORM_DEFAULTS,
  buildTodoSchedule, getPeriodRange, groupTodoItems, TODO_PERIODS, TODO_VIEWS,
} from '../tasks' // or '@/features/tasks'
```

Using the To-Do list somewhere else (My Work does this):

```jsx
const [view, setView] = useState('today')
const todo = useTodoList(view)
return <TodoPanelView todo={todo} view={view} onViewChange={setView} onOpenTask={openTask} maxRows={6} />
```

## 5. How to extend

- **Link tasks to a new entity:** `registerTaskableType({ id: 'deal', model: 'App\\Models\\Deal', labelKey:
  'tasks.taskable.types.deal', getPath: (link) => `/deals/${link.id}` })` and add the label in `ar` + `en`. Form,
  chip, filter and payload pick it up; add `fromRecord` only if the type can be picked from Leads Center records.
- **Tasks on a new record page:** `<EntityTasksPanel taskable={{ type: 'deal', id, name }} />`, or a single
  `<CreateTaskButton taskable={…} action="call" />`.
- **Backend adopts a morph map:** set each entry's `model` to the alias — nothing else changes.
- **New To-Do view or group:** add it in `todoPeriods.js` (+ test), the tab label under `tasks.todo.views.*`, and the
  group under `tasks.todo.groups.*`.
- **New field on every task request:** add it to `TASK_FORM_DEFAULTS`, `taskToFormValues` and `buildTaskPayload`
  (+ test), then to the form.

## 6. Known gaps

- "Mine", periods and views are computed client-side from the latest 200 tasks; server filters are backend phase B1.
- `period_type` / `period_date` are sent but not stored by the current backend; the "carried" group and the period
  badge appear only once the backend returns them.
- Update uses `PUT` with form-data (PHP does not parse multipart on PUT) — must be confirmed on the backend.
- Boards, board lists and ordering are static (`taskBoardRepository`); `position` ordering needs the backend.
- Lead chips open the record only when the backend sends `taskable.customer_id`; conversation customers link by customer id when no `lead_id` is sent (see spec §9).
- One reminder per task; no checklist, recurrence, outcome-on-complete or bulk endpoints yet (backend B2/B3).
- Not visually verified with real data (no backend/login in the build environment).

## 7. Change log

| When | Change |
|---|---|
| 2026-10-02 02:40 (Africa/Cairo) | F2: `EntityTasksPanel` replaces the customer drawer's mini Tasks tab (old files and `customers.tasksTab.*` removed); `CreateTaskButton` quick actions (drawer + conversation header); `TaskablePicker`; `/tasks` Linked-to filter; chip links; `useCustomers` gained an `options` arg and `features/customers/index.js`. |
| 2026-10-02 01:35 (Africa/Cairo) | README created. F1: taskable registry, To-Do periods and groups, deadline rule, shared payload builder, form link/timing fields, To-Do panel in `/tasks?smart=todo` and My Work, link/period badges in the drawer, no default lead link on board quick-add and calendar drag; tests. |
