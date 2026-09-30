# features/my-work — "My Work" (شغلي)

> **Documentation update:** 2026-10-01 00:55 (Africa/Cairo) — folder created.

**Status:** PARTIAL — page, sections, registry and tests are live on real APIs (activities, tasks, my-leads,
conversations, team chat, Customer Hub read model). "Mine" filtering is client-side and roles come from a
viewer-chosen focus, because the backend does not send roles/modules yet (see [Known gaps](#known-gaps)).

**Route:** `/my-work` (`pages/my-work/MyWorkPage.jsx`) · **Main sidebar:** Overview → **شغلي / My work**, right
under the Dashboard · **Strings:** `myWork.*` (`src/locales/{ar,en}/myWork.js`), nav label `nav.myWork`.

---

## 1. What it is and why it lives here

One page that answers the employee's first question of the day: **"what do I need to do now?"**. It pulls
everything assigned to the signed-in user from every area into one screen, so a salesperson or a service agent
does not jump between the Leads Center, Calls, Meetings, Tasks, the Customer Hub and the inboxes.

It is deliberately **not** under Sales or the Customer Hub:

- the same person often works leads **and** service cases;
- calls, meetings, tasks and messages belong to everyone;
- a tenant on a plan without Sales (or without the Customer Hub) must still have the page.

So it sits in the Overview section of the main sidebar, and **what it shows depends on the viewer** (focus +
tenant modules), not on where it is in the navigation.

The Customer Hub keeps its own full list at `/service/my-work` (backend read model, spec §20.2). My Work shows a
preview of it and links there. The Customer Hub nav label was renamed to **"شغل خدمة العملاء" / "Service work"**
so there are no two items called "شغلي".

## 2. What the page shows

```
┌ Header: title · subtitle · focus switch [All | Sales | Customer service] ┐
├ Summary tiles: Overdue · Today's calls & meetings · Tasks due · Unread    ┤  (each tile jumps to its section)
├ Overdue (wide)                                                             ┤
├ Today's calls & meetings            │ My tasks due                         ┤
├ Newest leads assigned to me (Sales) │ Customer service work (Service)      ┤
└ Messages (WhatsApp · Messenger · Gmail · Team chat)                        ┘
```

| Section id | Title (ar) | Shown for focus | Module gate | Data source | Row click |
|---|---|---|---|---|---|
| `overdue` | المتأخر | all, sales, service | — | my activities + my tasks, `isOverdueActivity` / `isTaskOverdue` | activity → `ActivityPreviewDrawer`, task → `TaskDrawer` |
| `today` | مكالمات واجتماعات اليوم | all, sales, service | — | my open activities starting today | `ActivityPreviewDrawer` |
| `tasks` | مهامي المستحقة | all, sales, service | — | my open tasks due by end of today | `TaskDrawer` |
| `leads` | أحدث العملاء المحتملين المسندين لي | all, sales | `sales` | `GET /api/tenant/sales/dashboard/my-leads` (`useSalesDashboard`) | `/leads/:customerId` (or `/LeadsCenter` when the id is missing) |
| `service` | طلبات وأعمال خدمة العملاء | all, service | `customer_service` | `GET /api/tenant/my-work` via the Customer Hub `MyWorkList` (lazy) | the item's own link |
| `messages` | الرسائل | all, sales, service | — | `useConversationUnreadSummary` + `useChatUnreadCount` | the matching inbox |

**Summary tiles:** overdue = overdue activities + overdue tasks; today = today's activities; tasks = tasks due;
unread = customer channels + team chat.

## 3. Rules (single place: `utils/myWorkItems.js`, fully tested)

| Rule | Definition |
|---|---|
| **My activity** | I am `assignedUser` **or** one of `participants` (any shape: id, `{ id }`, `{ user: { id } }`). This covers internal meetings with no single assignee. |
| **My task** | I am `user` / `assigned_user` / `assignedTo` / `assigned_to` / `user_id`, or in `users[]`. |
| **Open** | status is not `completed` / `cancelled` (case-insensitive). |
| **Today's activity** | open and `startAt` is on today's calendar date; sorted by time. |
| **Task due** | open and due date+time ≤ end of today; sorted oldest first. **Undated tasks are left out** on purpose. |
| **Overdue** | activities: `isOverdueActivity` from `features/activities`; tasks: `isTaskOverdue` from `features/tasks`. Merged, oldest first. |
| **Current user** | `authStore.user.id` (falls back to `user_id` / `userId`). |

Rows past their time are shown in the danger tone; today's activities that already started but are still
`scheduled` are also flagged.

## 4. Focus and modules

- **Focus** (`constants/myWorkFocus.js`): `all` (default), `sales`, `service`. Chosen by the viewer and saved in
  `localStorage` (`ican-crm:my-work:focus`) by `useMyWorkFocus`. `all` shows every section; `sales`/`service` show
  sections whose `focuses` include it. Sections for everyone use `FOCUS_EVERYONE`.
- **Modules:** a section with `module` is hidden only when the backend sends `user.modules` **and** the module is
  missing — same inert-until-backend rule as the main navigation. Hiding is UX only, never authorization.
- When the backend sends roles, pick the default focus from the role in `useMyWorkFocus` — nothing else changes.

## 5. Folder map

| Path | Owns |
|---|---|
| `index.js` | Public API (below). Import from here only. |
| `constants/myWorkFocus.js` | Focus ids, `FOCUS_EVERYONE`, storage key, `MY_WORK_ROUTE`. |
| `registry/myWorkRegistry.js` | `registerMyWorkSection`, `getMyWorkSections({ focus, enabledModules })`, module gating. Tested. |
| `config/registerBuiltinSections.js` | Side-effect registration of the six built-in sections (id, order, size, focuses, module). |
| `utils/myWorkItems.js` | Pure rules of §3. Tested (`myWorkItems.test.js`). |
| `hooks/useCurrentUserId.js` | Current user id from `authStore`. |
| `hooks/useMyActivities.js` | `{ mine, today, overdue, isLoading, error, refetch }` from `useActivities({ per_page: 200 })`. |
| `hooks/useMyTasks.js` | `{ mine, due, overdue, … }` from `useTasks({ per_page: 200 })`. |
| `hooks/useMyWorkFocus.js` | Focus state (localStorage). |
| `hooks/useMyWorkPreview.jsx` | Opens an activity/task in its existing drawer in place: `{ openActivity, openTask, drawers }`. |
| `components/MyWorkSectionCard.jsx` | Card shell: icon, title, count badge, "view all", loading / error / empty states. |
| `components/MyWorkItemRow.jsx` | `MyWorkItemList` + `MyWorkItemRow` (link or button row, time, danger tone). |
| `components/MyWorkSummary.jsx` | The four summary tiles. |
| `components/MyWorkFocusTabs.jsx` | The focus switch (radio group). |
| `components/MyWorkBoard.jsx` | Renders registered sections for the focus in a 2-column grid (`size: 'wide'` spans both). |
| `sections/*.jsx` | One file per section (§2). |

Route page: [`pages/my-work/`](../../pages/my-work/README.md).

## 6. Dependencies (public exports only)

| Feature | Uses | Added for My Work (2026-10-01) |
|---|---|---|
| `features/activities` | `useActivities`, `isOverdueActivity` | — |
| `features/tasks` | `useTasks`, `TaskDrawer`, `getTaskDateTime`, `isTaskOverdue` | new `features/tasks/index.js` |
| `features/calendar` | `ActivityPreviewDrawer` | new `features/calendar/index.js` |
| `features/analytics` | `useSalesDashboard` | new `features/analytics/index.js` |
| `features/conversations` | `useConversationUnreadSummary` | new hook `hooks/useConversationUnreadSummary.js` (same params/cache as the inbox tabs) |
| `features/internal-chat` | `useChatUnreadCount` | — |
| `features/service` | `MyWorkList` (lazy import) | — |
| `shared/` | `module-pages` (`ModulePageHeader`), `feedback/Skeleton`, `utils/dateTime`, `utils/cn`, `data-table/hooks/useLocalStorage` | — |

**Caching:** activities and tasks use the same `{ per_page: 200 }` params as the calendar, and the conversation
counts use the inbox's params, so opening My Work after those pages (or the reverse) reuses React Query's cache.
No new endpoint, request shape or query key was added.

## 7. Public API

```js
import {
  MyWorkBoard, MyWorkSummary, MyWorkFocusTabs, MyWorkSectionCard, MyWorkItemList, MyWorkItemRow,
  useMyWorkFocus, useMyActivities, useMyTasks,
  registerMyWorkSection, unregisterMyWorkSection, getMyWorkSections, getAllMyWorkSectionIds,
  MY_WORK_FOCUS, MY_WORK_FOCUS_LIST, FOCUS_EVERYONE, MY_WORK_ROUTE,
  // pure helpers
  isMyActivity, isMyTask, isOpenActivity, isOpenTask, getTodayActivities, getDueTasks,
  buildOverdueItems, sortNewestFirst, isSameCalendarDay,
} from '../features/my-work'
```

## 8. How to add a section (e.g. "Deals closing this week")

1. Create `sections/DealsClosingSection.jsx`. Wrap it in `MyWorkSectionCard` (pass `isLoading`, `error`,
   `onRetry`, `empty`, `emptyText`, `count`, `viewAllTo`) and render rows with `MyWorkItemList` / `MyWorkItemRow`.
   Get data **only** through the owning feature's public `index.js`; put any "mine/today/overdue" rule in
   `utils/myWorkItems.js` with a test.
2. Register it in `config/registerBuiltinSections.js`:
   `registerMyWorkSection({ id: 'deals', order: 45, focuses: [MY_WORK_FOCUS.sales], module: 'sales', component: DealsClosingSection })`.
3. Add `myWork.sections.deals.*` in **both** `ar` and `en`.
4. If it should appear in the summary, add a tile in `MyWorkSummary.jsx` with `targetId` = the section id.
5. Update §2 and §6 of this README with a timestamp, and add a row to the change log in `docs/README.md`.

A heavy or optional domain should be imported lazily inside its section (see `ServiceWorkSection.jsx`).

## 9. States, i18n, theme, RTL

- Every section handles loading (skeleton), error (message + retry) and empty ("all clear" message).
- All text is `t('myWork.*')` / `t('nav.myWork')` in ar + en; dates/times use `shared/utils/dateTime`.
- Theme tokens (`--surface`, `--border`, `--brand-accent*`); danger tone uses Tailwind red with dark variants.
  Arrows flip with `i18n.dir()`; layout uses logical classes only.

## 10. Known gaps

- **Roles:** no `user.role` from the backend → the viewer picks the focus. Default is `all`.
- **"Mine" is client-side:** from the latest 200 activities and 200 tasks. Heavy users may miss older overdue
  items until the APIs support an assignee/participant filter or the backend's `GET /my-work` read model covers
  all sources.
- **Tasks without a due date** are not shown (by design).
- **Leads section:** the `my-leads` response has no confirmed customer id → rows link to the Leads Center when it is
  missing; there is no "follow-up due" signal from the backend yet.
- **Service section** depends on the Customer Hub read model (mock-backed until its API is live).
- **Messages** counts come from the first 30 conversations per channel (same as the inbox tabs).
- **Not visually verified** with real data (no backend/login in the build environment); layout checked with empty
  loading states only.

## 11. Change log

| When | Change |
|---|---|
| 2026-10-01 00:55 (Africa/Cairo) | Folder created: page, six sections, registry, rules, hooks, tests; public exports added to tasks, calendar, analytics and conversations; Customer Hub nav label renamed to avoid a duplicate "شغلي". |
