# ICAN CRM — Architecture & Rules

Canonical rules and structure for the ICAN CRM frontend (React 19 / Vite 5 multi-tenant CRM).
Domain documentation: [2-SALES.md](2-SALES.md) (sales domain) and [3-FEATURES.md](3-FEATURES.md) (everything else).
If this document and the code disagree, **the code wins** — fix the document in the same change.

Status labels used in all three docs: **CURRENT** (verified code in use) · **PARTIAL** (UI or API exists, integration incomplete) · **LEGACY** (compatibility path, not for new work) · **PLANNED** (not implemented).

## Contents

- [Folder structure and ownership](#folder-structure-and-ownership)
- [Dependency rules](#dependency-rules)
- [Routes and navigation](#routes-and-navigation)
- [Tenant, auth, httpClient and api_password](#tenant-auth-httpclient-and-api_password)
- [Realtime](#realtime)
- [i18n](#i18n)
- [RTL and LTR](#rtl-and-ltr)
- [Theme and dark mode](#theme-and-dark-mode)
- [Conventions](#conventions)
- [Shared engines](#shared-engines)
  - [DataTable](#datatable)
  - [Calendar](#calendar)
  - [Visual Flow](#visual-flow)
  - [Pipeline Board](#pipeline-board)
  - [Sidebar and navigation](#sidebar-and-navigation)
  - [Other shared UI](#other-shared-ui)
- [Checks and commands](#checks-and-commands)
- [Definition of Done](#definition-of-done)
- [Adding a new module](#adding-a-new-module)
- [Known architecture debt](#known-architecture-debt)

---

## Folder structure and ownership

| Path | Owns |
|---|---|
| `src/features/<domain>/` | Business capability: `api/`, `hooks/`, `components/`, `utils/`, `schemas/`, `store/`, `adapters/`/`channels/`, `workflow/`, optional `index.js` public surface. **New business logic goes here.** Create only folders with real code. |
| `src/pages/` | Route composition. Thin pages that assemble feature components. |
| `src/shared/` | Domain-independent UI (`components/`), hooks (`useDirection`, `useDebounce`, `usePageHeader`, `useNetworkQuality`) and utils (`dateTime`, `documentLanguage`, `apiResponse`, `cn`). Must not import `features/`. |
| `src/app/` | Router (`app/router/index.jsx`, `PrivateRoute.jsx`), navigation (`app/navigation/`), providers (`QueryProvider`, `ThemeProvider`). |
| `src/services/` | HTTP and tenant transport: `httpClient.js`, `apiBaseUrl.js`, `tenantResolver.js`. |
| `src/realtime/` | Laravel Echo / Reverb setup and realtime hooks. |
| `src/store/` | App-wide Zustand state only: `authStore`, `themeStore`, `pageHeaderStore`. Domain state lives in `features/<domain>/store`. |
| `src/locales/{ar,en}/<domain>.js` | Translations, registered in `src/locales/{ar,en}/index.js`. |
| `scripts/` | Repository checks (`check-architecture`, `check-translations`, `check-theme`, `check-hardcoded-text`). |

Bootstrap: `src/main.jsx` → `src/App.jsx` (`QueryProvider` → `ThemeProvider` → `TenantNotificationsRealtime` + router; `syncDocumentLanguage` runs on start and on every language change).

Legacy / transitional areas (do not copy, do not grow):
- `src/pages/customers/**` still holds much business UI (customer drawer, bulk actions, proposal builder, sales teams). Move it into features incrementally.
- `features/MessegeCampaign` (misspelled) is now only a re-export of `features/outreach-campaigns`; nothing imports it. Use `outreach-campaigns`.
- Files of 1–3 lines that only re-export are compatibility shims; update imports instead of adding more.

## Dependency rules

```text
app / pages  ->  features  ->  shared / services
```

- `shared/*` never imports `features/*`. Enforced by `npm run check:architecture` (`scripts/check-architecture.mjs`). Allowed app-shell exceptions: `shared/components/layout/MainLayout.jsx`, `Header.jsx`, `shared/components/data/PageToolbar.jsx`. Move shell integrations to `app/` over time; do not add new exceptions.
- A feature may use another feature only through that feature's public exports (`features/<domain>/index.js`) when the domain relationship is real. Example: `internal-chat` imports `ConversationThread` from `features/conversations`.
- `features/*` must never import from `pages/*`.
- Business APIs live in their owning feature and call `services/httpClient`; query hooks sit next to them. Adapters translate legacy API shapes without changing the server contract.
- Do not put complete business workflows in route pages; compose feature workspaces there.

## Routes and navigation

- `src/app/router/index.jsx` is the single route registry. Preserve every existing URL, including `/LeadsCenter` casing, `/lead/:customerId` and `/leads/:customerId`. `/login` is public; everything else renders under `PrivateRoute` + `MainLayout`.
- `PrivateRoute` checks **authentication only**. There are no module/permission route guards. A hidden navigation item is **not** authorization — the backend is authoritative.
- Sidebar and header destinations come only from `app/navigation/navigation.config.js` — see [Sidebar and navigation](#sidebar-and-navigation).
- Playground routes exist for engine demos: `/playground/datatable`, `/playground/visual-flow`.

## Tenant, auth, httpClient and api_password

- **Tenant resolution:** `services/tenantResolver.js` derives the tenant from the subdomain (`resolveTenantFromHostname`) or the user (`resolveTenantId`). `services/apiBaseUrl.js` builds `https://{tenant}.{VITE_API_ROOT_DOMAIN}` and throws when no tenant subdomain is found. With `VITE_API_USE_DEV_PROXY=true` in dev, requests go to the Vite dev proxy (`vite.config.js`), which resolves the tenant from the request host. Never hardcode a tenant or invent a second resolver.
- **httpClient:** `services/httpClient.js` is the only Axios instance. Its request interceptor adds `Authorization: Bearer <token>` (from `authStore`) and the query parameter `api_password`. A 401 sets `sessionRefreshNeeded` and dispatches `ican:session-expired` (handled by `features/auth/components/SessionRefreshModal.jsx`). It throws at import time when `VITE_API_PASSWORD` is missing — mock it in tests.
- **api_password:** `VITE_*` values are bundled into the browser. `VITE_API_PASSWORD` is a public compatibility value, **not a secret**. Never publish its value in docs. Replacing it needs backend work; do not change the contract silently.
- **Auth state:** `store/authStore.js` persists `{ token, user }` in localStorage under `ican-auth`. Auth API (`features/auth/api/authApi.js`): `POST /api/tenant/auth/signin`, `POST /api/tenant/auth/refresh`, `GET /api/tenant/auth/logout`.
- **Environment variables:** `VITE_API_ROOT_DOMAIN`, `VITE_API_SCHEME`, `VITE_API_USE_DEV_PROXY`, `VITE_API_DEV_PROXY_TARGET`, `VITE_API_PASSWORD`, `VITE_MAIN_SERVER_URL` (Facebook sub-login only), `VITE_REALTIME_ENABLED`, `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_ROOT_DOMAIN`, `VITE_REVERB_SCHEME`, `VITE_REVERB_PORT`. See `.env.example`.

## Realtime

- `src/realtime/echo.js` creates one Laravel Echo (Pusher protocol, Reverb) singleton. If `VITE_REVERB_HOST` is empty, the host is built from the tenant subdomain and `VITE_REVERB_ROOT_DOMAIN`. Channel auth uses the same bearer token and `api_password`.
- `hooks/useRealtimeChannel.js` is the generic subscribe hook (`channelName`, `eventName`/`eventNames`, `isPrivate`, `listenToAll`, `onEvent`). Build every new subscription on it; never open a second connection.
- Tenant notifications: `TenantNotificationsRealtime` (mounted in `App.jsx`) → `useTenantNotificationsRealtime` on `tenant.{tenantId}.notifications.{userId}`, event `.notification.created`.
- Domain hooks: `useWhatsappRealtime`, `useMessengerRealtime`, `useGmailRealtime` (conversations), `useCustomersTableRealtime`, `useTableFormatRulesRealtime`.
- Two patterns exist: some hooks update React Query caches directly (`useCustomersTableRealtime`, `useTableFormatRulesRealtime`); the conversation hooks resolve payloads and hand events to consumers that update caches (details in [3-FEATURES.md → Conversations](3-FEATURES.md#conversations)). Keep query keys that realtime handlers update stable.

## i18n

- One i18next namespace, `common` (`src/i18n.js`, `defaultNS: 'common'`). Resources are split into per-domain modules: `src/locales/{ar,en}/<domain>.js`, each `export default { ... }` holding the subtree of its top-level key. The file name **is** the top-level key: `t('customers.table.name')` → `customers.js` → `table.name`. Never call `useTranslation('customers')`.
- Current modules (same set in both languages): `actions, activities, app, auth, branding, calendar, callMeetings, campaigns, common, conversations, customers, dashboard, dataTable, dealWorkspace, leads, nav, opportunities, outreachCampaigns, products, proposals, socialMedia, status, tasks, visualFlow, visualFlowDemo, workflow`.
- Cross-cutting modules only: `actions.js` (generic verbs), `status.js` (shared lead/customer statuses), `common.js` (loading/error/empty/retry/toggles). Feature copy goes into the feature's own module. Engines with lots of copy get their own module (`dataTable.js`, `visualFlow.js`).
- **New feature copy:** create `src/locales/ar/<feature>.js` and `en/<feature>.js`, import both in their `index.js`, use `t('<feature>.*')`, run `npm run check:i18n`.
- Translate: labels, actions, toasts, validation, `window.confirm` text, placeholders, `aria-label`, `title`, `alt`, empty/error states. Translate enum **labels**, never backend values: `t(\`proposals.page.status.${status}\`, { defaultValue: status })`.
- Never translate: endpoints, route paths, backend enum values, IDs, event names, provider IDs, or user-entered data (names, notes, messages, product names, custom statuses).
- `check:i18n` fails on AR/EN key mismatch, empty values, unregistered module files, or index entries without a file. `src/locales/locales.test.js` guards resource assembly. `check:hardcoded-text` is advisory only.
- Sub-split a domain module (`locales/en/customers/index.js` + parts) only when one file becomes hard to navigate; the public key path stays the same.

## RTL and LTR

- `shared/utils/documentLanguage.js` sets `document.documentElement.lang`/`dir` from the active language at startup and on every change. Components must not hardcode `dir="rtl"`/`dir="ltr"` on screens.
- Use logical utilities: `ms/me`, `ps/pe`, `start/end`, `inset-inline`. `useDirection()` returns the current direction when logic needs it (drag, resize, positioning).
- Keep mixed-direction values LTR on their own span: phone numbers, emails, URLs, IDs, invoice numbers, amounts.
- Known deliberate exception: `ProposalRenderer.jsx` root `<article dir="rtl">` — the rendered proposal is a customer-facing document. Change it only with a product decision.

## Theme and dark mode

- `store/themeStore.js` (persisted) + `app/providers/ThemeProvider.jsx` toggle the root `.dark` class and apply brand tokens. There is one theme store.
- Semantic CSS variables in `src/index.css` (light `:root` and `.dark`): `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--text-light`, `--shell-surface`, `--shell-hover`, `--shell-active`; brand `--brand-primary`, `--brand-primary-l`, `--brand-accent`, `--brand-accent-soft`, `--brand-bg`; AI `--ai-color`, `--ai-bg`, `--ai-border`, `--ai-text`; status `--status-new|contacted|qualified|won|lost`; calendar `--calendar-tasks|meetings|calls|social`; layout `--header-height`, `--sidebar-width`, `--sidebar-collapsed`.
- `tailwind.config.js` maps brand/surface/status/AI colors to these variables, so `bg-brand-primary` etc. respond to runtime changes. Hardcoded hex (`bg-[#162847]`) does not.
- Use variables for adaptable surfaces and text. No new hex colors except intentional brand/status hues. Check hover, focus, selected, disabled, overlays, tables, charts and dialogs in both themes.
- Tenant brand colors: see [3-FEATURES.md → Settings and appearance](3-FEATURES.md#settings-and-appearance).

## Conventions

- Components `PascalCase.jsx`; hooks `useX.js`; API modules `xApi.js`; tests `*.test.js(x)` next to the code.
- Relative imports inside a feature; `@/` maps to `src/`.
- Server state = React Query (keys defined centrally per feature, e.g. `hooks/useActivityKeys.js`, `shared/constants/queryKeys.js`). Zustand only for app-wide or genuinely shared client state.
- Keep new components under ~300 lines; split into hooks and subcomponents. Do not grow 1000+ line files.
- Keep legacy filenames/URLs/payloads while consumers exist: add an adapter, migrate one consumer, verify, remove only when unused.
- Code that imports `services/httpClient` must mock it in tests (`vi.mock('.../services/httpClient', () => ({ default: {} }))`). Use `// @vitest-environment jsdom` for component and hook tests.
- Every data view handles loading, empty and error states; reuse `shared/components/data/ResourceState.jsx`, `feedback/EmptyState.jsx`, `feedback/Skeleton.jsx`.

## Shared engines

Import every engine from its `index.js` only — never from internal paths.

### DataTable

**Status:** CURRENT · **Path:** `shared/components/data-table` · **Demo:** `/playground/datatable`

Canonical configurable table: sorting, global search, per-column filter row, advanced filters and saved filters, pagination (client or server/infinite), column visibility, ordering, pinning, resizing, zoom, split rows/columns, compare dialog, row selection with context actions, mobile cards, copy/print, Excel export (SheetJS), and conditional format rules synced to the backend.

- **Main props:** `data`, `columns`, `tableId` (namespaces all persisted preferences), `isLoading`, `error`, `onRetry`, `emptyMessage`, `onRowClick`, `onRowDoubleClick`, `rowClassName`, `initialSort`, `sortFirstDirection`, `enableSorting|Filtering|Pagination|ColumnVisibility|AdvancedFilters|GlobalSearch|Export`, `showToolbar`, `showFooter`, `toolbarActions`, `onExport`, `onFilterChange`, `selectionContextActions`, `rowContextActions`, `serialColumnRender`; server paging: `serverPaginationMeta`, `hasNextPage`, `isFetchingNextPage`, `onLoadMore`.
- **Column definition:** `{ id, header, accessor ('a.b.c' dot paths), render(row), sortable, sortAccessor, searchable (default true), visible, canHide, width, filterType ('text'|'select'|'number'|'date'|'boolean'), filterOptions, enableFilter, type/dataType/format/formatType }`. Filter types and operators: `constants.js` (`FILTER_TYPES`, `FILTER_OPERATORS`).
- **Public API:** components (`DataTable`, toolbar/header/body/footer parts, `ExportDialog`, `ActiveFilters`, `ColumnFilter`, filter inputs; saved filters are internal to `DataTable`), hooks (`useDataTable`, `useSorting`, `useFiltering`, `usePagination`, `useColumnPreferences`, `useAdvancedFilters`, `useExport`, `useTableFormatRules`, re-exported `useTableFormatRulesRealtime`), utils (`buildFilterQuery`, `applyAllFilters`, export/clipboard/format-rule helpers), `tableFormatRulesApi`.
- **Backend:** format rules at `/api/tenant/table-format-rules` (list, get, create, replace, `PATCH {id}/toggle`, delete).
- **Persistence:** localStorage keys prefixed `datatable-*-{tableId}` (widths, order, pinned, zoom, split config). Always pass a stable, unique `tableId`.
- **Extend:** add a column property by reading it in the relevant part and documenting it here; add a filter type in `constants.js` + `filters/` + `utils/buildFilterQuery.js`; keep all copy in `locales/*/dataTable.js`.
- **Known issues:** operator labels in `constants.js` are hardcoded Arabic; RTL/dark visual QA not verified on every consumer. (The old `data-table - Copy` tree no longer exists.)

### Calendar

**Status:** CURRENT · **Engine:** `shared/components/calendar` · **Sources:** `features/calendar` · **Route:** `/calendar` (`pages/calendar/CalendarPage.jsx`)

- **Engine API:** `Calendar`, `CalendarToolbar`, `CalendarSidebar`, `MiniCalendar`, `EventPill`, views `MonthView|WeekView|DayView|YearView|CalendarTimeGrid`, `useCalendar` + `CALENDAR_VIEWS`, `createEventSourceRegistry`, calendar math utils. The engine never imports features.
- **Sources today:** `features/calendar/constants/calendarSources.js` registers `tasks`, `meetings`, `calls` (colors `--calendar-*`); adapters `activityEventAdapter.js` and `taskEventAdapter.js` (tested) map domain records to events; `useCalendarEvents`, `useVisibleSources`, `CreateEventMenu`, `ActivityPreviewDrawer` handle data and create/preview.
- **Extend:** add a source with one `register()` entry, an adapter to the event shape, and a color variable. No engine change needed.
- **Known issues:** `TaskCalendarView` (tasks) and `ActivityCalendar` (activities) still use their own calendar UIs; migrating them to the engine is open.

### Visual Flow

**Status:** CURRENT · **Path:** `shared/components/visual-flow` · **Demo:** `/playground/visual-flow`

Domain-neutral node/graph editor on top of `@xyflow/react`. Everything domain-specific arrives via props (registries, context, `resolveIcon`). Only `useVisualFlowState.js` and `useVisualFlowViewport.js` may call `@xyflow/react` state helpers directly.

- **`<VisualFlow>` props:** data (controlled `nodes`/`edges` + `onNodesChange`/`onEdgesChange`, or uncontrolled `defaultNodes`/`defaultEdges` — never mix), `nodeRegistry`, `edgeRegistry`, `mode` (`VISUAL_FLOW_MODES`: CREATE, EDIT, READONLY, LIVE, PREVIEW) plus partial `capabilities` overrides, `executionState` (LIVE), `resolveIcon`, `resolveFieldOptions`, `nodeComponents`, `edgeComponents`, `customConnectionValidators`, `isLoading`/`error`/`onRetry`, `leftPanel`/`rightPanel`/`bottomPanel` (pass `null` to remove), opt-in `toolbar` object.
- **Behavior:** undo/redo history (commit at logical boundaries, max 100), dirty tracking via `useVisualFlowPersistence` (no built-in save or autosave), session clipboard, keyboard shortcuts that ignore typing targets, `UnknownNode` for unregistered types so saved flows never crash, schema `CURRENT_SCHEMA_VERSION = 1` with `migrateFlow`.
- **Extend:** new node type = registry entry (`createNodeRegistry`, `combineNodeRegistries`), rendered by `BaseNode` — no new React file unless the shape differs fundamentally. New mode = entry in `constants/flowModes.js`. New panel = component passed via `leftPanel`/`rightPanel`. Backend shapes go through `createFlowAdapter({ fromApi, toApi })`.
- **Consumers:** `features/workflow-engine` (`WorkflowVisualCanvas`), `pages/automation/AutomationCenterPage.jsx` (`VisualFlowSidebar`).

### Pipeline Board

**Status:** CURRENT · **Path:** `shared/components/pipeline-board` · **Exports:** `PipelineBoard`, `PipelineCard`, `usePipelineDragDrop`

Generic stage board with HTML5 drag-and-drop and optional swimlanes; stages come from data, never hardcoded.

- **Props:** `stages`, `items`, `itemStageKey` (default `stage_id`), `itemIdKey` (default `id`), `groupBy` (swimlanes), `renderCard`, `renderEmpty`, `onItemMove(itemId, fromStageId, toStageId)`, `onTerminalStageDrop({ itemId, fromStageId, stage, laneId })`, `isInteractive`.
- **Stage shape:** `{ id, name|label, order, color, is_won_stage|is_terminal_won, is_lost_stage|is_terminal_lost }`. Dropping on a won/lost stage never calls `onItemMove`; the consumer must confirm via its own dialog and endpoint.
- **Consumer:** `pages/deals/DealWorkspacePage.jsx` ([2-SALES.md → Deals](2-SALES.md#deals)).

### Sidebar and navigation

**Status:** CURRENT · **Config:** `app/navigation/navigation.config.js` · **Renderer:** `shared/components/layout/Sidebar.jsx`, `Header.jsx` via `useNavigation()`

- **Principle:** the main sidebar lists business modules and primary destinations only (3–7 items per section). Filters, views, record details and actions live inside pages. Areas with more depth get their own internal sidebar: Leads Center (`pages/customers/layout/CustomersSidebar.jsx`), Settings, Products, Campaign Center, Outreach, Social Media.
- **Current sections:** Overview (Dashboard) · Sales (`module: 'sales'`: Leads, Customers, Activities, Deals, Proposals) · Growth (`module: 'growth'`: Social Media, Campaigns, Outreach Campaigns, Opportunity Center) · Workspace (Conversations, Tasks, Calendar, Team Chat, Products) · Automation (`module: 'automation'`: Automation Center) · Administration (Teams, Users, Templates, Settings).
- **Item schema:** `{ id, labelKey, icon, path, end?, activePatterns?, module?, permission?, featureFlag?, badge? }`; sections `{ id, type: 'section', labelKey, hideLabel?, module?, items }`. `path` must be an existing route.
- **Filtering:** `getVisibleNavigation` applies module → permission → feature flag → drops empty sections. `user.modules`/`user.permissions` are not sent by the backend yet, so everything is visible by design — the frontend never fabricates restrictions. `featureFlag` and `badge` are reserved placeholders.
- **Extend:** add one entry to `navigation.config.js` plus `nav.*` keys in both locales. Never hardcode items in `Sidebar.jsx`/`Header.jsx`. Do not add a Customer Service section until real pages ship.

### Other shared UI

- **Overlays:** `overlays/AppDrawer`, `AppModal`, `ConfirmDialog`, `FormDialog`, `DropdownMenu`. **UI:** `ui/Button` (brand-token variants), `Input`, `Select`, `Tabs`, `Badge`, `StatusBadge`, `Avatar`, `Pagination`, `Spinner`. **Feedback:** `EmptyState`, `Skeleton`, `ErrorBoundary`. **Data:** `ResourceState`, `PageToolbar`.
- Reuse these before writing a new dialog, drawer or date formatter (`shared/utils/dateTime.js`).
- Known issue: `ui/FormDialog.jsx` and `overlays/FormDialog.jsx` both exist; prefer `overlays/FormDialog`.

## Checks and commands

```bash
npm run dev                  # Vite on port 3000 (npm start binds 0.0.0.0 for tenant subdomains)
npm run lint                 # ESLint over src
npm run check:i18n           # AR/EN key parity + locale module registration (gate)
npm run check:architecture   # blocks new shared -> features imports (gate)
npx vitest run               # finite test run (npm test = watch mode)
npm run build
npm run check:all            # lint + i18n + architecture + vitest + build
npm run check:theme          # advisory: hardcoded colors
npm run check:hardcoded-text # advisory: literal UI strings
```

## Definition of Done

One checklist for every change (human or AI). Report anything you could not verify.

**Before coding**
- [ ] Owning domain chosen (`features/<domain>`); related domains, APIs and shared engines searched first. Watch the collision-prone pairs: activities/call-meetings, campaigns/outreach-campaigns, integrations/meta-integrations, leads/customers, opportunities vs deals.
- [ ] Routes preserved; new routes follow `app/router/index.jsx`. Navigation changes only via `navigation.config.js` (module/permission fields are UX-only).
- [ ] Tenant handling uses `services/tenantResolver.js`; existing `api/*.js` checked before adding an endpoint wrapper.
- [ ] Translation module chosen; RTL/LTR and theme tokens planned from the start.

**During development**
- [ ] Business logic in `features/`, pages stay thin, `shared/` stays domain-agnostic, no duplicate engine/dialog/table.
- [ ] Every user-visible string uses `t()` with AR **and** EN keys in the same change; enum labels translated, backend values untouched.
- [ ] Logical direction classes; no forced `dir` on screens; mixed-direction values kept LTR.
- [ ] Semantic CSS variables; light and dark both considered; responsive (mobile, tablet, desktop).
- [ ] Loading, empty and error states handled; permissions and tenant isolation considered.

**Before merge**
- [ ] `npm run lint`, `npm run check:i18n`, `npm run check:architecture`, `npx vitest run`, `npm run build` all pass (advisory `check:theme` / `check:hardcoded-text` output reviewed).
- [ ] RTL + LTR and light + dark verified, or explicitly reported as not verified.
- [ ] Existing APIs, payloads, query keys used by realtime, and routes remain compatible.
- [ ] Update the relevant section in docs/2-SALES.md or docs/3-FEATURES.md in the same change. Do not create new .md files; add a section instead. Architecture or rule changes update this file.

## Adding a new module

1. Inspect related domains and existing APIs; prefer **consuming** Customers, Conversations, Activities, Tasks, Teams, Users and Workflow Engine over duplicating them.
2. Create `features/<new-domain>` (API + hooks inside), compose the route page under `pages/`.
3. Add navigation + module/permission metadata (inert today) and both locale modules.
4. Automation → register definitions with `features/workflow-engine`; graph UI → `shared/components/visual-flow`; boards → `pipeline-board`; tables → `data-table`. Never build a second engine.
5. Cover loading/empty/error, tenant behavior, RTL/LTR and light/dark; add a section to [3-FEATURES.md](3-FEATURES.md) or [2-SALES.md](2-SALES.md).

## Known architecture debt

- **Security (backend-coordinated):** `VITE_API_PASSWORD` is sent as a URL query parameter on every API and realtime-auth call (visible in logs/history); access token persisted in localStorage.
- **Authorization:** no module/permission route guards; navigation filtering is inert until the backend sends `user.modules`/`user.permissions`.
- **Boundaries:** app-shell composition still inside `shared/components/layout` and `PageToolbar`; large route-owned domain UI in `pages/customers` (incl. proposal builder).
- **Bundle:** single large JS chunk (Vite chunk-size warning); route-level lazy loading for heavy screens (workflow builder, proposal builder, analytics) is open.
- **i18n / theme:** thousands of advisory hardcoded-text and hex-color findings remain (`check:hardcoded-text`, `check:theme`); a full authenticated AR/EN × light/dark × desktop/mobile visual QA has not been done. Least-audited areas: outreach, conversations, internal chat, workflow, integrations, teams/users/settings, app shell.
- **Ownership overlaps:** `features/integrations` vs `features/meta-integrations`; calls/meetings split across `features/activities`, `features/call-meetings`, `features/meetings`.
- **Tooling:** no circular-dependency check; test coverage is mostly pure logic (adapters, utils), not UI flows. `npm install` reports dependency audit advisories not yet reviewed.
