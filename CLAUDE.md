# ICAN CRM — Claude Code guide

Multi-tenant Omnichannel CRM **frontend**: leads/customers, sales pipeline, lead assignment,
Meta ad campaigns, outreach messaging, WhatsApp/Messenger/Gmail inbox, activities, tasks,
proposals, automation. The backend (Laravel) is a separate repo; this repo never owns
business rules that belong to the server (authorization, events, queues, assignment execution).

Stack: React 19, Vite 5, React Router 6, TanStack Query 5, Axios, Zustand, Tailwind + CSS
variables, i18next (ar/en), React Hook Form + Zod, Laravel Echo/Pusher (Reverb), @xyflow/react,
@dnd-kit, Recharts, Vitest.

## Commands

```bash
npm run dev                 # port 3000
npm run lint
npm run check:i18n          # ar/en key parity + locale module registration
npm run check:architecture  # blocks new shared -> features imports
npx vitest run              # finite test run (npm test = watch mode, don't use it in automation)
npm run build
```

All five checks must pass before you say a task is done. Report anything you could not
verify (e.g. no login/backend available => UI not visually tested).

Do not commit build output (`dist/`), `dist.rar`, or local logs (`.codex/`).

## Where things live

| Path | Owns |
|---|---|
| `src/features/<domain>/` | Business capability: `api/`, `hooks/`, `components/`, `utils/`, `schemas/`, `store/`, `adapters/`. **New business logic goes here.** |
| `src/pages/` | Route composition only. Thin pages that assemble feature components. |
| `src/shared/` | Domain-independent UI and utilities. **Must never import from `features/`.** |
| `src/app/` | Router (`app/router/index.jsx`), navigation (`app/navigation/navigation.config.js`), providers |
| `src/services/` | HTTP + tenant transport: `httpClient.js`, `tenantResolver.js`, `apiBaseUrl.js` |
| `src/realtime/` | Echo/Reverb setup + realtime hooks (some update React Query caches directly; the conversation hooks hand events to consumers that do) |
| `src/store/` | App-wide state only: `authStore`, `themeStore`, `pageHeaderStore` |
| `src/locales/{ar,en}/<domain>.js` | Translations, registered in `src/locales/{ar,en}/index.js` |

Dependency direction: `app/pages -> features -> shared/services`. A feature may use another
feature only through that feature's public exports when the domain relationship is real.

Legacy/transitional (don't copy these patterns, don't add to them):
- `src/pages/customers/**` still contains a lot of business UI (drawer,
  proposals builder, sales teams, activity timeline). Migrate out incrementally; don't grow it.
- `shared/components/layout/{MainLayout,Header}.jsx` and `shared/components/data/PageToolbar.jsx`
  are allowed app-shell exceptions that import features.
- `features/MessegeCampaign` (misspelled, legacy) is still used by `features/outreach-campaigns`.
- Files of 1–3 lines that only re-export are compatibility shims; update imports instead of adding more.

## Domain map (read the linked doc before working in an area)

