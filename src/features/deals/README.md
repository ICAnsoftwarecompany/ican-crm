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
| `components/hub/overview/` · `components/analytics/` | *2026-10-16 01:12 (Africa/Cairo)* `DealsOverview` (`/deals/overview`: deal tabs remembered in the browser, `DealOpenPicker`, `DealsCompare`), `DealAnalyticsPanel` + `DealOwnersTable` (backend `analytics/overview` + `owners` via `useDealAnalytics`, snapshot kept in localStorage; configs from `useDealAnalyticsView`). Hub table columns and drawer share `hub/useDealFields.jsx`; `DealQuickDrawer` (open deal page, completeness, live numbers, all fields); `CompletenessMeter` + `utils/dealCompleteness.js`. |
| Lost reasons | *2026-10-16 01:53 (Africa/Cairo)* `closing/LostDialog` picks a company lost reason (`features/definitions` `useLostReasons`) → `{ reason, lost_reason_id }` (`utils/dealLostReason.js`, tested), fixed list when none are defined; `settings/DealLostReasonsSettings` (deal settings section `lostReasons` + wizard stages step). |
| `components/chat/` | *2026-10-16 13:05 (Africa/Cairo)* `DealGroupsView` (`/deals/:id/groups`: `InternalChatWorkspace` scoped to «<deal name> G<n>»), `DealChatDock` (two floating buttons on every deal page: channel side panels scoped to the deal customers or all, and the deal groups chat panel), `NewDealGroupDialog` + `useDealGroupDialog` / `useDealChatGroups`. Models: `utils/dealGroups.js` (name pattern, next G, team user ids), `utils/dealConversations.js` (match conversations to deal leads); hooks `useDealGroups`, `useDealConversationFilter` (`hooks/useDealChat.js`). Wizard: `wizard/TeamChatGroupSection.jsx`. |
| `api/` | `dealsApi`, `dealLeadsApi` (leads, stage, products, won, lost, import*, distribute*, remove*, reopen*), `dealResourcesApi` (team incl. `addTeamMembers` batch, products), `dealCampaignsApi` (deal campaigns: attach `{ campaign_ids, is_active }`, update, list, info, detach — 2026-10-16 00:59 (Africa/Cairo)), `pipelineTemplatesApi` (reads `/api/pipeline-templates`, writes `/api/tenant/pipeline-templates`), `contractsApi`, `dealAnalyticsApi`, `dealAiApi`*. `*` = planned. |
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
| `components/wizard/` | `DealCreateWizard` (page `/deals/new`), `WizardStepper`, `PipelineStep`, `BasicsStep`, `ProductsStep`, `TeamStep` + `TeamPicker` (ready teams and/or users, one `POST /deals/team` batch: `{ deal_id, users[], teams[] }`, *2026-10-16 00:10 (Africa/Cairo)*), `QuickTeamDialog` (create a sales team with `POST /teams/create` via `features/teams` and add it to the deal; pure helpers in `utils/quickTeam.js`, *2026-10-16 00:27 (Africa/Cairo)*), `LeadSourceStep` + `source/` (`CampaignPicker`, `LeadsBasket`, `ExistingLeadSearch`, `NewLeadsInput`, `LeadBasketList`: campaigns or a basket of CRM / typed / pasted / file leads; model in `utils/leadSource.js`, file reading in `utils/readLeadFile.js`, *2026-10-16 00:59 (Africa/Cairo)*), `ReviewStep`, `StepGuide` ("how this step works" panel per step, `WIZARD_GUIDE`). |
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
## Quick team request correction - 2026-10-18 15:43 (Africa/Cairo)

In `/deals/new`, QuickTeamDialog receives the deal name and owner from the wizard. The posted team name is `Deal name - Team name` (trimmed, previewed before submission). The owner is preselected as leader if present in the loaded users; a leader is required for this quick-create flow and always included once in numeric `members`. Body matches the supplied Teams create example: `{ name, team_leader_id: '1', active: true, type: 'sales', members: [1, 2] }`. Existing ready teams are not renamed. Top-level `{ team: { id } }` responses are supported by extractCreatedId. HTTP 422 field errors are shown inline and entered values remain available for correction; no unsupported cause is inferred from status alone. Other team-creation screens are unchanged.

## Deal products API migration - 2026-10-19 11:23 (Africa/Cairo)

The 2026-10-19 Postman contract supersedes the old `/deals/products` and `product_ids` body:
- List/add: `GET/POST /api/tenant/deals/{dealId}/products`; add body `{ products: [{ product_id, details: {} }] }`.
- Single product: `GET/PATCH/DELETE /api/tenant/deals/{dealId}/products/{productId}`; patch body `{ details: {...} }`.
- `productId` means catalog `product_id`, not the association row `id`. `normalizeDealProduct` keeps catalog ID as `id`, relation ID as `linkId`, catalog price separately, and arbitrary `details` intact. Deal unit price takes precedence over catalog price when supplied.
- The creation wizard stores per-product details alongside selected IDs, migrates old drafts with empty details, and attaches only after the deal ID exists. Completed-step retry checkpoints are unchanged. Creation and AttachProductsDialog share ProductDetailsFields: quantity, price, discount, package and notes. Numeric details must be finite and nonnegative.
- DealProductsPanel displays deal-specific details. Its edit icon opens DealProductDialog, which fetches the single-product endpoint before editing and patches only details; unrecognized metadata is displayed and preserved, not discarded. Remove uses product ID. Successful mutations invalidate list/detail queries under the existing products key, refreshing product options in the workspace. This does not patch the catalog itself or change the direct-won API.
- `dealProducts.js`, API contract tests, wizard tests and the detail editor tests cover the new structure and relation/catalog ID distinction. Unknown metadata is preserved but the standard fields are the editable UI; no schema for arbitrary business-specific fields was assumed.

