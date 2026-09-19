# ICAN CRM Architecture (CURRENT, 2026-09-18)

This document is the canonical placement and dependency policy for new frontend work. The existing tree is transitional; it is not permission to duplicate a domain. See `ARCHITECTURE_REFACTOR_REPORT.md` for verified exceptions and remaining debt.

## Model and ownership

Business capability -> `src/features/<domain>`; route composition -> `src/pages` (or a feature-owned route component while migrating); generic UI and pure infrastructure -> `src/shared`; application routing/navigation/providers -> `src/app`; HTTP/tenant transport -> `src/services`; cross-application state -> `src/store`; domain state -> `src/features/<domain>/store`; translations -> `src/locales/{ar,en}`.

A feature may contain `api`, `hooks`, `components`, `utils`, `schemas`, `store`, `adapters`, and an `index.js` public surface when useful. Create only directories with real code. Business APIs belong to their owning feature and call `services/httpClient`; query hooks belong beside them. Adapters translate legacy API shapes without changing the server contract. Do not put complete business workflows in route pages. Compose feature workspaces there and migrate oversized legacy pages incrementally.

Dependency direction: `app/pages -> features -> shared/services`; `features` may use other features through explicit public APIs when domain relationships require it. Generic `shared` must not import business features. The existing `shared/components/layout/MainLayout.jsx`, `Header.jsx`, and `shared/components/data/PageToolbar.jsx` are app-shell composition exceptions, not templates for new dependencies. Future shell integrations should move to `app` incrementally. `src/store` is for auth, theme and other application-wide state, not every form or query.

## Routes, navigation, authorization

`src/app/router/index.jsx` is the current route registry. Preserve URLs including `/LeadsCenter`, `/lead/:customerId`, `/activities`, `/campaigns` and `/outreach-campaigns`. Split by domain only with route-equivalence checks; lazy-load expensive screens after checking loading and error states. `src/app/navigation/navigation.config.js` is the sidebar/header destination source; `useNavigation.js` filters modules/permissions and resolves active paths. Add label keys in both locales and verify that each destination exists. A hidden nav item is **not** authorization. `PrivateRoute` currently enforces authentication; module/permission route guards are not generally implemented. Backend authorization is authoritative; do not imply frontend gating protects data.

Tenant resolution is handled by `services/tenantResolver.js`, `apiBaseUrl.js`, `httpClient.js`, and the Vite dev proxy. Do not hardcode a tenant. Keep bearer-token and `api_password` contracts compatible until the backend supports replacement. `VITE_*` values are embedded in browser assets: `VITE_API_PASSWORD` is **not a secret** even if its name suggests one. Moving it to a safe server-side credential exchange requires backend coordination; never publish its value in docs. Auth state is persisted in `store/authStore.js`; review token storage and refresh behavior before changing it. Realtime is owned by `src/realtime` with domain consumers in features.

## Domain boundaries

Leads and customers share the existing sales UI under `pages/customers`; `features/leads` and `features/customers` own APIs/hooks. Activities are the canonical activity API/UI; calls and meetings currently have a reusable `features/call-meetings` layer and activity consumers. Keep this bridge working, then migrate call/meeting/report ownership only with adapter tests. Advertising (`features/campaigns`, `features/meta-integrations`) means Meta ads, ad sets and lead forms. Outreach (`features/outreach-campaigns`) means messages to CRM contacts; its current API adapter consumes legacy `features/MessegeCampaign`. Never merge these campaign models by name alone. `features/integrations` owns connection capabilities; `meta-integrations` owns Meta-specific APIs until a tested ownership migration.

Customer Service is a navigation area, not a copy of Customers, Tasks, Conversations, or Activities. New tickets/SLA/escalation/knowledge-base concepts can own new features and consume those existing domains. Opportunities (discovery/center) are not automatically the same as a future qualified sales pipeline.

## Shared infrastructure