| Area | Code | Doc |
|---|---|---|
| Leads & customers (`/leads`, `/LeadsCenter/*`, `/lead/:customerId`) | `features/leads`, `features/customers`, `pages/customers` | [Leads Center](docs/2-SALES.md#leads-center-pages), [Customer drawer](docs/2-SALES.md#customer-details-drawer), [Domain model](docs/2-SALES.md#domain-model) |
| Lead assignment | `features/leads/api/leadAssignmentApi.js`, `/LeadsCenter/assignments` | [Leads & assignment](docs/2-SALES.md#leads-page-and-lead-assignment) |
| Statuses / definitions | `features/definitions` | [Statuses & tags](docs/2-SALES.md#statuses-tags-and-pipeline) |
| Activities, calls, meetings | `features/activities`, `features/call-meetings`, `features/meetings` | [Activities](docs/2-SALES.md#activities-calls-and-meetings) |
| Conversations (WhatsApp/Messenger/Gmail) | `features/conversations` (adapters in `channels/`, shared chat UI in `components/shared/`), `pages/conversations`, `src/realtime/hooks` | [Conversations](docs/3-FEATURES.md#conversations) |
| Internal team chat | `features/internal-chat` | [Internal chat](docs/3-FEATURES.md#internal-chat) |
| Ad campaigns (Meta ads, ad sets, lead forms) | `features/campaigns`, `features/meta-integrations`, `pages/campaigns` | [Ad campaigns](docs/3-FEATURES.md#ad-campaigns-and-meta-integrations) |
| Outreach campaigns (messages to CRM contacts) | `features/outreach-campaigns`, `pages/outreach-campaigns` | [Outreach](docs/3-FEATURES.md#outreach-campaigns) |
| Social media | `features/social-media`, `pages/social-media` | [Social media](docs/3-FEATURES.md#social-media) |
| Deals / opportunities | `features/deals`, `features/opportunities` | [Deals](docs/2-SALES.md#deals), [Opportunities](docs/2-SALES.md#opportunities) |
| Proposals | `features/proposals`, `pages/customers/pages/proposals` | [Proposals](docs/2-SALES.md#proposals) |
| Tasks | `features/tasks` | [Tasks](docs/3-FEATURES.md#tasks) |
| Automation | `features/workflow-engine` + `shared/components/visual-flow` | [Workflow engine](docs/3-FEATURES.md#workflow-engine-and-automation), [Visual Flow](docs/1-ARCHITECTURE.md#visual-flow) |
| Data table | `shared/components/data-table` (canonical table) | [DataTable](docs/1-ARCHITECTURE.md#datatable) |
| Sidebar / navigation | `app/navigation`, `shared/components/layout` | [Sidebar & navigation](docs/1-ARCHITECTURE.md#sidebar-and-navigation) |
| Calendar | `shared/components/calendar` (engine) + `features/calendar` (sources) | [Calendar](docs/1-ARCHITECTURE.md#calendar) |
| Realtime | `src/realtime` | [Realtime](docs/1-ARCHITECTURE.md#realtime) |
| Translations | `src/locales` | [i18n](docs/1-ARCHITECTURE.md#i18n) |
| Customer Service (tickets/SLA/inbox) | **PLANNED — no code yet** | [Customer Service](docs/3-FEATURES.md#customer-service--planned) |

Do not confuse: **campaigns** (paid Meta ads) ≠ **outreach-campaigns** (sending messages).
`integrations` (connection capabilities) and `meta-integrations` (Meta APIs) overlap — ask before moving code between them.

Policy docs: [docs/1-ARCHITECTURE.md](docs/1-ARCHITECTURE.md) (rules; checklist in
[Definition of Done](docs/1-ARCHITECTURE.md#definition-of-done)); domain docs [docs/2-SALES.md](docs/2-SALES.md)
and [docs/3-FEATURES.md](docs/3-FEATURES.md). If docs and code disagree, **the code wins**; historical
reports were removed (see git history).

## Non-negotiable rules

1. **Never change** backend request shapes, endpoints, React Query keys that realtime handlers
   update, or route URLs (including `/LeadsCenter` casing) unless the task explicitly says so.
2. **Tenant**: never hardcode a tenant. All HTTP goes through `services/httpClient`, which adds the
   bearer token and `api_password`. `VITE_*` values are public in the bundle — never treat them as secrets.
3. **Authorization is the backend's job.** Hiding a nav item is not protection; route guards
   currently check authentication only.
4. **i18n**: every user-visible string (labels, toasts, errors, empty states, tooltips, aria-labels)
   uses `t('domain.key')` with keys added to BOTH `ar` and `en`. Translate enum labels, never
   backend values. Don't add new hardcoded Arabic/English text.
5. **RTL/LTR**: use logical classes (`ms/me`, `ps/pe`, `start/end`). Don't force `dir="rtl"`.
   Phone numbers, emails, URLs, IDs stay LTR.
6. **Theme**: use semantic CSS variables from `src/index.css` (`--surface`, `--surface-2`,
   `--border`, `--text`, `--text-muted`, `--shell-*`). No new hex colors in JSX except
   intentional brand/status colors. Check light and dark.
7. **Reuse before building**: `shared/components/data-table`, `overlays/` (AppDrawer, AppModal,
   ConfirmDialog, FormDialog), `feedback/` (EmptyState, Skeleton, ErrorBoundary), `ui/`,
   `shared/utils/dateTime.js`. Search before writing a new date formatter or dialog.
8. Handle loading, empty and error states for every data view.
9. Keep new components under ~300 lines; split large ones into hooks + subcomponents.
   Don't make existing 1000+ line files bigger.

## Conventions

- Components `PascalCase.jsx`, hooks `useX.js`, API modules `xApi.js`, query hooks next to their API.
- Relative imports inside a feature; `@/` alias maps to `src/`.
- Server state = React Query. Zustand only for app-wide or genuinely shared client state.
- Tests: `*.test.js` next to the code. Code that imports `services/httpClient` needs it mocked in tests
  (it throws without a tenant subdomain and `VITE_API_PASSWORD`).

## Working style

- Before a non-trivial change: read the area's doc (table above), list the files and consumers you
  will touch, and state the plan. For multi-step refactors, stop after each phase for review.
- Move/rename in small steps: add adapter → migrate one consumer → verify → remove old code only
  when unused.
- When you change a feature's structure or behavior, update its doc in the same change.
- If something is riskier or bigger than the task describes, stop and ask.
