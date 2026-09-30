# ICAN CRM — Customer Hub (Service Operations)

Frontend domain doc for the Customer Service area. Business and backend contract live in
[customer-service/SERVICE-MASTER-SPEC.md](customer-service/SERVICE-MASTER-SPEC.md) (full, Arabic) and
[customer-service/SERVICE-BRIEF.md](customer-service/SERVICE-BRIEF.md) (decision brief). This file tracks
**what the frontend has built, where it lives, and the rules for adding more**. Update it in the same
change as the code (see [Phase log](#phase-log)).

**Status:** FRONTEND PHASES DONE — F0 Foundation, F1 Case core, F2 Service operations (**MVP-1**), F3 Service context, F4 Billing & scheduling, F5 Portal & growth (**MVP-2**), F6 Knowledge & quality and F7 AI are built. All data comes from the mock layer until the backend ships (no module is live yet). Field service, inventory and the supplier portal were moved to a later phase ([Deferred](#deferred-to-a-later-phase)).

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
- [Deferred to a later phase](#deferred-to-a-later-phase)
- [Phase log](#phase-log) — [F7](#f7--ai--2026-09-30) · [F6](#f6--knowledge--quality--2026-09-30) · [F5](#f5--portal--growth-mvp-2--2026-09-30) · [F4](#f4--billing-lite-subscriptions-scheduling-work-orders--2026-09-30) · [F3](#f3--service-context--2026-09-29) · [F2](#f2--service-operations-mvp-1--2026-09-29) · [F1](#f1--case-core--2026-09-29) · [F0](#f0--foundation--2026-09-28)

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
| **F3** | Service context | Pipeline editor (statuses/transitions per case type), item types & capabilities settings, service records (generic by type) with participants, components, entries, batches; assets, warranty, entitlements, contracts, handoffs, setup wizard | — | ✅ Done |
| **F4** | Billing & scheduling | Payment plans + preview engine (reusable calculator), schedules & payments, collections workspace, subscriptions lifecycle, scheduling & capacity, work orders, courier dispatch + POD, COD remittances | — | ✅ Done (see F4 log for what is left) |
| **F5** | Portal & growth | Customer portal app (self / guardian / B2B / guest) + portal admin & request catalog, imports, follow-up programs, portfolios, API clients & webhooks | **MVP-2** (pilot) | ✅ Done (see F5 log for what is left) |
| **F6** | Knowledge & quality | KB versions + review workflow + expiry + stats, portal help & public help center, deflection; quality checklists, sampling, reviews (RCA/CAPA); NPS/CES; Workflow Engine registration; case-type form builder; template versioning; global search; major incidents | — | ✅ Done (see F6 log) |
| **F7** | AI | AI signals, triage, summaries, same-language draft replies, duplicates, assignment suggestions, AI settings & usage; portal AI agent with handoff; customer health score, at-risk list, advanced analytics; subscription proration | — | ✅ Done — AI only; field service / inventory / supplier portal deferred (see F7 log) |

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
├── catalog/                   ← F3: capability registry UI, item types editor, catalog items service config (README.md inside)
├── pipelines/                 ← F3: pipeline editor (statuses + transitions) (README.md inside)
├── records/                   ← F3: service records, participants, components, entries, documents, batches (README.md inside)
├── assets/                    ← F3: assets & warranty (README.md inside)
├── entitlements/              ← F3: entitlements, ledger, case coverage (README.md inside)
├── contracts/                 ← F3: contracts, versions, signatures, amendments (README.md inside)
├── handoffs/                  ← F3: Sales → Service handoff inbox (README.md inside)
├── setup/                     ← F3: setup wizard (industry templates) (README.md inside)
├── billing/                   ← F4: payment plans, preview, schedules, payments, collections (README.md inside)
├── subscriptions/             ← F4: subscription lifecycle (README.md inside)
├── scheduling/                ← F4: resources, reservations/holds, slots (README.md inside)
├── work-orders/               ← F4: work orders & field visits (README.md inside)
├── deliveries/                ← F4: courier dispatch, proof of delivery, COD remittances (README.md inside)
├── portal-admin/              ← F5: portal accounts & memberships, policies, request catalog, branding (README.md inside)
├── imports/                   ← F5: CSV import wizard, dry run, error file (README.md inside)
├── follow-ups/                ← F5: follow-up programs, workspace, manual enroll (README.md inside)
├── portfolios/                ← F5: customer portfolios and owners (README.md inside)
├── api-access/                ← F5: public API clients, outbound webhooks, delivery log (README.md inside)
├── quality/                   ← F6: checklists, sampling, reviews with RCA/CAPA, NPS/CES survey settings (README.md inside)
├── workflow/                  ← F6: Customer Hub triggers/conditions/actions registered in features/workflow-engine (README.md inside)
├── incidents/                 ← F6: major incidents, linked cases, public updates (README.md inside)
├── search/                    ← F6: global service search (README.md inside)
├── ai/                        ← F7: AI signals, case panel, summaries, draft replies, duplicates, AI settings + agent (README.md inside)
├── health/                    ← F7: health score card, at-risk customers, advanced analytics (README.md inside)
├── portal-transport.js        ← F5: the only Service file the portal app may import (portal endpoints + mock switch)
└── <sub-module>/              ← one folder per sub-module as phases ship

src/pages/service/             ← thin route pages + serviceRoutes.js (README.md inside)
src/locales/{ar,en}/service.js ← `service.*` copy, split into ./service/*.js parts
```

The **customer portal** (F5) is a second app in the same repo, not part of the staff CRM bundle:

```text
portal.html                    ← second Vite entry (vite.config.js: rollup input + dev rewrite of /portal/*)
src/portal/                    ← app shell: main, PortalApp (providers, branding), router (README.md inside)
src/features/portal/           ← portal domain: auth, layout, pages, session store (README.md inside)
src/services/portalHttpClient.js ← portal token only; never the staff session
src/locales/{ar,en}/portal.js  ← `portal.*` copy
```

Other touch points (keep them small):
- `src/app/router/index.jsx` — one line: `serviceRoutes`.
- `src/index.css` + `tailwind.config.js` — `--sla-*`, `--priority-*`, `--chart-*` tokens.
- `scripts/check-service.mjs` — strict gate for this area.
- `.env.example` — `VITE_SERVICE_MOCKS`, `VITE_PORTAL_BASENAME` (portal router base, default `/portal`).
- `vite.config.js` — `portal.html` build input and the dev middleware that serves it for `/portal/*`.

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
| `/service/knowledge` | `ServiceKnowledgePage` — search, category/status filters, article list; F6: views `?status=changes|expiring`, stats (views, helpful rate, deflections, content gaps) | F2 · F6 |
| `/service/knowledge/:articleId` | `ServiceKnowledgeArticlePage` — editor; `new` creates a draft. F6: type, expiry date, reviewer, review workflow (submit → approve/reject → publish → archive), versions drawer with restore | F2 · F6 |
| `/service/reports` | `ServiceReportsPage` — `?tab=overview|feedback|quality|advanced&period=7d|30d|90d` (quality = F6 review workspace, advanced = F7 analytics) | F2 · F6 · F7 |
| `/service/incidents/:incidentId?` | `ServiceIncidentsPage` — major incidents list + detail (linked from the Operations Center) | F6 |
| `/service/settings/:section?` | `ServiceSettingsPage` — setup wizard, import data, case types, queues, catalog (items, item types, record types, pipelines), contract types, payment plans + assignments, scheduling resources, follow-up programs, portfolios, portal (accounts, policies, request catalog, branding), API clients, webhooks, SLA policies, business hours, escalation, saved replies, macros, KB categories; F6: template version, quality checklists, sampling rules, surveys, case-type form fields; F7: AI settings, AI agent | F2–F7 |
| `/service/records/:recordType?/:recordId?` | `ServiceRecordsPage` / `ServiceRecordDetailPage` inside `ServicesHubLayout` (Services hub) | F3 |
| `/service/batches/:recordType?/:batchId?` | `ServiceBatchesPage` (Services hub) | F3 |
| `/service/assets/:assetId?` | `ServiceAssetsPage` (Services hub, feature `assets`) | F3 |
| `/service/entitlements` | `ServiceEntitlementsPage` (Services hub, feature `entitlements`) | F3 |
| `/service/contracts/:contractId?` | `ServiceContractsPage` (Services hub) | F3 |
| `/service/handoffs/:handoffId?` | `ServiceHandoffsPage` (Services hub) | F3 |
| `/service/billing/:view?` (`schedules`, `collections`, `calculator`), `/service/billing/schedules/:scheduleId` | `ServiceBillingPage` (Services hub tab "Payments") | F4 |
| `/service/subscriptions/:subscriptionId?` | `ServiceSubscriptionsPage` (Services hub, feature `subscriptions`) | F4 |
| `/service/work-orders/:workOrderId?` | `ServiceWorkOrdersPage` (Services hub, feature `workOrders`) | F4 |
| `/service/scheduling` | `ServiceSchedulingPage` (Services hub, features `scheduling` / `workOrders` / `courierAssignment`) | F4 |
| `/service/deliveries` | `ServiceDeliveriesPage` (Services hub, feature `courierAssignment`) | F4 |
| `/service/follow-ups` | `ServiceFollowUpsPage` (Services hub tab "Follow-ups") — due buckets, outcome drawer, manual enroll | F5 |
| `/portal/*` (separate app) | `login`, `track` (guest), then `/`, `services/:recordId?`, `requests`, `requests/new`, `requests/:caseId`, `catalog`, `payments`, `assets`, `documents`, `help`, `company` — sections shown = tenant-enabled ∩ membership policy. F6: `help/:articleId`, KB suggestions + "this solved it" on new request, NPS/CES card, incident banner; public `/portal/help-center` (no sign-in, when enabled). F7: AI assistant chat bubble (when the AI agent is on) | F5 · F6 · F7 |
| `/service/overview` | `ServiceOverviewPage` — manifest, mock template switcher, roadmap | F0 |

- All Service routes are declared in `src/pages/service/serviceRoutes.js` and **lazy-loaded** (own chunks).
- Sidebar section **Customer Hub** (`navigation.config.js`, id `customer-service`): Operations Center, Cases,
  Services, My Work, Knowledge Base, Reports, Operations Settings (7 items — the limit).
- **Services hub**: one sidebar item; its tabs (`core/components/ServicesHubNav.jsx`) come from record types
  (+ their batches) and features (`assets`, `entitlements`), then Work orders, Scheduling, Deliveries, Subscriptions, Follow-ups (F5), Contracts, Handoffs and Payments (F4). New areas that
  belong to "what the customer has" (subscriptions, schedules, work orders) become tabs here, not sidebar items.
- Sidebar section id `customer-service` (`module: 'customer_service'`, label `nav.sections.customerService`)
  in `app/navigation/navigation.config.js`. Keep it at 3–7 items; new destinations (incidents F6, quality and
  advanced reports F6/F7, AI settings F7) go inside `/service` pages — Operations Center links, Reports tabs, settings groups —
  never as new sidebar items.

## Integration points outside the area

Customer Service plugs into existing screens without those screens importing Service internals:

| Where | How | Files touched |
|---|---|---|
| Conversations thread header → **Create case** | Workspaces accept an optional `threadHeaderActions` prop; `ConversationThread.headerActions` may be a function receiving the thread `contactDetails`. `pages/conversations/ConversationsPage.jsx` lazy-loads `CreateCaseFromConversationButton` and passes it. Conversations code never imports Service. | `features/conversations/components/{Whatsapp,Messenger,Gmail}ConversationsWorkspace.jsx`, `shared/ConversationThread.jsx`, `pages/conversations/ConversationsPage.jsx` |
| Customer drawer → **Service** tab | One `DRAWER_TABS` entry + one branch in `ActiveTabContent`; `tabs/CustomerServiceTabSlot.jsx` lazy-loads `CustomerServiceTab` and adapts the Leads Center row. | `pages/customers/components/CustomerDetailsDrawer/CustomerDetailsDrawer.jsx`, `tabs/CustomerServiceTabSlot.jsx` |
| Relative times | `formatRelativeTime(value, language)` added to `shared/utils/dateTime.js` (domain-neutral, tested). | `shared/utils/dateTime.js` |
| Workflow Engine (F6) | `features/service/workflow/serviceWorkflowDefinition.js` calls `registerWorkflowModule` / `registerDataSource`; one import line loads it. The engine gained fixed `options` on data sources (returned by `useDataSourceOptions`). The engine never imports Service internals. | `features/workflow-engine/config/registerBuiltinModules.js`, `registry/workflowRegistry.js`, `hooks/useDataSourceOptions.js` |
| Customer drawer → **Health** (F7) | `HealthScoreCard` inside the Service tab (`customer-360`). | `features/service/customer-360/*` (inside the area) |

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
| `GET /catalog/capabilities`, `GET /catalog/service-models` | Capability registry (`config_fields`) and model presets A–H | F3. Code-owned on the backend; proposed read endpoints. |
| `CRUD /catalog/item-types` | `{ key, name, kind, service_model_preset, capabilities[{code,version,config}], record_type_id, default_case_type_ids[], active }` | F3. Unknown capability / missing `depends_on` → 422. |
| `GET /catalog/items`, `PATCH /catalog/items/{id} { service_config }` | Existing Products & Services + service config (type, fulfillment, relations) | F3. Product fields stay on the existing Products endpoints (unchanged). |
| `CRUD /pipelines` | Statuses + transitions; every save = new version; `tmp-*` status ids remapped by the server | F3. Status in use removed → 409 `PIPELINE_STATUS_IN_USE`. Case types gain `pipeline_id`. |
| `CRUD /service/record-types` | `{ key, label, icon, pipeline_id, participant_roles[{key,label,min,max}], component_types[], entry_types[], batch_enabled, batch_label, fields[], portal_visible }` | F3. |
| `/service/records…`, `/service/batches…` | See `records/README.md` | F3. |
| `/service/assets…`, `/service/warranties/{id}/void`, `/service/entitlements…` (+ `/check`, `/{id}/transactions`) | See `assets/README.md`, `entitlements/README.md` | F3. |
| `CRUD /contract-types`, `/contracts…` (+ send/sign/activate/terminate/cancel/renew/amendments) | See `contracts/README.md` | F3. |
| `GET /service/handoffs`, `GET|PATCH /service/handoffs/{id}`, `POST …/accept|reject|reprocess` | See `handoffs/README.md` | F3. |
| `GET /settings/templates`, `POST /settings/templates/{key}/apply { models, terminology, dry_run }` | Setup wizard | F3. Idempotent; dry run previews. |
| `CRUD /billing/payment-plans` (`?item_id=` → plans for an item), `CRUD /billing/payment-plan-assignments`, `POST /billing/payment-plans/{id}/preview` | See `billing/README.md` | F4. Preview saves nothing; amounts only from the server. |
| `GET /billing/schedules[/{id}]`, `POST /billing/schedules/{id}/payments|reschedule|cancel|payoff-quote|promises`, `…/reschedule/approve|reject`, `POST /billing/payments/{id}/reverse`, `POST /billing/lines/{id}/waive-fee`, `GET /billing/collections` | See `billing/README.md` | F4. List, promises, approve/reject, reverse and collections are **proposed**. |
| `CRUD /subscriptions`, `POST /subscriptions/{id}/cancel|suspend|resume|renew`, `POST …/periods/{id}/pay` | See `subscriptions/README.md` | F4. Period pay is proposed (crm payments mode). |
| `CRUD /scheduling/resources`, `GET /scheduling/availability`, `GET|POST /reservations`, `POST /reservations/{id}/confirm`, `DELETE /reservations/{id}` | See `scheduling/README.md` | F4. Resources CRUD + confirm proposed; 409 `RESERVATION_CONFLICT`. |
| `CRUD /service/work-orders` (PATCH = assign + book slot), `POST …/on-the-way|check-in|check-out|complete|cancel` | See `work-orders/README.md` | F4. on-the-way / cancel proposed. |
| `GET /service/deliveries`, `POST …/{recordId}/assign|out-for-delivery|attempts`, `CRUD /billing/cod-remittances` (+ `/pending`, `/{id}/pay`) | See `deliveries/README.md` | F4. Deliveries endpoints proposed. |
| `CRUD /portal/policies`, `CRUD /service/catalog-items` (request catalog), `GET|PUT /portal/settings`, `/portal/accounts` (+ `/{id}/memberships`, `/revoke-sessions`, `/resend-invite`) | See `portal-admin/README.md` | F5. Accounts, memberships and settings are proposed staff endpoints. |
| `/api/portal/*` — `settings`, `auth/otp|verify|login|logout`, `me` (+ `/switch`), `records`, `cases`, `schedules`, `payments`, `assets`, `entitlements`, `subscriptions`, `contracts`, `documents`, `document-requirements/{id}/upload`, `catalog` (+ `/{id}/request`), `kb`, `feedback`, `remittances`, `org/users`, `track` | See `features/portal/README.md` | F5. Portal token (not the staff session); every call scoped to the active membership; OTP never reveals whether an account exists. |
| `POST /imports` (dry run), `POST /imports/{id}/execute`, `GET /imports[/{id}]`, `/imports/entities|fields|files|mappings`, `GET /imports/{id}/error-file` | See `imports/README.md` | F5. Entities, fields, files, mappings and error file proposed. |
| `CRUD /follow-up-programs`, `GET|POST /follow-ups`, `POST /follow-ups/{id}/outcome|exit` | See `follow-ups/README.md` | F5. Enrollment endpoints proposed; live creates Tasks in the Task Engine. |
| `CRUD /portfolios`, `/portfolios/{id}/members` (GET/POST/PATCH/DELETE), `POST /portfolios/{id}/distribute` | See `portfolios/README.md` | F5. Members + distribute proposed. |
| `CRUD /api-clients` (+ `/catalog`, `/{id}/rotate`), `CRUD /webhook-subscriptions` (+ `/rotate-secret`, `/test`, `/deliveries`), `POST /webhook-deliveries/{id}/redeliver` | See `api-access/README.md` | F5. Clear key / secret only in the create and rotate responses. |
| `GET /service/kb/articles?status=changes|expiring` (+ `meta.counts`), `GET …/articles/{id}/versions`, `POST …/versions/{v}/restore`, `POST …/articles/{id}/submit-review|reject|publish|archive|unarchive`, `GET /service/kb/stats` | See `knowledge/README.md` | F6. Reject needs a note; live = published version, not archived, not expired. Stats include content gaps (portal searches with no result) and deflections. |
| `/api/portal/kb` (+ `/{id}`, `/{id}/vote`, `/suggest`, `/deflections`), `/api/portal/public/kb[/{id}]`, `GET /api/portal/surveys/active` | See `features/portal/README.md` | F6. Portal shows `customer`+`public` articles; public help only `public`, only when `public_help_center` is on. |
| `CRUD /service/quality/checklists`, `/quality/sampling-rules`, `/feedback/surveys`; `POST /quality/sampling/run`; `GET|POST /quality/reviews`, `GET|PATCH|DELETE /quality/reviews/{id}`; `GET /quality/summary` | See `quality/README.md` | F6. Sampling is idempotent; a failing review needs RCA + CAPA (422). Weighted score on the server. |
| `GET /service/feedback/responses?survey=csat|nps|ces` (+ NPS/CES summaries) | See `feedback/README.md` | F6. A low portal score opens a case (server rule). |
| `GET /service/search?q=` | Grouped results (cases, customers, records, articles) | F6. Proposed. |
| `GET|POST /service/incidents`, `GET /service/incidents/{id}`, `POST …/{id}/updates|link`, `GET /api/portal/incidents/active` | See `incidents/README.md` | F6. Proposed. `409 INCIDENT_RESOLVED`. |
| `GET /settings/templates/installation`, `POST …/installation/upgrade { dry_run, choices }` | See `setup/README.md` | F6. Proposed. `409 TEMPLATE_UP_TO_DATE`. Never deletes; conflicts default to "keep mine". |
| `CRUD /service/case-types` gains `form_fields[]`; `POST/PATCH /service/cases` accept `custom_fields{}` | See `cases/README.md` | F6. Required custom fields → 422 `custom_fields.<key>`. |
| `GET|PUT /service/ai/settings`, `GET /service/ai/usage`, `POST /service/ai/triage`, `GET|POST /service/cases/{id}/ai/summary`, `GET …/ai/duplicates|assignment`, `POST …/ai/suggest-reply|feedback`, `POST /service/cases/{id}/mark-duplicate` | See `ai/README.md` | F7. Proposed (spec §45). `403 FEATURE_DISABLED` when a feature is off, `429 AI_LIMIT_REACHED` over the monthly limit. Cases carry `ai_signals` (sentiment, urgency, topics). |
| `POST /api/portal/assistant/messages`, `GET /service/ai/agent/conversations`, `POST /service/ai/agent/test` | See `ai/README.md` | F7. Customer-scoped tools only; hands over to a person on sensitive / handoff topics; the test console never opens a case. |
| `GET /service/customers/{id}/health`, `GET /service/health?band=`, `GET /service/reports/advanced?period=` | See `health/README.md` | F7. Proposed. Score + band (healthy / watch / at_risk) + factors computed on the server. |
| `POST /subscriptions/{id}/change-preview`, `PATCH /subscriptions/{id} { pending_change: { effective: 'now' } }` | See `subscriptions/README.md` | F7. Proration: extra charge line or credit balance. Proposed. |

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

## Deferred to a later phase

Agreed at the start of F6/F7 (2026-09-30): F7 ships **AI only**. These spec areas move to a later phase (F8),
built when a pilot tenant needs them:
- **Field service** beyond F4 work orders: technician mobile view, routes, parts used on a visit, offline check-in.
- **Inventory**: spare parts, warehouses, stock movements, reservations against work orders.
- **Supplier portal**: supplier accounts, purchase requests, supplier-side updates (reuses the portal app shell).

Also not built yet (smaller): AI summaries of a conversation / handoff, a staff view of live portal assistant chats
(the mock shows seeded conversations; chats made in the portal tab live in a separate in-memory mock), backend execution of
the Customer Hub workflow items (all `backendSupport: false`).

## Phase log

### F7 — AI · 2026-09-30

Rule for everything below (spec §45.1): **AI gives signals and suggestions; people and rules decide.** Nothing is
sent, assigned or closed by the AI on its own, except the portal AI agent, which only uses customer-scoped tools
and hands over to a person.
- **Added:**
  - `ai/` — AI signal chips on cases (sentiment, urgency, topics); **triage hint** in the create dialog (suggested type,
    priority, queue); case **AI panel**: summary (regenerate), possible duplicates (mark as duplicate), assignment
    suggestions with reasons, feedback (useful / not useful); **draft reply** button in the composer, grounded only in
    KB articles in the reply's language; **AI settings** (features on/off, tone, language, auto-reply, blocked topics,
    handoff topics, monthly limit) + usage & acceptance card (settings group "AI").
  - **AI agent** — portal chat bubble (`PortalAssistant`) when the tenant turns it on: answers from KB, request status and
    payments of *this* customer, opens a request only when asked, hands over on sensitive / handoff topics. Staff panel
    (settings → AI agent) with conversation log and a test console on one customer (never opens a case).
  - `health/` — **health score** card in the customer drawer (score, band, factors), **at-risk customers** in the
    Operations Center, **advanced report** tab (aging, repeat contact, deflection, AI resolution, workload, follow-ups).
  - Subscriptions: **change plan** dialog with preview; effective now → proration line or credit balance.
- **Mock layer:** `state/aiEngine.js`, `aiAgent.js`, `healthScore.js`, `proration.js` (pure + tested); handlers `aiHandlers`,
  `aiAgentHandlers`, `healthHandlers`; `serializeCase` adds `ai_signals`.
- **Not built:** real model calls (server), conversation / handoff summaries, staff live view of portal chats, field
  service / inventory / supplier portal ([Deferred](#deferred-to-a-later-phase)).
- **Mocked modules:** ai, health (+ all earlier). **Live:** none.

### F6 — Knowledge & quality · 2026-09-30

- **Added:**
  - **Knowledge** — article versions (drawer + restore), review workflow (draft → review → approve/reject with note →
    publish → archive/unarchive), article type, expiry date and reviewer, views "changes requested" and "expiring", stats
    (views, helpful rate, deflections, **content gaps** = portal searches with no result).
  - **Self-service** — portal help (search, categories, article, helpful vote), KB suggestions while writing a request
    with "this solved it" (deflection), and a **public help center** (`/portal/help-center`, no sign-in, `public`
    articles only, switch in portal settings). Fixed: portal no longer leaks internal articles through category visibility.
  - `quality/` — checklists with weighted criteria, sampling rules + idempotent sampling run, review drawer (scores,
    auto-fail criteria, RCA + CAPA required when failing), "Send to quality" on a case, quality tab in Reports, quality
    average per agent.
  - **Surveys** — CSAT / NPS / CES definitions (settings → Quality), NPS/CES summaries in Feedback, portal NPS/CES card,
    low score opens a case.
  - `workflow/` — Customer Hub triggers (11), conditions (5) and actions (8) registered in the app's **Workflow Engine**
    (one import line, `backendSupport: false`).
  - **Form builder** for case types (`form_fields`), custom fields in the create dialog and case sidebar.
  - **Template versioning** (settings → General → Template version): dry-run diff, conflicts, take/keep, history.
  - `search/` — global search in the Operations Center. `incidents/` — major incidents with linked cases, status updates,
    public updates to linked requests and a portal banner.
- **Outside the area:** `features/workflow-engine` (registry `options`, `useDataSourceOptions` default case, one import in
  `registerBuiltinModules.js`); `features/portal` (help pages, deflection, survey card, incident banner, assistant).
- **Mock layer:** `state/kbLive.js`, `qualityScore.js`, `templateUpgrades.js`; handlers `kbHandlers` (article routes moved out
  of `communicationHandlers`), `portalKbHandlers`, `qualityHandlers`, `templateVersionHandlers`, `searchIncidentHandlers`;
  seeds for quality, surveys, KB search log / deflections, case-type form fields, one active incident.
- **Not built:** rich text / attachments in articles, multi-step KB approval chains, calibration sessions for reviewers,
  visual form logic (conditions between fields), backend execution of workflow items.

**F6 + F7 checklist:** lint ✅ · i18n ✅ · architecture ✅ · service gate ✅ · vitest ✅ (764 tests) · build ✅ ·
screenshots (EN light / AR dark) of KB workflow, versions, stats, portal help + public help center, deflection, quality
workspace + review drawer, surveys, AI panel, draft reply, triage hint, AI settings, AI agent (portal + staff), advanced
report, at-risk list, change-plan dialog, workflow palette, form builder, template versions, search, incidents ✅ ·
customer drawer health card **not visually verified** (needs the real customers backend).

### F5 — Portal & growth (MVP-2) · 2026-09-30

- **Added:**
  - `portal-admin/` (settings group "Customer portal"): portal accounts with memberships (self / guardian /
    organization member + B2B role), invite / resend / disable / revoke sessions, embeddable per customer (customer
    drawer "Portal access" section when the `portal` feature is on); **portal policies** (object + actions, deny wins);
    **request catalog** (case type, form schema, required documents, scheduling, payment, audience); portal branding
    and enabled sections.
  - **Customer portal app** — separate entry `portal.html` → `src/portal` + `features/portal`, own HTTP client
    (`services/portalHttpClient.js`, portal token only; verified the portal bundle contains no staff `httpClient`), own
    session store, AR/EN + RTL + dark mode, tenant branding. Sign-in by one-time code or B2B email + password, profile
    switcher across memberships, guest shipment tracking, and sections: home, my services (detail, updates, documents
    upload), requests (list, detail, reply, new), request catalog forms, payments, what I have, documents, help (KB +
    feedback), company users. Sections = tenant-enabled ∩ policy.
  - `imports/` (settings → Import data): CSV upload, column mapping with suggestions and saved mappings, create or
    upsert by match key, dry run with per-row errors, execute valid rows, downloadable error file to fix and re-upload;
    service records (any type) and assets.
  - `follow-ups/`: follow-up programs in settings (timed steps from start or back from the end date, channel,
    checklist, outcomes, per-outcome rules: next / bounded retry / open a request; editing bumps the version);
    Services hub tab **Follow-ups** (overdue, due today, upcoming, finished, all; outcome drawer with checklist, note,
    history, stop; manual enroll).
  - `portfolios/` (settings → Portfolios): owners, members, least-loaded add, change owner, rebalance; programs can
    assign to the **portfolio owner**.
  - `api-access/` (settings group "API & webhooks"): API clients (scopes, bound to one customer with limited scopes,
    rate limit, IP allowlist, rotate / disable / delete; key shown once), outbound webhooks (https only, events by area,
    test ping, rotate secret, pause, health) and a delivery log with redelivery.
- **Outside the area:** second Vite entry (`portal.html`, `vite.config.js` input + dev rewrite), `services/portalHttpClient.js`,
  `locales/{ar,en}/portal.js` registered in both `index.js`, `scripts/check-service.mjs` now also scans `features/portal`
  and `src/portal`. `.env.example` gains `VITE_PORTAL_BASENAME`.
- **Mock layer:** `state/portalAccess.js` (sessions, memberships, policy checks), `importEngine.js` (CSV parser, validation,
  error file), `followUpEngine.js` (offsets, rules, due buckets) — pure + tested; handlers for portal admin, portal,
  imports, follow-ups + portfolios, API access. Portal mock sessions persist in localStorage (demo code `123456`,
  company password `Portal@123`).
- **Acceptance (spec §55 Phase 5) — demonstrated on the mock:** a guardian sees only the data of the customer on the active
  membership and only what the policy allows (test); the "student sees only themself" case uses the same scoping but has no
  separate test; a B2B *accounting* user cannot create a shipment (deny wins);
  guest tracking returns exactly one record and nothing else; an API key bound to a customer can only hold record / case /
  tracking scopes. *Not demonstrable in the frontend:* "10,000-row import does not slow other tenants" (server queue).
- **Not built in F5 (next / needs backend):** file storage for uploads (names only in the mock), real payment gateway
  redirect, contract PDFs, MFA, B2B bulk shipment upload in the portal, Excel import (CSV only), the public API itself
  (`/public/v1`), event-triggered enrollment and exit conditions (server), automatic portfolio membership by criteria,
  portfolio owner on the customer drawer, operations workspaces beyond the existing ones.
- **Mocked modules:** portal, imports, followUps, portfolios, apiAccess (+ all earlier). **Live modules:** none.
- **Tests:** portal access + portal handlers, portal admin, import engine + handlers + mapping suggestions, follow-up engine
  + editor mapping + handlers, API access handlers (730 tests, full suite green).
- **Checklist:** lint ✅ · i18n ✅ · architecture ✅ · service gate ✅ · vitest ✅ · build ✅ · screenshots (AR light / EN dark;
  devices, shipping, school) of portal settings, portal app (login, code, home, services, record, requests, catalog form,
  payments, assets, documents, help, company, guest tracking), import wizard steps, follow-ups workspace + drawer + enroll,
  program editor, portfolios, API clients + one-time key, webhooks + delivery log ✅ · customer drawer "Portal access"
  section **not visually verified** (needs the real customers backend).

### F4 — Billing Lite, subscriptions, scheduling, work orders · 2026-09-30

- **Added:**
  - `billing/`: payment plans (components as rules, limits, interest, reservation fee) + plan assignments in settings;
    reusable **PlanCalculator** / **PlanPreviewTable** (server preview; the Deals screen is **not** changed — it can
    embed the calculator later); payment schedules created when a contract with `payment_plan_id` is signed
    (contract create gained an optional plan); schedule detail (lines, late fees, payments, promises), record payment
    (oldest first, fee before principal), reverse (negative record), waive late fee, payoff quote + settlement,
    reschedule with approval (new version, old kept `rescheduled`), cancel; **collections** workspace (overdue,
    due today, next 7 days, promises, aging 1–30 / 31–60 / 61–90 / 90+).
  - `subscriptions/`: handoff processor now creates real subscriptions; lifecycle trial → active → past_due →
    suspended → cancelled/expired, auto/manual renewal, cancel now or at period end, price change from next period,
    billing periods with mark paid; linked entitlements follow suspension/expiry.
  - `scheduling/`: resources (settings), day board per resource in the calendar time zone, holds that expire,
    no double booking, reusable **SlotPicker**.
  - `work-orders/`: create, schedule via slot (books a reservation), on the way, check-in, complete (outcome, parts,
    labor, signature) — **completion consumes the linked entitlement into the ledger**; cancel releases the slot.
  - `deliveries/`: courier dispatch (daily capacity), attempts + proof of delivery (signature / photo / OTP) as record
    entries, COD collection check, failed after 3 attempts; COD remittances per merchant (fees, net, paid).
  - Customer drawer Services tab: subscriptions and payment schedules sections. Hub tabs: Work orders, Scheduling,
    Deliveries, Subscriptions, Payments (feature-driven).
- **Outside the area:** shared `DataTable` bug fix — clicking a rendered cell tried to copy the React element and threw
  "circular structure"; it now copies the accessor value (`DataTableBody.jsx`, `clipboardHelpers.js`).
- **Mock layer:** `state/paymentPlanEngine.js`, `billingLedger.js`, `billingSchedules.js`, `subscriptionLifecycle.js`,
  `schedulingEngine.js` (pure + tested); seeds for plans, schedules, subscriptions, resources/reservations/work orders,
  deliveries/remittances. Jobs the server runs on a schedule (late fees, hold expiry, subscription lifecycle) run on read.
- **Acceptance (spec §55 Phase 4) — demonstrated on the mock:** the real-estate example (§29.6) produces the table exactly
  in amounts; lines always add up to the final price (property test); a hold expires automatically; the same technician /
  unit cannot be booked twice for the same time; reschedule keeps the old schedule; completing a work order writes the
  entitlement consumption to the ledger.
- **Spec discrepancy to confirm:** in the §29.6 8-year example the last (32nd) quarterly installment is dated
  **2034-07-01** in the spec table; 32 quarters from 2027-01-01 end on **2034-10-01** (2034-07-01 is the 31st).
  The engine and its test use 2034-10-01.
- **Not built in F4 (next / needs backend):** Deal payment tab + approvals engine (spec §29.7 — Deals screen untouched on
  purpose), schedule transfer / resale (§29.11), ERP / gateway sync and webhooks (§29.15), receipt / photo / signature
  uploads, suppliers, SLA on service records, delivery-issue case workflow, proration and pause for subscriptions.
- **Mocked modules:** billing, subscriptions, scheduling, workOrders, deliveries (+ all earlier). **Live modules:** none.
- **Tests:** payment plan engine (incl. property test), billing ledger, subscription lifecycle, scheduling engine and
  handler tests for plans, schedules, subscriptions, scheduling/work orders and deliveries (681 tests, full suite green).
- **Checklist:** lint ✅ · i18n ✅ · architecture ✅ · service gate ✅ · vitest ✅ · build ✅ · screenshots (AR light /
  EN dark; devices, shipping) of plan settings, calculator, schedules, schedule detail + payment / payoff / reschedule
  approval, collections, subscriptions list/detail, scheduling board + new reservation, work order flow, deliveries +
  COD ✅ · customer drawer sections **not visually verified** (needs the real customers backend).

### F3 — Service context · 2026-09-29

- **Added:**
  - `catalog/` + `pipelines/`: capability registry rendered from backend `config_fields`, model presets (A–H only
    pre-select capabilities), item types, record types (participant roles, component/entry types, batches, field
    schema), pipeline editor (statuses + transition matrix, versioned), catalog items' service config
    (type, fulfillment, attached services) — **without touching the existing Products screens or endpoints**.
  - `records/`: Services hub, records per type (views, table, create), detail tabs derived from configuration
    (overview + tenant fields, participants with min/max, components with supplier status and margin, entries,
    required documents upload/verify/reject, timeline + customer updates), batches with bulk status.
  - `assets/` + `entitlements/`: assets with warranty state, detail (warranties/void, entitlements, service
    history, ownership transfer), entitlements with ledger balance and manual movements, case **Coverage** panel.
  - `contracts/` + `handoffs/`: contract types, contracts (versions, signatures, immutable signed snapshot,
    amendments applying only the difference, renew/terminate), handoff inbox and detail (created entities,
    needs_review + reprocess, checklist, promises, accept/return to sales).
  - `setup/`: setup wizard (template → models → terminology → dry-run review → apply).
  - Customer drawer **Services** tab now shows records per type, assets, entitlements and contracts.
  - Sidebar: one **Services** item (hub) — section stays at 7 items.
- **Outside the area:** none (Products, Sales and Conversations code unchanged).
- **Mock layer:** `state/handoffProcessor.js` (idempotent, needs_review on unconfigured lines, amendments as
  difference), pipelines collection with versions, seeds for catalog/records/assets/contracts per template.
- **Acceptance (spec §55 Phase 3) — demonstrated on the mock:** a signed contract for a B-model product with
  attached installation creates asset + warranty + entitlement + work order; a line without setup →
  `needs_review` without failing the rest; reprocessing is idempotent; an amendment applies only the new line;
  the same code runs the tourism template (booking record). *Subscription* is represented by an id +
  entitlement until the subscriptions module (F4).
- **Mocked modules:** all of the above + catalog, pipelines, records, assets, entitlements, contracts, handoffs,
  setup. **Live modules:** none.
- **Tests:** catalog/pipelines/records/assets/contracts/setup handlers, capability helpers, pipeline editing
  helpers, record type helpers (95 service tests; full suite green).
- **Checklist:** lint ✅ · i18n ✅ · architecture ✅ · service gate ✅ · vitest ✅ · build ✅ · screenshots
  (AR light / EN dark, AR dark on school) of catalog settings + dialogs, pipeline editor, records list/detail
  tabs (tourism, school, shipping), batch detail, assets list/detail, entitlements, case coverage, contracts
  list/detail, handoff inbox/detail, setup wizard + apply ✅ · customer drawer Services tab **not visually
  verified** (needs the real customers backend) · document builder / PDF (spec §28) **not in F3**.
- **Open decisions:** merge the service config into the Products form later (needs a backend change to the
  product endpoints); status `customer_label` for the portal (F5); custom fields engine for record `fields` (F6).

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
