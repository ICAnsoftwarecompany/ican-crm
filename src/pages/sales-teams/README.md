# pages/sales-teams — قسم فرق السيلز

> **Documentation update:** 2026-10-16 02:40 (Africa/Cairo) — صفحتين جداد: مستخدمين السيلز (`users`) وتوزيع المحادثات (`channels`).
> 2026-10-16 00:10 (Africa/Cairo) — الفولدر اتعمل.

صفحات الراوت بس لقسم فرق السيلز وتوزيع الليدز (`/LeadsCenter/teams/*`). كل المنطق والكومبوننتس في
[`features/leads/sales-teams`](../../features/leads/sales-teams/README.md).

| الملف | الدور |
|---|---|
| `SalesTeamsLayout.jsx` | `SubSidebarLayout` بسايد بار القسم (`storageKey`: `sales-teams-sidebar-collapsed`) + `<Outlet />` |
| `salesTeamsNavigation.js` | `getSalesTeamsSidebarConfig(t)`: الإدارة (الفرق، مستخدمين السيلز، قواعد التوزيع ↳ قاعدة جديدة، توزيع المحادثات)، التحليل (التقارير)، والفوتر رجوع لمركز العملاء |
| `SalesTeamsPages.jsx` | `SalesTeamsPage` (الفرق)، `SalesTeamsUsersPage`، `SalesTeamsChannelsPage`، `SalesTeamsRulesPage`، `SalesTeamsRuleBuilderPage` (جديدة / تعديل، `?team=`)، `SalesTeamsReportsPage` |

الراوتس في `app/router/index.jsx` تحت `{ path: 'LeadsCenter/teams', element: <SalesTeamsLayout /> }`:
`index`، `users`، `channels`، `rules`، `rules/new`، `rules/:ruleId/edit`، `reports`. و`/LeadsCenter/assignments` بيحوّل على `/LeadsCenter/teams/rules`.

**إزاي تزوّد صفحة:** راوت هنا + مسار في `features/leads/sales-teams/constants/salesTeamsRoutes.js` + عنصر في `salesTeamsNavigation.js`.

**ثغرات:** الحماية بتسجيل الدخول بس؛ الصلاحيات على الباك.