## Detail response stages - 2026-10-19 13:08 (Africa/Cairo)

`useDeal` normalizes both flat deal responses and `{ data: { deal, stats, stages_summary } }`. The nested deal is no longer extracted while discarding sibling stage/stat data. Missing deal IDs fall back to the requested route ID. Stage resolution prefers complete deal stages, then deal-owned `stages_summary` (actual stage IDs), then template fallback. Summaries with zero lead counts remain valid stages, and response order is retained when `order` is missing. Labels come from stage names; won/lost flags are never guessed from Arabic/English names. The backend must provide explicit flags/color/order for full stage semantics. This fixes the erroneous "no stages" warning when summaries exist. Tests cover normalization, fallback precedence and pipeline rendering.

## Native Drawer Actions - 2026-10-22 22:32 (Africa/Cairo)

Deal customer drawers now use the native CustomerQuickActions strip and QuickActionButton, not the deal tile grid. `dealDrawerActionOverrides` replaces only handlers/icons/labels for existing deal actions; the normal stored order, compact buttons, communication launchers and hover hints remain. Deal won/lost still target the current deal, closed outcomes stay disabled, and the generic CRM status action remains omitted in this context as before. Default customer drawers are unchanged. The independent deal-lead page and table context menu retain their own tile layouts. Tests check native button sizing and deal won behavior plus the override adapter.

## Product Explorer - 2026-10-19 19:34 (Africa/Cairo)

The workspace header shortcut opens `DealProductsShortcut`, a read-only, non-pushing AppDrawer with a searchable product/service list. Radix hover/focus tooltips show the list response's name, code, deal price and description. Selection reads the existing single-product endpoint, displaying normalized catalog fields, deal-specific details and arbitrary nested capabilities/data without dropping unknown fields. Returned product images are displayed when available.

Interested customers are restricted to the current deal and identified by explicit CRM interest product IDs or recorded deal-lead negotiation products; being a deal participant alone is not evidence of interest. The explorer follows deal-lead numbered pagination and loads negotiation products in batches of four, reusing existing lead-product cache keys. Partial failures are surfaced as an incomplete result with retry, never a false empty list. A sixty-second discovery cache is invalidated under the existing deals root. Customer links use the distinct deal-lead page route. The APIs do not expose external/non-deal interested customers or a bulk product-interest endpoint; none is invented here.

Model and route tests cover product/association ID separation, matching, empty interest and product selection/details/customer links. No live authenticated backend or visual browser verification has been performed.

## Shared Customer Drawer - 2026-10-19 18:52 (Africa/Cairo)

Deal routes inject the actual Leads Center CustomerDetailsDrawer through page composition (`DealCustomerDrawerLayout` -> workspace provider renderer slot); features never import the legacy pages component. Clicking a deal lead now uses the same customer data/timeline/tabs drawer. Explicit CRM/customer identity mapping is unchanged, and the header link stays `/deals/:dealId/leads/:dealLeadId`.

The drawer's optional quick-actions slot keeps deal-bound won/lost and the shared deal action grid, suppressing the generic CRM outcome buttons while retaining SMS/WhatsApp/Messenger/email launchers. Other customer-drawer consumers retain their default actions and links. Launching a deal action closes the high-z-index drawer before opening its dialog, avoiding a modal hidden beneath it. The separate full-page deal lead route remains deal-specific. A route regression test checks the actual drawer, custom route link and deal won dialog.

## Shared Lead Actions - 2026-10-19 18:35 (Africa/Cairo)

Deal table right-click, card menu, drawer and the new `/deals/:dealId/leads/:dealLeadId` page share `buildDealLeadActions`. It adapts the Leads Center action descriptors: won/lost first, meeting, call, follow-up and interest, plus open-drawer/page. Table selection remains table-only; table right-click uses the existing tile menu/highlighting. Missing CRM IDs disable CRM actions instead of falling back to deal-lead IDs.

`dealLeadCustomer` explicitly separates customer ID, CRM lead ID and deal-lead ID. Follow-up reuses the migrated public Leads Center dialog; interest reuses LeadInterestDialog; scheduling targets the CRM lead. Won/lost retain the existing deal transaction dialogs and endpoints, never create another deal. CRM changes invalidate relevant customer/lead/deal caches. The separate page composes the same detail content inline, keeping stage, owner, products and tasks and allowing future deal-specific details independently of the CRM route.

