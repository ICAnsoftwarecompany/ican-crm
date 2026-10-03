# pages/deals — Deals routes

> **Documentation update:** 2026-10-03 23:32 (Africa/Cairo) — folder rebuilt (hub + workspace route trees, smoke test).

Thin route composition for the deals area. Business logic, layouts and components live in
[`features/deals`](../../features/deals/README.md); spec in [docs/deals](../../../docs/deals/DEALS-WORKSPACE-SPEC.md).

| File | Owns |
|---|---|
| `dealRoutes.jsx` | `dealRoutes` — `deals` (hub: index, `contracts`, `reports`, `pipelines`) and `deals/:dealId` (workspace: index, `pipeline`, `contracts`, `team`, `meetings`, `calls`, `tasks`, `products`, `reports`, `calendar`, `automation`, `assistant`, `ai`, `settings`). Spread into `MainLayout` children in `app/router/index.jsx`. Child paths must match `DEAL_WORKSPACE_PAGES[].path`. |
| `DealsHubPages.jsx` | `DealsListPage`, `DealsContractsPage`, `DealsReportsPage`, `DealsPipelinesPage`. |
| `DealWorkspacePages.jsx` | One page per workspace route: `ModulePageHeader` + one feature component; reports on `ReportsPage`; AI setup on `AiSetupPage` (scope `deals`); settings on `ModuleSettingsPage` (deal sections + `deals.pipelines` from the settings registry). |
| `dealRoutes.test.jsx` | Smoke test: every hub and workspace page renders against a fake backend shaped like the Postman collection; won/lost submit the exact request bodies. |

Removed 2026-10-03: `DealsHubPage.jsx`, `DealWorkspacePage.jsx` (tabs + `?tab=` replaced by sub-sidebar routes; old
`/deals/:id?tab=...` links open the overview).

`DealWorkspacePages.jsx` imports `getSettingsSections` from `pages/settings/registry` — the single allowed page→page
dependency (same as the Communication hub).
