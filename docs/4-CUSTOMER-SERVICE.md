# ICAN CRM — Customer Service (Service Operations)

Frontend domain doc for the Customer Service area. Business and backend contract live in
[customer-service/SERVICE-MASTER-SPEC.md](customer-service/SERVICE-MASTER-SPEC.md) (full, Arabic) and
[customer-service/SERVICE-BRIEF.md](customer-service/SERVICE-BRIEF.md) (decision brief). This file tracks
**what the frontend has built, where it lives, and the rules for adding more**. Update it in the same
change as the code (see [Phase log](#phase-log)).

**Status:** PARTIAL — F0 Foundation done. All data comes from the mock layer until the backend ships.

## Contents

- [What it is](#what-it-is)
- [Phases](#phases)
- [Where the code lives](#where-the-code-lives)
- [How data flows (mock → live)](#how-data-flows-mock--live)
- [Capabilities and terminology](#capabilities-and-terminology)
- [i18n rules for Service](#i18n-rules-for-service)
- [Theme and dark mode](#theme-and-dark-mode)
- [Routes and navigation](#routes-and-navigation)
- [Adding a sub-module](#adding-a-sub-module)
- [Per-phase checklist](#per-phase-checklist)
- [Phase log](#phase-log)

---

## What it is

Service Operations manages the customer **after the sale**: cases/tickets, SLA, service records
(bookings, shipments, enrollments, projects), assets and warranty, entitlements, contracts, installments,
scheduling, work orders, follow-ups and a customer portal. It works with Sales (contract → handoff) or as
a standalone package.

The one rule that shapes the frontend: **industries are configuration, not code.** Screens read the
tenant's *capabilities manifest* (enabled models, features, terminology) and render from it. A screen
that needs `if (industry === 'tourism')` is a design bug.

## Phases

Eight frontend phases, numbered like the backend phases so both sides line up. The same list lives in
code (`features/service/core/constants/serviceModules.js`) and is rendered live on `/service`.

| Phase | Name | Frontend scope | Milestone | Status |
|---|---|---|---|---|
| **F0** | Foundation | Module structure, mock transport, capabilities + terminology, locale module, SLA/priority theme tokens, `check:service` gate, docs | — | ✅ Done |
| **F1** | Case core | Contacts & relationships, cases (list / board / detail, activities, timeline, notes), queues, Conversation → Case, My Work, customer drawer Service tab, Service navigation section | — | ⏳ Next |
| **F2** | Service operations | SLA display & escalation states, saved replies & macros, internal knowledge base, CSAT, dashboard & reports, settings (case types, pipelines, queues, SLA, business calendar) | **MVP-1** (standalone helpdesk) | Planned |
| **F3** | Service context | Item types & capabilities settings, service records (generic by type) with participants, components, entries, batches; assets, warranty, entitlements, contracts, handoffs, setup wizard | — | Planned |
| **F4** | Billing & scheduling | Payment plans, deal preview, schedules & payments, collections workspace, scheduling & capacity, work orders, courier/technician views | — | Planned |
| **F5** | Portal & growth | Customer portal app (self / guardian / B2B / guest), imports, follow-up programs, portfolios, operations workspaces | **MVP-2** (pilot) | Planned |
| **F6** | Knowledge & quality | Public KB & self-service, quality reviews, NPS/CES, template versioning, form & workflow builders | — | Planned |
| **F7** | AI | Triage, suggested replies/articles, summaries, AI agent, health score | — | Planned |

Frontend can run ahead of the backend: each phase ships on mock data and flips to live module by module.

## Where the code lives

Everything that belongs to Customer Service is under **three roots** — nothing else needs opening:

```text
src/features/service/          ← all business code (README.md inside)
├── index.js                   ← public surface: pages/other features import ONLY from here
├── core/                      ← shared by every service sub-module (README.md inside)
│   ├── api/                   ← serviceHttp (mock/live switch), endpoints
│   ├── capabilities/          ← manifest API, useServiceCapabilities, useServiceTerminology
│   ├── components/            ← service-wide UI (mock banner, roadmap, capabilities overview)
│   └── constants/             ← serviceModules (phases registry), catalog keys, query keys
├── mocks/                     ← demo backend: adapter, router, in-memory db, templates, handlers (README.md inside)
└── <sub-module>/              ← one folder per sub-module from F1 on: cases/, contacts/, queues/, sla/ …

src/pages/service/             ← thin route pages + serviceRoutes.js (README.md inside)
src/locales/{ar,en}/service.js ← `service.*` copy, split into ./service/*.js parts
```

Other touch points (keep them small):
- `src/app/router/index.jsx` — one line: `serviceRoutes`.
- `src/index.css` + `tailwind.config.js` — `--sla-*`, `--priority-*` tokens.
- `scripts/check-service.mjs` — strict gate for this area.
- `.env.example` — `VITE_SERVICE_MOCKS`.

Sub-module shape (create only folders that have code):

```text
features/service/cases/
├── README.md        ← what it does, API, query keys, components, open issues
├── api/casesApi.js  ← uses createServiceApi('cases')
├── hooks/           ← React Query hooks (keys from core/constants/queryKeys.js)
├── components/
├── utils/           ← pure logic + *.test.js
└── index.js         ← optional sub-module surface, re-exported from features/service/index.js
```

## How data flows (mock → live)

```text
component → hook (React Query) → casesApi → createServiceApi('cases') → httpClient
                                                     │
                         module mocked?  ── yes ──► adapter = mocks/mockAdapter (lazy chunk)
                                                     │                 └─ handlers → in-memory db
                                                     └── no ──► real Laravel backend
```

- URLs, payloads and error shapes are **identical** to the backend contract (spec §51). Mock handlers
  throw `MockHttpError(status, CODE)` so screens handle real errors (`409 CONFLICT_VERSION`,
  `CASE_TRANSITION_NOT_ALLOWED`, `FEATURE_DISABLED`) from day one.
- `serviceModules.js` → `backend: 'mock' | 'live'` per module. Backend ships a module → flip it to
  `'live'`, test, log it below. No page/hook change.
- `VITE_SERVICE_MOCKS`: `auto` (default, follows the registry) · `all` (demos) · `none` (verify live).
- Mock state is in memory (resets on reload). The selected **industry template** (devices, tourism,
  school, shipping) persists in localStorage and is switched from the banner on `/service`.
- Never put business rules in the frontend to "make the mock work" (installment math, SLA due dates,
  entitlement checks). Mocks return results; the backend owns the logic.

## Capabilities and terminology

- `useServiceCapabilities()` → `{ manifest: { template, models, features, terminology, permissions }, hasFeature }`
  from `GET /api/tenant/me/capabilities`.
- Show/hide sections with `hasFeature('assets')`, never with model letters or industry names.
- `useServiceTerminology()` → `term('case')` / `term('record', 'other')`. The manifest sends a term key
  (`'ticket'` → `service.terms.ticket.*`) or a tenant label `{ ar, en }`. Use it for every entity name
  in Service screens (titles, buttons, empty states).

## i18n rules for Service

- Key root: `service.*`, module file `src/locales/{ar,en}/service.js`, parts in `./service/`:
  `core.js` (title, overview, mock, roadmap), `phases.js` (phases, modules), `catalog.js`
  (models, features), `terms.js` (terminology).
- New sub-module copy → new part file (`./service/cases.js` → `service.cases.*`) in **both** languages
  in the same change; import it in both `service.js` files.
- Translate enum labels (`service.cases.status.${value}`), never backend values or user data.
- Gates: `npm run check:i18n` (parity) and `npm run check:service` (no literals in Service code).

## Theme and dark mode

- Use semantic variables (`--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`,
  `--brand-*`, `--ai-*`) and the Service tokens:
  - SLA: `--sla-on-track`, `--sla-at-risk`, `--sla-breached`, `--sla-paused` → `text-sla-at-risk`, `bg-sla-breached` …
  - Priority: `--priority-low|normal|high|urgent` → `text-priority-urgent` …
- Both light and dark values exist in `src/index.css`. A new state color = new token in both blocks +
  `tailwind.config.js` + this list — never a hex in JSX.
- `npm run check:service` fails on `bg-white`, `text-black`, `#fff/#000`, `bg-[#…]` classes and forced `dir="rtl"`.
- Logical direction only (`ms/me`, `ps/pe`, `start/end`); IDs, codes, phone numbers, amounts in `dir="ltr"` spans.

## Routes and navigation

| Route | Page | Phase |
|---|---|---|
| `/service` | `ServiceOverviewPage` — manifest, mock template switcher, roadmap | F0 |

- All Service routes are declared in `src/pages/service/serviceRoutes.js` and **lazy-loaded** (own chunks).
- No sidebar section yet (architecture rule: add it when real pages ship). F1 adds the
  `customer_service` section in `app/navigation/navigation.config.js` with `module: 'customer_service'`.

## Adding a sub-module

1. Pick its entry in `serviceModules.js` (phase, folder); set `status: 'in_progress'`.
2. Create `features/service/<folder>/` with `README.md`, `api/` (via `createServiceApi('<key>')`), hooks, components.
3. Add query keys under `serviceKeys` in `core/constants/queryKeys.js`.
4. Add mock handlers `mocks/handlers/<key>Handlers.js` + seed via `registerSeed`, register in `mocks/handlers/index.js`.
   Seeds must work for **every** template (test by switching templates on `/service`).
5. Add copy in `src/locales/{ar,en}/service/<key>.js` and import it in both `service.js`.
6. Add pages + routes in `pages/service/`; export only what pages need from `features/service/index.js`.
7. Run the checklist below, set `status: 'done'`, add a [Phase log](#phase-log) entry.

## Per-phase checklist

Copy into the phase log entry and tick honestly (write "not verified" when true).

- [ ] `npm run lint` · `check:i18n` · `check:architecture` · `check:service` · `npx vitest run` · `build`
- [ ] Every new string in AR and EN; terminology via `term()`
- [ ] Light + dark checked on every new screen (tables, dialogs, hover/focus/disabled states)
- [ ] RTL + LTR checked; mixed-direction values in LTR spans
- [ ] Loading, empty and error states (including mock 4xx/409)
- [ ] Works on at least two industry templates without code changes
- [ ] Sub-module README + this doc + `3-FEATURES.md` section updated

## Phase log

### F0 — Foundation · 2026-09-28

- **Added:** `features/service` (core api/capabilities/components/constants, mocks), `pages/service`
  (layout, overview page, lazy routes), `locales/{ar,en}/service*`, SLA/priority tokens, `check:service`,
  `VITE_SERVICE_MOCKS`, specs under `docs/customer-service/`.
- **Mocked modules:** capabilities (all). **Live modules:** none.
- **Tests:** router, mock adapter, mock db, serviceHttp, capabilities utils.
- **Checklist:** lint ✅ · i18n ✅ · architecture ✅ · service gate ✅ · vitest ✅ · build ✅ ·
  light/dark and RTL/LTR **not visually verified** (no authenticated tenant session in the build environment).