The page resolves the lead from the existing deal list endpoint (currently per_page 500), not an invented detail endpoint. It handles loading/errors/unavailable leads; leads outside the loaded list cannot be opened until a backend single-lead API or complete pagination is added. Focused tests cover IDs, action ordering/availability and direct route/follow-up rendering.

## Team Membership Recovery - 2026-10-19 15:35 (Africa/Cairo)

Chat recipient resolution now reads all numbered team pages and merges `members`, `users`, and `team_members` instead of stopping at the first empty alias. Explicitly empty teams contribute no recipients; leader-only teams contribute the supported leader ID/relation. Missing teams, missing membership fields without a declared zero count, and positive member counts with empty data still block creation. The error now identifies the affected team. This runs at the existing chat retry checkpoint, without recreating a saved deal/team. Regression tests cover alias merging, empty/leader-only teams and later pages. The screenshot confirmed failure at chat, not the deal POST; the actual authenticated team response has not been inspected.

## Deal Internal Conversations - 2026-10-19 15:18 (Africa/Cairo)

- `/deals/:dealId/chats` is listed under collaboration. `DealChatWorkspace` reuses the existing internal chat list/thread/composer with a scoped conversation list and local selection. Loading/error/retry/empty states are handled. No global active-chat fallback is allowed.
- Discovery uses exact `<trimmed deal name> - G<number>` group names, with case-insensitive G. All numbered list pages are fetched before selecting the next maximum suffix + 1. Renaming a deal does not rename old groups; identical deal names share matches. Name discovery is not authorization; access remains backend-controlled.
- Team step offers opt-in group creation for selected teams or multiple users (including the optional owner). Default is off, including older drafts. On save, the deal/team are created first. Selected teams are fetched and expanded to actual user IDs, deduplicating users, owner and leaders. Missing membership data blocks creation instead of silently dropping a team.
- Existing `POST /api/tenant/chat` receives `{ type: 'group', name, user_ids }`. Wizard name/completion checkpoints persist for retries. A saved name is checked before repeating a failed POST, recovering accepted requests with lost responses. This is best-effort recovery, not server idempotency: simultaneous clients can choose the same next suffix. Backend deal-group relations and uniqueness are required for reliable renames/concurrent creation.
- Additional groups can be created on the page using actual deal participants, never the all-tenant-user fallback. Internal-chat caches refresh after creation and via the existing realtime conversations prefix. Existing composer handles messages, files and replies. Tests cover matching, pagination, membership IDs, scoped selection and retry. Live authenticated backend behavior has not been verified.

## Board stage navigation - 2026-10-19 13:32 (Africa/Cairo)

Stage chevrons display only in table view. Board view always includes every stage and the unstaged column, ignoring the remembered table stage filter so no hidden filter suppresses columns/cards. Switching back to the table restores its selected stage; search, owner and lead-status filters still apply to both views.

## Pipeline toolbar layout - 2026-10-19 13:26 (Africa/Cairo)

On the pipeline route the workspace header owns the board/table switch beside Add leads, using the existing URL and remembered-view state. Search, lead status and owner share a responsive grid in that order; secondary filters stay below. Changing view preserves the current search and stage filters. Other workspace pages do not display the pipeline switch.

## Pipeline stage navigation - 2026-10-19 13:30 (Africa/Cairo)

The pipeline has chevron stage filters shared by board/table, including all stages and no stage. Selection uses the `stage` URL parameter; counts reflect the other active filters. The board includes an unstaged column so missing stage IDs do not hide leads. This synthetic column is not a backend stage and cannot be a move destination; its leads can move into real stages. The duplicate add-leads toolbar button is removed; workspace-level add remains available.

# Deal Lead Table Navigation

2026-10-22 22:56 (Africa/Cairo)

Each lead name in the deal table has a drawer icon. Ordinary name clicks still open
the shared customer drawer. The name is also a real link to
`/deals/:dealId/leads/:dealLeadId`, so Ctrl-click, Cmd-click and middle-click retain
native browser navigation without opening the drawer or selecting the row.

# Single Product Workspace Header

2026-10-22 23:07 (Africa/Cairo)

When the existing deal-products query successfully returns exactly one item, the
workspace header renders `DealSingleProductSummary` below the deal identity/actions
and above target progress. It shows the product/service name, description, code,
deal price, quantity, discount, package, notes and tracked stock when available.
Services omit stock. Multiple-product, loading and error states retain the compact
header and products drawer shortcut. Both consumers share the same React Query key.

Returned `image` and `images` URLs from the product and deal are displayed in separate
labelled, horizontally scrollable galleries using object-contain. Images open at their
source in a new tab; failed images disappear. No image URL, stock or price is invented.
Other fields remain accessible through the existing products/services drawer.

# Compact Product Drawer Facts

2026-10-22 23:11 (Africa/Cairo)

The product explorer's selected item now places its thumbnail, name and description
together above a responsive grid of compact fact tiles (code, kind, prices, status,
stock). Deal details and nested capabilities/data use parallel grid tracks instead
of a vertical field list. Other returned fields remain in a native expandable
Additional details section; false and zero values remain visible. Failed images
fall back to the package icon. Interested customers remain directly below the facts.

