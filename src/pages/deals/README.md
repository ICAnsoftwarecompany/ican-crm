# pages/deals — Deals routes

> **Documentation update:** 2026-10-03 23:32 (Africa/Cairo) — folder rebuilt (hub + workspace route trees, smoke test).
> 2026-10-04 00:17 (Africa/Cairo) — `deals/new` (creation wizard page) + wizard smoke test.
> 2026-10-04 00:41 (Africa/Cairo) — `deals/calendar` (all deals' calendar); `/deals` renders `DealsHubList` (table / board + quick info).

Thin route composition for the deals area. Business logic, layouts and components live in
[`features/deals`](../../features/deals/README.md); spec in [docs/deals](../../../docs/deals/DEALS-WORKSPACE-SPEC.md).

| File | Owns |
|---|---|
| `dealRoutes.jsx` | `dealRoutes` — `deals` (hub: index, `new` — creation wizard, `contracts`, `calendar`, `reports`, `pipelines`) and `deals/:dealId` (workspace: index, `pipeline`, `contracts`, `team`, `meetings`, `calls`, `tasks`, `products`, `reports`, `calendar`, `automation`, `assistant`, `ai`, `settings`). Spread into `MainLayout` children in `app/router/index.jsx`. Child paths must match `DEAL_WORKSPACE_PAGES[].path`. |
| `DealsHubPages.jsx` | `DealsListPage` (`DealsHubList`), `DealsCreatePage` (`DealCreateWizard`), `DealsContractsPage`, `DealsCalendarPage` (`DealsHubCalendar`), `DealsReportsPage`, `DealsPipelinesPage`. |
| `DealWorkspacePages.jsx` | One page per workspace route: `ModulePageHeader` + one feature component; reports on `ReportsPage`; AI setup on `AiSetupPage` (scope `deals`); settings on `ModuleSettingsPage` (deal sections + `deals.pipelines` from the settings registry). |
| `dealRoutes.test.jsx` | Smoke test: every hub and workspace page renders against a fake backend shaped like the Postman collection; won/lost submit the exact request bodies; the wizard posts template → deal → team → products in order with the exact bodies; a single-product deal locks the won line; the hub board shows quick info and the table fetches it per deal. |

Removed 2026-10-03: `DealsHubPage.jsx`, `DealWorkspacePage.jsx` (tabs + `?tab=` replaced by sub-sidebar routes; old
`/deals/:id?tab=...` links open the overview).

`DealWorkspacePages.jsx` imports `getSettingsSections` from `pages/settings/registry` — the single allowed page→page
dependency (same as the Communication hub).
## Quick team creation - 2026-10-18 15:43 (Africa/Cairo)

The team step of `/deals/new` prefixes new quick-team names with the deal name and passes the deal owner as default team leader. A leader must be selected; backend 422 validation messages appear inside the dialog. Uses the existing `/api/tenant/teams/create` JSON endpoint; names and payload logic live in `features/deals/utils/quickTeam.js`. Previously selected existing teams are not modified.

## CRM Drawer Composition - 2026-10-19 18:52 (Africa/Cairo)

`DealCustomerDrawerLayout` composes the deal workspace with the existing customer drawer through a renderer prop, avoiding feature imports from legacy page internals. The optional drawer link/quick-action slots preserve the deal-lead route and deal outcome dialogs. Standalone Leads Center drawer defaults are unchanged.

## Deal Lead Page - 2026-10-19 18:35 (Africa/Cairo)

`/deals/:dealId/leads/:dealLeadId` renders the public `DealLeadDetail` feature inside the existing deal workspace. The final ID is a deal-lead association ID, not a customer ID or CRM lead ID. It supports direct refresh through the existing cached deal-lead list and shares actions/detail sections with the drawer while remaining separate from `/leads/:customerId`. See the feature README for the current list-size limitation and CRM identity mapping.

## Deal Conversations - 2026-10-19 15:18 (Africa/Cairo)

`/deals/:dealId/chats` renders `DealChatWorkspace` from the deals public API and is registered in the collaboration sidebar. It embeds the existing internal chat conversation list and message thread with a name-scoped group list. Creation/naming/membership/retry logic belongs to the feature, not the route. See the deal and internal-chat READMEs for naming limitations and integration details.

## Deal-specific products - 2026-10-19 11:23 (Africa/Cairo)

`/deals/new` now accepts quantity/unit price/discount/package/notes per selected product and posts `{ products: [{ product_id, details }] }` to `/api/tenant/deals/{dealId}/products`. Workspace `/deals/:dealId/products` shows the nested product response and deal-specific details; the edit icon fetches the single-product URL and PATCHes details, and removal DELETEs the same product URL. IDs in URLs are catalog product IDs, not deal-product link IDs. Logic/UI lives in `features/deals/components/products` and `utils/dealProducts.js`; other deal pages consume normalized products through the existing hooks.

