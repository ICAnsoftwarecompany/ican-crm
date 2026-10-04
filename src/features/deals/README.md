# features/deals — Deals hub and Deal Workspace

> **Documentation update:** 2026-10-03 23:32 (Africa/Cairo) — feature rebuilt: one workspace per deal (14 pages on the
> shared sub-sidebar), won / lost / contracts, team split, calls & meetings, tasks & to-dos, calendar, reports,
> automation, assistant, settings; API aligned with the backend Postman collection; live/planned capability registry.
> **2026-10-04 00:17 (Africa/Cairo)** — creation wizard (`components/wizard/`, `useDealCreateWizard`, `utils/dealWizard`) and work template by
> products (`utils/dealProductMode`, `DealProductModeCard`, `ProductUnitBadge`, `ProductPicker`, `LineItemsEditor` rules).
> **2026-10-04 00:41 (Africa/Cairo)** — hub: quick info per deal (`utils/dealQuickInfo`, `useDealsQuickInfo`), board view (`DealsHubList`,
> `DealsBoard`, `DealCard`), hub calendar (`DealsHubCalendar`, `useDealsHubCalendarEvents`), shared `ViewToggle` / `DealCalendarView`.
> **2026-10-04 01:30 (Africa/Cairo)** — richer hub board cards: health vs period, time left, won revenue vs target with an elapsed marker, leads breakdown, open
> pipeline, win rate, unassigned / stale alerts; column totals; board sort (`utils/dealBoardStats`, `DealCardMetrics`).

**Status:** CURRENT on the endpoints of the backend Postman collection "Deals Workspace"; planned endpoints are wired
but disabled (see `constants/dealApiStatus.js`). Not verified against a running backend.

