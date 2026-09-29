# ICAN CRM — Customer Hub (Service Operations)

Frontend domain doc for the Customer Service area. Business and backend contract live in
[customer-service/SERVICE-MASTER-SPEC.md](customer-service/SERVICE-MASTER-SPEC.md) (full, Arabic) and
[customer-service/SERVICE-BRIEF.md](customer-service/SERVICE-BRIEF.md) (decision brief). This file tracks
**what the frontend has built, where it lives, and the rules for adding more**. Update it in the same
change as the code (see [Phase log](#phase-log)).

**Status:** PARTIAL — F0 Foundation, F1 Case core and F2 Service operations (**MVP-1**) done. All data comes from the mock layer until the backend ships.

**Naming.** Users see this area as **Customer Hub / إدارة العملاء** (sidebar section), with
**Operations Center / مركز العمليات** as its home and **Services / الخدمات** as the customer-drawer tab —
it covers the whole customer relationship after the sale, not only support tickets. Code, routes and
keys keep the stable technical name `service` (`features/service`, `/service/*`, `service.*`,
`module: 'customer_service'`). Rename copy only in the locale files; never rename folders or routes for it.
A later option: let tenants override the section name through capabilities terminology.

## Contents

- [What it is](#what-it-is)
- [Phases](#phases)
- [Where the code lives](#where-the-code-lives)
- [How data flows (mock → live)](#how-data-flows-mock--live)
- [Capabilities and terminology](#capabilities-and-terminology)
- [i18n rules for Service](#i18n-rules-for-service)
- [Theme and dark mode](#theme-and-dark-mode)
- [Routes and navigation](#routes-and-navigation)
- [Integration points outside the area](#integration-points-outside-the-area)
- [API used by the frontend](#api-used-by-the-frontend)
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
| **F1** | Case core | Contacts & relationships, cases (list / board / detail, activities, timeline, notes), queues, Conversation → Case, My Work, customer drawer Service tab, Service navigation section | — | ✅ Done |
| **F2** | Service operations | SLA display & escalation states, saved replies & macros, internal knowledge base, CSAT, dashboard & reports, settings (case types, queues, SLA, business calendar, escalation), saved views | **MVP-1** (standalone helpdesk) | ✅ Done |
| **F3** | Service context | Pipeline editor (statuses/transitions per case type), item types & capabilities settings, service records (generic by type) with participants, components, entries, batches; assets, warranty, entitlements, contracts, handoffs, setup wizard | — | Planned |
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
├── mocks/                     ← demo backend: adapter, router, in-memory db, templates, seeds, handlers (README.md inside)
├── cases/                     ← F1: cases workspace, detail, create, transitions (README.md inside)
├── my-work/                   ← F1: My Work read model + Service Center counters (README.md inside)
├── contacts/                  ← F1: contacts & relationships (README.md inside)
├── customer-360/              ← F1: Service tab of the customer drawer (README.md inside)
├── settings/                  ← F2: generic settings framework + resource definitions (README.md inside)
├── sla/                       ← F2: SLA badge/panel (server-computed state) (README.md inside)
├── replies/                   ← F2: saved reply picker, macro menu (README.md inside)
├── knowledge/                 ← F2: knowledge base + suggested articles (README.md inside)
├── feedback/                  ← F2: CSAT list, score chip, case card (README.md inside)
├── reports/                   ← F2: reports dashboard (README.md inside)
├── saved-views/               ← F2: saved views per entity (README.md inside)
└── <sub-module>/              ← one folder per sub-module as phases ship: records/, assets/ …

src/pages/service/             ← thin route pages + serviceRoutes.js (README.md inside)
src/locales/{ar,en}/service.js ← `service.*` copy, split into ./service/*.js parts
```

Other touch points (keep them small):
- `src/app/router/index.jsx` — one line: `serviceRoutes`.
- `src/index.css` + `tailwind.config.js` — `--sla-*`, `--priority-*`, `--chart-*` tokens.
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
  - Charts: `--chart-1`, `--chart-2` (categorical, validated for color-vision deficiency on `--surface` in
    light and dark), `--chart-grid`. Status colors are never reused as series colors.
- Both light and dark values exist in `src/index.css`. A new state color = new token in both blocks +
  `tailwind.config.js` + this list — never a hex in JSX.
- `npm run check:service` fails on `bg-white`, `text-black`, `#fff/#000`, `bg-[#…]` classes and forced `dir="rtl"`.
- Logical direction only (`ms/me`, `ps/pe`, `start/end`); IDs, codes, phone numbers, amounts in `dir="ltr"` spans.

## Routes and navigation

| Route | Page | Phase |
|---|---|---|
| `/service` | `ServiceCenterPage` — counters per view, My Work preview, new case, demo banner | F1 |
| `/service/cases` | `ServiceCasesPage` — views (`?view=`), search (`?q=`), list or board (`?mode=board`) | F1 |
| `/service/cases/:caseId` | `ServiceCaseDetailPage` — timeline, reply / internal note, status, properties, contacts | F1 |
| `/service/my-work` | `ServiceMyWorkPage` — everything assigned to me | F1 |
| `/service/cases?saved=&priority=&queue=&type=` | Cases filters + saved views (same page) | F2 |
| `/service/knowledge` | `ServiceKnowledgePage` — search, category/status filters, article list | F2 |
| `/service/knowledge/:articleId` | `ServiceKnowledgeArticlePage` — editor; `new` creates a draft | F2 |
| `/service/reports` | `ServiceReportsPage` — `?tab=overview|feedback&period=7d|30d|90d` | F2 |
| `/service/settings/:section?` | `ServiceSettingsPage` — case types, queues, SLA policies, business hours, escalation, saved replies, macros, KB categories | F2 |
| `/service/overview` | `ServiceOverviewPage` — manifest, mock template switcher, roadmap | F0 |

- All Service routes are declared in `src/pages/service/serviceRoutes.js` and **lazy-loaded** (own chunks).
- Sidebar section **Customer Hub** (`navigation.config.js`, id `customer-service`): Operations Center, Cases,
  My Work, Knowledge Base, Reports, Operations Settings.
- Sidebar section `customer-service` (`module: 'customer_service'`, label `nav.sections.customerService`)
  in `app/navigation/navigation.config.js`: Service Center, Cases, My Work. Keep it at 3–7 items;
  deeper destinations (settings, records, reports) go inside `/service` pages or an internal sidebar (F2).

## Integration points outside the area

Customer Service plugs into existing screens without those screens importing Service internals:

| Where | How | Files touched |
|---|---|---|
| Conversations thread header → **Create case** | Workspaces accept an optional `threadHeaderActions` prop; `ConversationThread.headerActions` may be a function receiving the thread `contactDetails`. `pages/conversations/ConversationsPage.jsx` lazy-loads `CreateCaseFromConversationButton` and passes it. Conversations code never imports Service. | `features/conversations/components/{Whatsapp,Messenger,Gmail}ConversationsWorkspace.jsx`, `shared/ConversationThread.jsx`, `pages/conversations/ConversationsPage.jsx` |
| Customer drawer → **Service** tab | One `DRAWER_TABS` entry + one branch in `ActiveTabContent`; `tabs/CustomerServiceTabSlot.jsx` lazy-loads `CustomerServiceTab` and adapts the Leads Center row. | `pages/customers/components/CustomerDetailsDrawer/CustomerDetailsDrawer.jsx`, `tabs/CustomerServiceTabSlot.jsx` |
| Relative times | `formatRelativeTime(value, language)` added to `shared/utils/dateTime.js` (domain-neutral, tested). | `shared/utils/dateTime.js` |

## API used by the frontend

Every call below is served by the mock layer today with the exact shapes the screens need. It is the
**proposed contract for the backend** (built from the master spec §36, §24, §20.2, §51). Base path
`/api/tenant`. Lists use Laravel pagination meta `{ current_page, per_page, total, last_page }`. Errors use
the unified body `{ success:false, code, message, errors, meta:{ request_id } }` with codes
`VALIDATION_FAILED` (422), `CONFLICT_VERSION` (409), `CASE_TRANSITION_NOT_ALLOWED` (409), `NOT_FOUND`, `FORBIDDEN`, `FEATURE_DISABLED`.

| Method & path | Purpose | Notes |
|---|---|---|
| `GET /me/capabilities` | `{ template, models[], features[], terminology{}, permissions[] }` | Terminology values: term key or `{ ar, en }`. |
| `GET /service/cases/setup` | `{ case_types[{ id,key,label,icon,default_priority,pipeline{ version_id, statuses[{id,key,label,category,is_initial,is_terminal,sla_behavior}], transitions[{from,to,required_fields[]}] } }], queues[{id,key,label}], agents[{id,name}], resolution_codes[{key,label}], priorities[], severities[], channels[] }` | Labels `{ ar, en }`. Split into settings endpoints in F2. |
| `GET /service/cases/summary` | `{ views: { open, mine, unassigned, waiting_customer, waiting_internal, high_priority, sla_at_risk, sla_breached, resolved, closed, all } }` | Counts for tabs + Operations Center. |
| `GET /service/cases` | Paged cases. Params: `view`, `search`, `queue_id`, `type_id`, `priority`, `customer_id`, `sort` (`sla_due`), `page`, `per_page` | `view` filters are server-side (see `cases/constants/caseViews.js`). F2: each case carries `sla` (see `sla/README.md`) and `csat { score, comment, responded_at } | null`. |
| `POST /service/cases` | Create `{ customer_id, subject, type_id, description?, priority?, severity?, queue_id?, assignee_id?, source_channel? }` → 201 case | Initial status from the type pipeline. |
| `POST /service/cases/from-conversation/{conversationId}` | Same body; links the conversation and copies recent messages as context | |
| `GET /service/cases/{id}` / `PATCH` | Case / update `{ version, priority?, severity?, type_id?, subject?, description? }` | Stale `version` → 409. |
| `POST /service/cases/{id}/transition` | `{ version, to_status_id, …required_fields }` | Not in `transitions` → 409 `CASE_TRANSITION_NOT_ALLOWED`; missing field → 422. |
| `POST /service/cases/{id}/assign` | `{ version, assignee_id?, queue_id? }` | |
| `GET /service/cases/{id}/activities` | `[{ id, type, visibility, channel?, author{type,id,name}, body, metadata, occurred_at }]` | Types: `created, inbound, reply, internal_note, status_change, assignment, field_change`; F2 adds `sla_escalated {percent, action, target, metric, rule}` and `macro_applied {macro{id,name}}`. |
| `POST /service/cases/{id}/reply` / `notes` | `{ body }` → 201 activity | Reply goes out on the case channel via messaging policy. |
| `GET /service/customers/lookup?search=` | `[{ id, name, phone }]` | Proposed (not in the spec yet): light picker search. |
| `GET /my-work` | `[{ id, source_type, source_id, title, reference, customer, priority, status, due_at, updated_at }]` | Read model for the signed-in user. For cases `due_at` = `sla.next_due_at`. |
| `GET/POST /customers/{id}/contacts` | Contacts `{ id, name, phone, email, role{key,label}, is_primary, relationships[{id,relation_type,to_contact{id,name}}] }`; create `{ name, phone?, email?, role_key, relation?{ from_contact_id, relation_type } }` | |
| `GET /contacts/setup` | `{ roles[{key,label}], relation_types[{key,label}] }` | Tenant configuration. |
| `CRUD /service/case-types`, `/service/queues` | Case type `{ key, label, icon, default_priority, default_queue_id, sla_policy_id, active }`; queue `{ key, label, assignment_strategy: manual|round_robin|least_loaded, agent_ids[] }` | F2. Feed `cases/setup`. Delete in use → 409 `RESOURCE_IN_USE`. |
| `CRUD /service/sla-policies` | `{ name, order, priorities[], case_type_ids[], first_response_minutes, resolution_minutes, business_calendar_id, pause_on_pending_customer, active }` | F2. First active match by `order`; empty list = all. A case type may pin a policy. |
| `CRUD /service/business-calendars` | `{ name, timezone, working_hours[{day, enabled, start, end}], holidays[{date, name}] }` | F2. Used by SLA on the server. |
| `CRUD /service/escalation-rules` | `{ name, priorities[], triggers[{ at: % of SLA, action: notify|escalate, target }], active }` | F2. Server scheduler writes `sla_escalated` activities. |
| `CRUD /service/saved-replies`, `/service/macros` | See `replies/README.md` | F2. |
| `POST /service/cases/{id}/apply-macro` | `{ macro_id, version, language }` → case | F2. Atomic; 409/422 = nothing changed. |
| `CRUD /service/kb/categories`, `/service/kb/articles`, `POST …/articles/{id}/publish` | See `knowledge/README.md` | F2. Create = draft; publish needs `kb.publish`. |
| `GET /service/cases/{id}/suggested-articles` | Published articles for the case | F2. Proposed (not in spec §51 yet). |
| `GET /service/reports/overview?period=` | See `reports/README.md` | F2. Spec `/service/reports/{report_key}`. |
| `GET /service/feedback/responses?score=&period=&page=` | See `feedback/README.md` | F2. Proposed read endpoint (spec has `POST /feedback/responses`). |
| `CRUD /saved-views?entity=` | `{ entity, name, filters, visibility: private|shared, owner_id }` | F2. Core, cross-module. |

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

### F2 — Service operations (MVP-1) · 2026-09-29

- **Renamed (copy only):** sidebar section **Customer Hub / إدارة العملاء**, home **Operations Center /
  مركز العمليات**, drawer tab **Services / الخدمات**. Code, routes and keys unchanged (see **Naming** at the top).
- **Added:**
  - `settings/` — generic settings framework (resource definitions → list + dialog), screens for case
    types, queues, SLA policies, business hours, escalation rules, saved replies, macros, KB categories.
  - `sla/` — `SlaBadge` (tables, board cards, case header), `SlaPanel` (first response + resolution);
    case views `sla_at_risk`, `sla_breached`; Operations Center counters; `sla_escalated` timeline events.
  - `replies/` — saved reply picker in the composer (variables filled), macro menu on the case header.
  - `knowledge/` — knowledge base list + editor (draft / publish / archive / preview), suggested
    articles panel on cases.
  - `feedback/` — CSAT card on cases, feedback list with score filter.
  - `reports/` — overview dashboard (KPI tiles, new-vs-resolved trend, rating distribution,
    by type / channel / agent) with 7/30/90-day periods.
  - `saved-views/` + cases filters (priority / queue / type) and saved views (private / shared).
  - Pages: Knowledge, Knowledge article, Reports, Settings; nav items Knowledge Base, Reports, Operations Settings.
- **Outside the area:** `--chart-1/2`, `--chart-grid` tokens in `src/index.css` (light + dark).
- **Mock layer:** `mocks/crud.js` (generic CRUD handlers), `mocks/state/caseConfig.js` (editable case
  config), `mocks/state/sla.js` (SLA + escalation engine, wall-clock), `mocks/state/feedback.js`;
  seeds for operations, communication, KB and CSAT; 70 historical cases per template for reports.
- **Mocked modules:** capabilities, cases, queues, myWork, contacts, sla, replies, knowledge, feedback,
  reports, settings, savedViews. **Live modules:** none.
- **Tests:** settings / communication / insights handlers, SLA engine (states, views, pause, escalations),
  macro atomicity + versions, KB draft/publish, saved views, `renderTemplate`.
- **Checklist:** lint ✅ · i18n ✅ · architecture ✅ · service gate ✅ · vitest ✅ (601) · build ✅ ·
  screenshots AR light + EN dark (and AR dark for settings) on settings screens and dialogs, cases list
  with SLA column and filters, case detail (SLA panel, macros, saved replies, escalation events),
  Operations Center, knowledge list + editor, reports overview + feedback ✅ · works on the devices
  template (+ SLA distribution checked on all four templates) ✅ · real backend **not verified** (mock only).
- **Open:** pipeline (statuses/transitions) editor moved to F3; rich-text KB bodies with the portal (F5);
  business-time SLA and pause accounting live on the server only.

### F1 — Case core · 2026-09-29

- **Added:** `features/service/cases` (workspace with 9 server views + counts, list on DataTable with
  paged scroll, board by status category with drag-to-transition, detail with timeline / reply /
  internal note / properties, create dialog, transition dialog for required fields, conversation →
  case button), `my-work` (read model list + Service Center counters), `contacts` (panel + form with
  relationships), `customer-360` (Service tab); pages Service Center, Cases, Case detail, My Work;
  sidebar section; `core/utils` (`localizeLabel`, `serviceErrors`); `service.errors.*` copy.
- **Outside the area:** conversations thread-header slot, customer drawer Service tab, `formatRelativeTime`
  in `shared/utils/dateTime.js` (see [Integration points](#integration-points-outside-the-area)).
- **Mock layer:** seeds per template (case types, pipeline, queues, agents, resolution codes, customers,
  cases, activities, contacts); handlers enforce transitions, required fields and versions like the backend will.
- **Mocked modules:** capabilities, cases, queues, myWork, contacts. **Live modules:** none.
- **Tests:** case status helpers, cases and contacts handlers (views, create, transitions, 409/422,
  notes vs replies, template reseed), `localizeLabel`, `formatRelativeTime`.
- **Checklist:** lint ✅ · i18n ✅ · architecture ✅ · service gate ✅ · vitest ✅ · build ✅ ·
  light/dark + RTL/LTR verified with screenshots on Service Center, Cases (list + board), Case detail,
  create dialog and transition menu (AR light, EN dark, AR dark on the school template) ✅ ·
  Conversation → Case button and drawer Service tab **not visually verified** (need the real
  conversations/customers backend).

### F0 — Foundation · 2026-09-28

- **Added:** `features/service` (core api/capabilities/components/constants, mocks), `pages/service`
  (layout, overview page, lazy routes), `locales/{ar,en}/service*`, SLA/priority tokens, `check:service`,
  `VITE_SERVICE_MOCKS`, specs under `docs/customer-service/`.
- **Mocked modules:** capabilities (all). **Live modules:** none.
- **Tests:** router, mock adapter, mock db, serviceHttp, capabilities utils.
- **Checklist:** lint ✅ · i18n ✅ · architecture ✅ · service gate ✅ · vitest ✅ · build ✅ ·
  light/dark and RTL/LTR **not visually verified** (no authenticated tenant session in the build environment).
