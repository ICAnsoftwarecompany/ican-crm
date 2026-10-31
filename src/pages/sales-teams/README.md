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
## Manual distribution - 2026-10-17 22:06 (Africa/Cairo)

`/LeadsCenter/teams/manual` is available in the same sidebar as distribution rules. `SalesTeamsManualDistributionPage` composes the existing CustomersPage in table-only mode with the same customers endpoint, columns, filters and pagination, separate table preferences, and a manual-distribution selection toolbar. No copy of the customer table is maintained. Select customer rows and use the distribution button; the feature extracts linked lead IDs, never customer IDs. The server distributes by sales-user priority/order. No user/team/rank is fabricated or sent from this page.

