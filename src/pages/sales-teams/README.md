# pages/sales-teams — قسم فرق السيلز

> **Documentation update:** 2026-10-16 00:10 (Africa/Cairo) — الفولدر اتعمل.

صفحات الراوت بس لقسم فرق السيلز وتوزيع الليدز (`/LeadsCenter/teams/*`). كل المنطق والكومبوننتس في
[`features/leads/sales-teams`](../../features/leads/sales-teams/README.md).

| الملف | الدور |
|---|---|
| `SalesTeamsLayout.jsx` | `SubSidebarLayout` بسايد بار القسم (`storageKey`: `sales-teams-sidebar-collapsed`) + `<Outlet />` |
| `salesTeamsNavigation.js` | `getSalesTeamsSidebarConfig(t)`: الإدارة (الفرق، قواعد التوزيع ↳ قاعدة جديدة)، التحليل (التقارير)، والفوتر رجوع لمركز العملاء |
| `SalesTeamsPages.jsx` | `SalesTeamsPage` (الفرق)، `SalesTeamsRulesPage`، `SalesTeamsRuleBuilderPage` (جديدة / تعديل، `?team=`)، `SalesTeamsReportsPage` |

الراوتس في `app/router/index.jsx` تحت `{ path: 'LeadsCenter/teams', element: <SalesTeamsLayout /> }`:
`index`، `rules`، `rules/new`، `rules/:ruleId/edit`، `reports`. و`/LeadsCenter/assignments` بيحوّل على `/LeadsCenter/teams/rules`.

**إزاي تزوّد صفحة:** راوت هنا + مسار في `features/leads/sales-teams/constants/salesTeamsRoutes.js` + عنصر في `salesTeamsNavigation.js`.

**ثغرات:** الحماية بتسجيل الدخول بس؛ الصلاحيات على الباك.