**Full spec (Arabic, with the backend contract):** [docs/deals/DEALS-WORKSPACE-SPEC.md](../../../docs/deals/DEALS-WORKSPACE-SPEC.md)
· summary in [docs/2-SALES.md → Deals](../../../docs/2-SALES.md#deals) · routes in [pages/deals](../../pages/deals/README.md).

## 1. What it owns

- **Deal** = a work container (sales drive, campaign, project) with stages copied from a pipeline template, a team
  (users or whole teams with roles), products, and **deal leads** (a CRM lead placed on a stage, `status` open/won/lost).
- **Won flow**: one request creates the contract, payment plan, installments and follow-up tasks on the backend.
- Hub `/deals` (all deals, all contracts, reports, pipeline templates) and one workspace per deal `/deals/:dealId/*`.

## 2. Folder map

| Path | Owns |
|---|---|
| `api/` | `dealsApi`, `dealLeadsApi` (leads, stage, products, won, lost, import*, distribute*, remove*, reopen*), `dealResourcesApi` (team, products), `pipelineTemplatesApi` (reads `/api/pipeline-templates`, writes `/api/tenant/pipeline-templates`), `contractsApi`, `dealAnalyticsApi`, `dealAiApi`*. `*` = planned. |
| `constants/dealApiStatus.js` | **`DEAL_API_STATUS`**: `live` (in the collection) or `planned` per capability; `isDealApiLive()`. Flip a value when the backend ships — nothing else changes. |
| `constants/dealOptions.js` | Enum values (types, statuses, roles, lost reasons, payment types, frequencies…). Labels at `dealWorkspace.options.*`. |
| `constants/dealQueryKeys.js` | `dealKeys` (root `['deals']`). |
| `constants/dealWorkspacePages.js` | **Page registry** of the workspace (`DEAL_WORKSPACE_PAGES`: id, path, icon, group) and the hub (`DEALS_HUB_PAGES`); `getDealPagePath`, `getDealsHubPath`; `DEAL_AI_CAPABILITIES`. |
| `hooks/useDeals.js` | `useDeals`, `useDeal`, `usePipelineTemplates`, `useDealMutations`, `usePipelineTemplateMutations`. |
| `hooks/useDealLeads.js` | `useDealLeads(dealId)` (normalized, one cached list per deal), `useDealLeadProducts`, `useDealLeadMutations(dealId)` (optimistic `changeStage` with rollback; won invalidates contracts + tasks). |
| `hooks/useDealResources.js` | `useDealTeam`, `useDealProducts`, `useDealResourceMutations`, legacy `useDealResources`. |
| `hooks/useDealContracts.js` · `useDealAnalytics.js` | Contracts list/detail (normalized); live analytics only. |
| `hooks/useDealWorkspace.jsx` | `DealWorkspaceProvider` (deal + stages + leads loaded once in the layout) and `useDealWorkspace()`. |
| `hooks/useDealLinkedWork.js` | `useDealLinkIndex`, `useDealActivities(type)`, `useDealTasks()` — tasks/calls/meetings that belong to the deal (linked to the deal, its contracts or its leads). |
| `hooks/useDealCalendarEvents.js` | Shared calendar events of the deal + installments + deal start/end. |
| `utils/` (all tested) | `dealStages` (resolve/sort stages, won/lost), `dealLeads` (normalize, status, filters, stale, summary, id index), `dealMoney` (line totals, won payload + validation, installment preview, money format, progress), `dealTeam` (members, payload user XOR team, people, workload, team lanes), `dealContracts` (normalize, overdue, paid/remaining), `dealLinks` (task/activity → deal link), `dealInsights` (rule-based hints, target pace), `dealCalendar` (installment + milestone events, sources), `dealDisplay`. |
| `utils/dealProductMode.js` · `catalog.js` · `pipelineTemplate.js` · `dealWizard.js` *(2026-10-04 00:17 (Africa/Cairo))* | Product unit mode per product (`unique`/`units`/`service`) and per deal (`open`/`single_unit`/`single_product`/`multi_product`), `getLineRules`, `isUniqueUnitTaken`; full catalog rows; template payload + `validateStages`; wizard state, per-step validation, exact Postman request bodies (`buildWizardRequests`). All tested. |
| `utils/dealQuickInfo.js` *(2026-10-04 00:41 (Africa/Cairo))* | Quick info per deal: `readListSummary` (list row fields of spec §9.11), `getMissingQuickInfo`, `resolveLastAction` (latest won / lost / added / touched lead, else deal updated / created), `buildDealQuickInfo`, `summarizeDealsSetup`. Tested. |
| `utils/dealBoardStats.js` *(2026-10-04 01:30 (Africa/Cairo))* | Hub board card numbers from the deal row + its normalized leads: `resolveDealTiming` (upcoming / running / ended, days, elapsed %), `resolveDealHealth` (on track / behind / at risk: revenue %, else won-leads %, vs elapsed %; active deals only), `buildDealCardStats` (lead counts, won revenue = won leads' estimated value, open pipeline, win rate, unassigned, stale), `summarizeDealColumn`, `sortDealsForBoard` (`?sort=` newest / endingSoon / revenue / progress). Tested. |
| `hooks/useDealsQuickInfo.js` · `useDealsHubCalendarEvents.js` | Fetches only what the list row lacks (team, products, leads) for the newest `QUICK_INFO_LIMIT` (40) deals, on the workspace's query keys; events of every deal for the hub calendar (`buildDealsLinkIndex` in `dealLinks`). |
| `hooks/useDealCreateWizard.js` · `useCatalogProducts.js` | Wizard draft in localStorage (`deals:create-wizard:draft`, incl. created ids → resumable, no duplicate deal), ordered submit with per-phase progress; active catalog products with full data. |
| `components/wizard/` | `DealCreateWizard` (page `/deals/new`), `WizardStepper`, `PipelineStep`, `BasicsStep`, `ProductsStep`, `TeamStep`, `ReviewStep`. |
| `reports/` | `dealReportModel` (tested), `useDealReport(range)`, `useDealsHubReport(range)` for the shared `ReportsPage`. |
| `navigation/dealNavigation.js` | Sub-sidebar configs (workspace + hub). Tested. |
| `workflow/dealWorkflowDefinition.js` | Workflow-engine module `deals` (8 triggers, 4 conditions, 5 actions, all `backendSupport: false`). Imported by `workflow-engine/config/registerBuiltinModules.js`. |
| `components/` | `layout/` (hub + workspace layouts, header), `pipeline/` (view, toolbar, board, table, card, URL state, lead dialogs hook), `leads/` (add existing / new / import, bulk assign, lead drawer + products), `closing/` (won, lost, line items, installment fields), `team/`, `products/`, `contracts/`, `activities/`, `tasks/`, `calendar/`, `overview/`, `ai/`, `settings/`, `hub/` (`DealsHubList` = table/board switch, `DealsTable`, `DealsBoard`, `DealCard`, `DealQuickInfo`, pipeline templates + stages editor), `calendar/` (`DealCalendarView` shared by `DealCalendar` and `DealsHubCalendar`), `common/` (badges, planned notice, progress, field, person select, `useDealPeople`, `useProductOptions` → `{options, products, mode, rules}`, `DealProductModeCard`, `ProductUnitBadge`, `ProductPicker`). |

## 3. Public API (`index.js`)

APIs, constants, hooks, utils listed above, `useDealReport`, `useDealsHubReport`, and the components route pages compose:
`DealsHubLayout`, `DealWorkspaceLayout`, `DealOverview`, `DealPipelineView`, `DealTeamPanel`, `DealProductsPanel`,
`DealContractsTable`, `ContractDrawer`, `DealActivitiesPanel`, `DealTasksPanel`, `DealCalendar`, `DealAssistant`,
`DealGeneralSettings`, `DealStagesSettings`, `DealPreferencesSettings`, `DealDangerZone`, `DealsHubList`, `DealsTable`, `DealsBoard`, `DealCard`, `DealQuickInfo`, `DealsHubCalendar`, `DealCreateWizard`, `DealProductModeCard`,
`PipelineTemplatesPanel`, `WonDialog`, `LostDialog`, `DealStatusBadge`, `LeadStatusBadge`, `PlannedNotice`.

## 4. Rules

- Moving a card changes the stage only. Won / lost are separate endpoints; a drop on a won/lost column opens the dialog
  and the card moves only after it is confirmed (`useLeadDialogs`).
- Only `open` leads can be won/lost or moved. The status, not the stage, says whether a lead is closed.
- The frontend never creates contracts or installments and never sends totals; previews are labelled as estimates.
- Planned endpoints: disabled control + `PlannedNotice`; never a fake success.
- Shared engines only: `SubSidebarLayout`, `PipelineBoard` (long-press), `DataTable`, `ReportsPage`/`ReportChart`,
  shared `Calendar`, `WorkflowModuleWorkspace`, `AiSetupPage`, `ModuleSettingsPage`, `EntityTasksPanel`,
  `ScheduleActivityDialog`, `ActivityPreviewDrawer`, `TaskDrawer`.
- Line items follow the deal's product mode (`getLineRules`): one product → locked; one unique piece → quantity 1 and the
  deal is won once (`isUniqueUnitTaken`). UI guard only — the backend must enforce it (spec §9.10).
- Lists that feed a form reset (`useDealLeadProducts().items`, `useDeals`, templates) are memoized — an unmemoized list
  there caused an infinite render loop (caught by the smoke test).

## 5. How to extend

- **New workspace page:** entry in `DEAL_WORKSPACE_PAGES` + route in `pages/deals/dealRoutes.jsx` + page in
  `DealWorkspacePages.jsx` + `dealWorkspace.pages.<id>` / `pageDescriptions.<id>` (ar + en). The sub-sidebar updates itself.
- **Backend ships a planned endpoint:** set its key to `live` in `DEAL_API_STATUS`; check the request body in the API module
  against the backend; remove the line from §9 of the spec.
- **Server-side reports:** switch `useDealReport` to `useDealAnalytics` once the overview shape is confirmed.
- **New lost reason / payment type:** add it to `dealOptions.js` + `dealWorkspace.options.*` (ar + en). Custom per-tenant
  reasons need `dealSettings` (spec §9.8).

## 6. Known gaps

- Product unit mode relies on `unit_mode` / `available_units`, not yet in the backend; until then stock fields only.
- Hub quick info: without spec §9.11 it costs 3 requests per deal (newest 40 only); "last action" is derived from lead and deal dates, not a real activity log.
- Hub board numbers (2026-10-04 01:30 (Africa/Cairo)) need the deal's leads: past the newest 40, or once the list sends spec §9.11 `last_activity` (leads then not fetched), cards show only targets and "—". Won revenue is the won leads' estimated value, not contract totals.
- Deal creation is 2–N requests (no atomic endpoint); a failed step is resumed from the saved draft.
- Not run against a real backend or seen in a browser (no login available); see spec §12.
- Leads fetched once with `per_page: 500`; tasks/activities = latest 200 of the tenant filtered locally.
- Reports computed in the browser; analytics funnel/sources not in the backend collection.
- Deal vs Service Spec `deals` naming conflict and payment-plan design are open decisions (spec §10).