Use `shared/components/data-table` as the canonical configurable table. `shared/components/data-table - Copy` has no detected imports in `src` and is legacy; do not add consumers. `shared/components/calendar` is the generic Month/Week/Day/Year calendar engine (mirrors the Visual Flow contract: it never imports `features/`); `features/calendar` supplies the event-source registry, Task/Activity adapters, and the create/edit wiring, composed into `pages/calendar/CalendarPage.jsx` at `/calendar`. It is additive — `features/tasks/components/TaskCalendarView.jsx` and `features/activities/components/ActivityCalendar` are unchanged and still used by their own pages; migrating them onto the shared engine is a follow-up, not done yet. `shared/components/visual-flow` is the generic graph engine; `features/workflow-engine` supplies CRM-specific nodes, registries, data sources and local draft state. The workflow backend execution/persistence is **not implemented**. Keep generic rendering/interaction in Visual Flow and business actions in Workflow Engine.

Use generic overlays/forms from `shared/components` only for domain-independent behavior. Calls/meetings use `features/call-meetings` dialogs/drawers; proposal editor remains partly in `pages/customers/pages/proposals` and is a migration candidate. No new module-local copies of engines or shared dialogs.

## Localization, direction, theme

Use the existing i18next setup in `src/i18n.js`. Translations live in modular per-domain files under `src/locales/{ar,en}/<domain>.js`, assembled by `src/locales/{ar,en}/index.js` into the single `common` i18next namespace (see `docs/LOCALES_ARCHITECTURE.md` for the full directory map and how to add a new domain module). Prefer `t('domain.action')`; localize enum **labels**, never the backend value. Run `npm run check:i18n`. Static user-visible labels, toasts, validation, tooltips, empty and error states require both languages. The app root synchronizes document `lang` and `dir` on initialization and language changes; layout should use logical `start/end`, `ms/me`, `ps/pe`, and `inset-inline` where appropriate. Keep phone numbers, emails, identifiers and technical URLs LTR intentionally. Test Arabic RTL and English LTR.

Theme state lives in `store/themeStore.js` and `app/providers/ThemeProvider.jsx`. Use semantic CSS variables in `src/index.css` (`--brand-bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--shell-*`) for adaptable surfaces/text; preserve intentional brand and status hues. No second theme store. Inspect hover, focus, selected, disabled, overlays, DataTable, charts and dialogs in light/dark; a dark background alone is not coverage.

## Naming, migration and checks

Use descriptive domain names and consistent `PascalCase.jsx` components, `useX.js` hooks, `xApi.js` API modules, and domain translation keys. Prefer relative imports inside a feature; `@/` is available. A public feature index is useful for cross-domain imports, not required for every internal file. Keep legacy filenames/URLs/API payloads while consumers exist; add a compatibility adapter, migrate one consumer, verify, then retire unused code. Record meaningful ownership decisions in this document/report rather than creating empty folder hierarchies.

Adding a module: inspect related domains and APIs; choose ownership; implement API and hooks in the feature; compose its route page; add navigation/authorization metadata as appropriate; provide both translations; test RTL/LTR and light/dark; cover loading/empty/error and tenant behavior. Adding a page: keep it a composition layer and preserve existing URLs. Adding shared UI: prove domain independence and at least a plausible second consumer. Adding an integration: separate provider connection/auth from domain usage and keep credentials on the backend. Migrating legacy code: inventory imports, adapt contracts, migrate incrementally, test, then remove only when unused.

## Definition of Done (mandatory)

- [ ] Correct architectural owner; no unnecessary domain duplication; existing shared infrastructure reused.
- [ ] Arabic and English translations complete; no inappropriate hardcoded UI strings.
- [ ] RTL and LTR verified; light and dark modes verified; responsive layout verified.
- [ ] Permissions/modules and tenant isolation considered where relevant.
- [ ] Loading, empty and error states handled; existing APIs/routes compatible.
- [ ] Build, lint, translation/dependency checks and relevant tests pass.

Architecture compliance, translation/RTL support and dark-mode support are mandatory project-wide requirements, not optional polish.
