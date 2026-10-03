# ICAN CRM — Documentation index

> **Documentation update:** 2026-10-04 00:17 (Africa/Cairo) — deal creation wizard `/deals/new` and work template by products (deals spec §5, §9.10). 2026-10-03 23:32 (Africa/Cairo) — Deals rebuilt: hub + workspace per deal, spec and backend contract (`deals/DEALS-WORKSPACE-SPEC.md`), READMEs `features/deals`, `pages/deals`. 2026-10-02 03:00 (Africa/Cairo) — To-Do page `/todo` separated from Tasks (`pages/todo` README). 2026-10-02 02:40 (Africa/Cairo) — Tasks F2 (record tasks panel, quick actions, picker). 2026-10-02 01:35 (Africa/Cairo) — Tasks & To-Do spec (`tasks/TASKS-TODO-SPEC.md`) and `features/tasks` README. 2026-10-01 23:55 (Africa/Cairo) — login showcase slider and Arabic login guide. 2026-10-01 23:30 (Africa/Cairo) — login page and sign-in methods (`features/auth` README). 2026-10-01 02:35 (Africa/Cairo) — Meta campaign wizard READMEs added. 2026-10-01 01:49 (Africa/Cairo) — reports & charts engine added. 2026-10-01 00:55 (Africa/Cairo) — My Work added. Earlier: 2026-10-01 00:25 (Africa/Cairo) — Communication hub, sub-sidebar, module pages, AI setup, README index and change log added.

Start here. Every doc in this folder, what it covers, and its sections. Rules for agents and contributors are in
[../CLAUDE.md](../CLAUDE.md). **If a doc and the code disagree, the code wins.** When you change a feature, update its
doc in the same change.

| # | Doc | Read it when |
|---|---|---|
| 1 | [1-ARCHITECTURE.md](1-ARCHITECTURE.md) | You touch structure, shared engines, i18n, theme, routing, tenant/auth, or need the Definition of Done |
| 2 | [2-SALES.md](2-SALES.md) | You work on leads, customers, assignment, statuses, activities, deals, opportunities, proposals |
| 3 | [3-FEATURES.md](3-FEATURES.md) | You work on conversations, campaigns, outreach, social, tasks, automation, notifications, AI agent, products, settings |
| 4 | [4-CUSTOMER-SERVICE.md](4-CUSTOMER-SERVICE.md) | You work on the Customer Hub (`features/service`, `/service/*`) or the customer portal (`/portal/*`) |
| — | [customer-service/SERVICE-MASTER-SPEC.md](customer-service/SERVICE-MASTER-SPEC.md) | Backend contract and business rules for Customer Service (Arabic) |
| — | [customer-service/SERVICE-BRIEF.md](customer-service/SERVICE-BRIEF.md) | The decision brief behind the spec (Arabic) |
| — | [tasks/TASKS-TODO-SPEC.md](tasks/TASKS-TODO-SPEC.md) | Tasks and To-Do: concepts, UI, rules, frontend code and the phased backend contract (Arabic) |
| — | [deals/DEALS-WORKSPACE-SPEC.md](deals/DEALS-WORKSPACE-SPEC.md) | Deals hub and Deal Workspace: concepts, lifecycle, every page, rules, code map, API used (Postman), backend contract for the planned endpoints, backend notes (Arabic) |
| — | `Proposal Template Builder.pdf` | Reference design for the proposals builder |

## 1-ARCHITECTURE.md — Architecture & rules

- [Folder structure and ownership](1-ARCHITECTURE.md#folder-structure-and-ownership)
- [Dependency rules](1-ARCHITECTURE.md#dependency-rules)
- [Routes and navigation](1-ARCHITECTURE.md#routes-and-navigation)
- [Tenant, auth, httpClient and api_password](1-ARCHITECTURE.md#tenant-auth-httpclient-and-api_password)
- [Realtime](1-ARCHITECTURE.md#realtime) · [Notification center](1-ARCHITECTURE.md#notification-center) · [Operational alerts](1-ARCHITECTURE.md#operational-alerts)
- [i18n](1-ARCHITECTURE.md#i18n) · [RTL and LTR](1-ARCHITECTURE.md#rtl-and-ltr) · [Theme and dark mode](1-ARCHITECTURE.md#theme-and-dark-mode)
- [Conventions](1-ARCHITECTURE.md#conventions)
- [Shared engines](1-ARCHITECTURE.md#shared-engines): [DataTable](1-ARCHITECTURE.md#datatable), [Calendar](1-ARCHITECTURE.md#calendar), [Visual Flow](1-ARCHITECTURE.md#visual-flow), [Pipeline Board](1-ARCHITECTURE.md#pipeline-board), [Sidebar and navigation](1-ARCHITECTURE.md#sidebar-and-navigation), [Sub-sidebar](1-ARCHITECTURE.md#sub-sidebar), [Module pages and AI setup](1-ARCHITECTURE.md#module-pages-and-ai-setup), [Reports and charts](1-ARCHITECTURE.md#reports-and-charts), [Other shared UI](1-ARCHITECTURE.md#other-shared-ui)
- [Checks and commands](1-ARCHITECTURE.md#checks-and-commands) · [Definition of Done](1-ARCHITECTURE.md#definition-of-done)
- [Adding a new module](1-ARCHITECTURE.md#adding-a-new-module) · [Known architecture debt](1-ARCHITECTURE.md#known-architecture-debt)

## 2-SALES.md — Sales domain

- [Domain model](2-SALES.md#domain-model) · [Lead lifecycle](2-SALES.md#lead-lifecycle)
- [Statuses, tags and pipeline](2-SALES.md#statuses-tags-and-pipeline)
- [Leads page and lead assignment](2-SALES.md#leads-page-and-lead-assignment) · [Leads Center pages](2-SALES.md#leads-center-pages)
- [Customer details drawer](2-SALES.md#customer-details-drawer) · [Bulk actions](2-SALES.md#bulk-actions) · [Customer activity timeline](2-SALES.md#customer-activity-timeline)
- [Teams and users](2-SALES.md#teams-and-users) · [Activities, calls and meetings](2-SALES.md#activities-calls-and-meetings)
- [Deals](2-SALES.md#deals) (full spec: [deals/DEALS-WORKSPACE-SPEC.md](deals/DEALS-WORKSPACE-SPEC.md)) · [Opportunities](2-SALES.md#opportunities) · [Proposals](2-SALES.md#proposals)
- [Sales dashboard](2-SALES.md#sales-dashboard) · [Sales domain known issues](2-SALES.md#sales-domain-known-issues)

## 3-FEATURES.md — Features

- [My Work](3-FEATURES.md#my-work) (`/my-work`, شغلي — everything waiting for the signed-in user)
- [Communication hub](3-FEATURES.md#communication-hub) (Conversations, Calls, Meetings, Team chat — `/conversations`, `/calls`, `/meetings`, `/team-chat`)
- [Conversations](3-FEATURES.md#conversations) (WhatsApp / Messenger / Gmail) · [Internal chat](3-FEATURES.md#internal-chat)
- [Ad campaigns and Meta integrations](3-FEATURES.md#ad-campaigns-and-meta-integrations) · [Outreach campaigns](3-FEATURES.md#outreach-campaigns) · [Social media](3-FEATURES.md#social-media)
- [Tasks](3-FEATURES.md#tasks) · [Workflow engine and automation](3-FEATURES.md#workflow-engine-and-automation) · [Integrations](3-FEATURES.md#integrations)
- [Notifications](3-FEATURES.md#notifications) · [Operational alerts](3-FEATURES.md#operational-alerts) · [AI agent](3-FEATURES.md#ai-agent)
- [Products and services](3-FEATURES.md#products-and-services) · [Settings and appearance](3-FEATURES.md#settings-and-appearance)
- [Customer Hub (Customer Service)](3-FEATURES.md#customer-hub-customer-service): summary and module inventory; details are in doc 4

## 4-CUSTOMER-SERVICE.md — Customer Hub (Service Operations)

- [What it is](4-CUSTOMER-SERVICE.md#what-it-is) · [Phases](4-CUSTOMER-SERVICE.md#phases) (F0–F7, all built on mock data)
- [Where the code lives](4-CUSTOMER-SERVICE.md#where-the-code-lives) · [How data flows (mock → live)](4-CUSTOMER-SERVICE.md#how-data-flows-mock--live)
- [Capabilities and terminology](4-CUSTOMER-SERVICE.md#capabilities-and-terminology) · [i18n rules](4-CUSTOMER-SERVICE.md#i18n-rules-for-service) · [Theme and dark mode](4-CUSTOMER-SERVICE.md#theme-and-dark-mode)
- [Routes and navigation](4-CUSTOMER-SERVICE.md#routes-and-navigation) · [Integration points outside the area](4-CUSTOMER-SERVICE.md#integration-points-outside-the-area)
- [API used by the frontend](4-CUSTOMER-SERVICE.md#api-used-by-the-frontend) (the proposed backend contract)
- [Adding a sub-module](4-CUSTOMER-SERVICE.md#adding-a-sub-module) · [Per-phase checklist](4-CUSTOMER-SERVICE.md#per-phase-checklist)
- [Deferred to a later phase](4-CUSTOMER-SERVICE.md#deferred-to-a-later-phase) (field service, inventory, supplier portal)
- [Phase log](4-CUSTOMER-SERVICE.md#phase-log): what each phase added, what is mocked, what was not built or not verified

### Customer Hub READMEs (next to the code)

| Area | README |
|---|---|
| Map of all sub-modules | [features/service/README.md](../src/features/service/README.md) |
| Core, mocks, pages | [core](../src/features/service/core/README.md) · [mocks](../src/features/service/mocks/README.md) · [pages/service](../src/pages/service/README.md) |
| F1 case core | [cases](../src/features/service/cases/README.md) · [my-work](../src/features/service/my-work/README.md) · [contacts](../src/features/service/contacts/README.md) · [customer-360](../src/features/service/customer-360/README.md) |
| F2 operations | [settings](../src/features/service/settings/README.md) · [sla](../src/features/service/sla/README.md) · [replies](../src/features/service/replies/README.md) · [knowledge](../src/features/service/knowledge/README.md) · [feedback](../src/features/service/feedback/README.md) · [reports](../src/features/service/reports/README.md) · [saved-views](../src/features/service/saved-views/README.md) |
| F3 service context | [catalog](../src/features/service/catalog/README.md) · [pipelines](../src/features/service/pipelines/README.md) · [records](../src/features/service/records/README.md) · [assets](../src/features/service/assets/README.md) · [entitlements](../src/features/service/entitlements/README.md) · [contracts](../src/features/service/contracts/README.md) · [handoffs](../src/features/service/handoffs/README.md) · [setup](../src/features/service/setup/README.md) |
| F4 billing & scheduling | [billing](../src/features/service/billing/README.md) · [subscriptions](../src/features/service/subscriptions/README.md) · [scheduling](../src/features/service/scheduling/README.md) · [work-orders](../src/features/service/work-orders/README.md) · [deliveries](../src/features/service/deliveries/README.md) |
| F5 portal & growth | [portal-admin](../src/features/service/portal-admin/README.md) · [imports](../src/features/service/imports/README.md) · [follow-ups](../src/features/service/follow-ups/README.md) · [portfolios](../src/features/service/portfolios/README.md) · [api-access](../src/features/service/api-access/README.md) · portal app: [src/portal](../src/portal/README.md), [features/portal](../src/features/portal/README.md) |
| F6 knowledge & quality | [knowledge](../src/features/service/knowledge/README.md) · [quality](../src/features/service/quality/README.md) · [workflow](../src/features/service/workflow/README.md) · [incidents](../src/features/service/incidents/README.md) · [search](../src/features/service/search/README.md) · template versioning in [setup](../src/features/service/setup/README.md) |
| F7 AI | [ai](../src/features/service/ai/README.md) · [health](../src/features/service/health/README.md) |

## READMEs next to the code (outside the Customer Hub)

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — table added.

| Area | README |
|---|---|
| Shared sub-sidebar (mandatory for every internal sidebar) | [shared/components/sub-sidebar](../src/shared/components/sub-sidebar/README.md) |
| Shared reports & charts engine (every Reports page and chart; palette, rules, how to add a page) | [shared/components/reports](../src/shared/components/reports/README.md) |
| Shared module page shells (placeholder, notice, module settings page) | [shared/components/module-pages](../src/shared/components/module-pages/README.md) |
| Shared AI setup page (and the boundary with the future `features/ai`) | [shared/components/ai-setup](../src/shared/components/ai-setup/README.md) |
| Auth — login page, showcase slider, sign-in methods, proposed Google/WebAuthn/PIN contract | [features/auth](../src/features/auth/README.md) · Arabic page guide [pages/auth/README_AR.md](../src/pages/auth/README_AR.md) |
| Tasks & To-Do — taskable registry, To-Do periods and form, payload builder, To-Do panel, header panels, how to link a new entity | [features/tasks](../src/features/tasks/README.md) · To-Do route [pages/todo](../src/pages/todo/README.md) · spec [docs/tasks/TASKS-TODO-SPEC.md](tasks/TASKS-TODO-SPEC.md) |
| My Work (شغلي) — sections, rules, registry, how to add a section | [features/my-work](../src/features/my-work/README.md) · route [pages/my-work](../src/pages/my-work/README.md) |
| Meta campaign wizard (create campaign: stages, drafts, geo targeting, data sources, publish) | [features/campaigns/meta-wizard](../src/features/campaigns/meta-wizard/README.md) · full Arabic guide [pages/campaigns/pages/CampaignCreatePage/README_AR.md](../src/pages/campaigns/pages/CampaignCreatePage/README_AR.md) |
| Deals — hub, workspace per deal (pipeline, won/lost, contracts, team split, calls & meetings, tasks, calendar, reports, automation, AI, settings), live/planned API flags | [features/deals](../src/features/deals/README.md) · routes [pages/deals](../src/pages/deals/README.md) · spec [docs/deals/DEALS-WORKSPACE-SPEC.md](deals/DEALS-WORKSPACE-SPEC.md) |
| Communication hub (conversations, calls, meetings, team chat) | [features/communication](../src/features/communication/README.md) · routes [pages/communication](../src/pages/communication/README.md) |
| Settings sections registry | [pages/settings/registry](../src/pages/settings/registry/README.md) · [pages/settings/pages/communication](../src/pages/settings/pages/communication/README.md) |

## customer-service/SERVICE-MASTER-SPEC.md — backend spec (Arabic)

Parts: 1 Foundation (context, scope, principles, architecture, engineering standards) · 2 Shared platform services
(events/outbox/queue, audit, permissions, packages & feature flags, custom fields, pipeline engine, assignment,
files, numbering…) · 3 Business core · 4 Sales integration · 5 Service operations (cases, SLA, knowledge, feedback &
quality, AI §45, reports §46, setup §47…) · 6 Industry guides · 7 Data & API (§51 endpoint list) · 8 Delivery (phases
and acceptance criteria §55). The spec has its own index at the top.

## Docs change log

Newest first. Every docs change also carries a `YYYY-MM-DD HH:mm (Africa/Cairo)` timestamp next to the changed section
(rule in [1-ARCHITECTURE.md → Conventions](1-ARCHITECTURE.md#conventions)).

| When | What changed | Where |
|---|---|---|
| 2026-10-04 00:17 (Africa/Cairo) | Deal creation is a page in steps `/deals/new` (stages → first data → products → team → review; draft + resumable retry, `CreateDealDialog` removed); work template by products (one unique piece / one product in units / several products) in the won dialog, lead products, products page, overview and board; backend contract §9.10 (`unit_mode`, `available_units`, optional one-call create) | `deals/DEALS-WORKSPACE-SPEC.md` (§5, §9.10, §11–13) · 2-SALES (Deals) · READMEs `features/deals`, `pages/deals` |
| 2026-10-03 23:32 (Africa/Cairo) | Deals rebuilt: `/deals` hub with sub-sidebar (all deals, all contracts, reports, pipeline templates) and one workspace per deal `/deals/:dealId/*` (overview, pipeline as board or table with team swimlanes, contracts, team, meetings, calls, tasks & to-dos, products, reports, calendar, automation, assistant, AI setup, settings); won/lost dialogs and contracts on the backend Postman endpoints; pipeline-template create/update path fixed to `/api/tenant/pipeline-templates`; planned endpoints gated by `DEAL_API_STATUS`; tasks taskable types `deal` and `contract`; workflow module `deals`; settings section `deals.pipelines`; `--calendar-deals` token; smoke test for every deal page | new `deals/DEALS-WORKSPACE-SPEC.md` · 2-SALES (Deals, Lead lifecycle) · 1-ARCHITECTURE (Pipeline Board, Reports and charts) · 3-FEATURES (AI agent) · this index · `CLAUDE.md` · READMEs `features/deals` (new), `pages/deals` (new), `features/tasks`, `shared/components/reports`, `shared/components/sub-sidebar` |
| 2026-10-02 03:35 (Africa/Cairo) | Tasks UX pass: quick-add line on `/tasks` and in the header panel, list grouped by due date with tick-to-complete and richer rows, filters on one line, duplicated summary tiles and fake board counts removed, header Tasks panel in one column, task form reordered (kind / when / priority chips, assignee search with me by default, extras folded) | `tasks/TASKS-TODO-SPEC.md` (§3) · 3-FEATURES (Tasks) · README `features/tasks` |
| 2026-10-02 03:25 (Africa/Cairo) | Fix: To-Dos/tasks from the API did not show — `due_date` comes as an ISO date cast and was joined with `due_time` into an invalid date; now date part only, `00:00:00` = no time, assignees read from `assignments[]` (tasks + My Work); undated To-Dos get a "No date" group | `tasks/TASKS-TODO-SPEC.md` (§4) · READMEs `features/tasks`, `features/my-work` |
| 2026-10-02 03:00 (Africa/Cairo) | To-Do separated from Tasks: new page `/todo` (Workspace → My to-do list), header To-Do button + side panel, short To-Do form (title + when; priority/notes; customer + reminder under more options), task drawer edits To-Dos with it; `/tasks`, header Tasks panel and My Work "My tasks due" exclude To-Dos; My Work gets a separate To-Do section; `/tasks?smart=todo` redirects; tasks page header no longer squeezes its title | `tasks/TASKS-TODO-SPEC.md` (§1, §3, §8) · 3-FEATURES (Tasks, My Work) · 1-ARCHITECTURE (Sidebar and navigation) · this index · `CLAUDE.md` · READMEs `features/tasks`, `features/my-work`, new `pages/todo` |
| 2026-10-02 02:40 (Africa/Cairo) | Tasks F2: customer drawer Tasks tab replaced by `EntityTasksPanel` (quick actions task / call / meeting, tick to complete, drawer in place; old mini tab and `customers.tasksTab.*` strings removed); follow-up task button in the conversation header; Leads Center search picker for the linked record; `/tasks` Linked-to filter; link chip opens the record; personal To-Dos no longer leak into a customer's Tasks tab | `tasks/TASKS-TODO-SPEC.md` (§3, §5, §8, §9) · 3-FEATURES (Tasks, Conversations) · 2-SALES (Customer details drawer, known issues) · this index · README `features/tasks` |
| 2026-10-02 01:35 (Africa/Cairo) | Tasks & To-Do F1: To-Do = task `type: todo` with a day/week/month period (saved as due by the period's last day + optional `period_type`/`period_date`); "My to-do list" panel in `/tasks?smart=todo` and My Work; taskable registry (`lead`/`customer` aliases → backend model names, no more default Lead with empty id); shared `buildTaskPayload`; date-only tasks due at end of day; new spec with the phased backend contract | new `tasks/TASKS-TODO-SPEC.md` · 3-FEATURES (Tasks, My Work) · this index · `CLAUDE.md` · READMEs `features/tasks` (new), `features/my-work` |
| 2026-10-02 00:55 (Africa/Cairo) | Leads Center i18n pass: fixed `customers.drawer` / `customers.followUp` / `customers.statusChange` being nested under `customers.table` (raw keys showed in the drawer, follow-up and status-reason dialogs); moved every hardcoded string in `pages/customers` (table, hovers, products dialog, activity timeline, bulk actions, drawer + tabs + quick actions, lead details page, status board, customization, sales teams, placeholders) and `features/customers` to `locales/*/customers.js`; activity timeline dates follow the UI language | 2-SALES (Leads Center pages, Customer details drawer) |
| 2026-10-01 23:55 (Africa/Cairo) | Login page: hero replaced by an auto-playing showcase slider of the system's areas (customers, teams and routing, calls and meetings, conversations, campaigns, automation and reports); background motion stronger and follows the active slide; split desktop layout; Arabic page guide | this index · READMEs `features/auth`, `pages/auth/README_AR.md` |
| 2026-10-01 23:30 (Africa/Cairo) | Login page redesigned (animated brand background, tenant chip, language/theme toggles); clear sign-in errors (no more "wrong password" for server/network failures, no session modal on a wrong password); return to the requested page after sign-in; shared `BrandLogo`; Google / Face ID / fingerprint + PIN UI ready behind `VITE_AUTH_METHODS` with a proposed backend contract | 1-ARCHITECTURE (Tenant, auth, httpClient) · this index · README `features/auth` |
| 2026-10-01 02:35 (Africa/Cairo) | Meta campaign wizard rebuilt in `features/campaigns/meta-wizard` (multi-draft side panel, guided stages with live validation, Meta-style location targeting, full objective/destination matrix, Ads stage ready for the create-ad API with demo data, CRM lead routing, resumable publish); `campaignWizard` locale module; old `campaigns.create.*` keys removed | 3-FEATURES (Ad campaigns and Meta integrations) · this index · READMEs `features/campaigns/meta-wizard`, `pages/campaigns/pages/CampaignCreatePage/README_AR.md` |
| 2026-10-01 01:49 (Africa/Cairo) | Shared reports & charts engine (`shared/components/reports`, 8 validated chart tokens, `/playground/reports`); Reports pages for Leads Center, Calls, Meetings, Conversations, Team chat, Products; rule 12 in `CLAUDE.md` | 1-ARCHITECTURE (Reports and charts, Definition of Done) · 2-SALES (Leads Center pages) · 3-FEATURES (Communication hub, Products) · `CLAUDE.md` · READMEs `shared/components/reports`, `features/communication` |
| 2026-10-01 01:20 (Africa/Cairo) | `/leads` page removed (redirect); assignment rules → `/LeadsCenter/assignments`; Leads Center sub-sidebar reorganized (activities moved up, status board / proposal builder / sales teams out, Automation + AI setup in the footer); Sales teams in the main sidebar; calendar-first Leads Center activities on the shared calendar; `WorkflowModuleWorkspace` | 2-SALES (Leads page and lead assignment, Leads Center pages) · 1-ARCHITECTURE (Sidebar and navigation) · 3-FEATURES (Workflow engine) · `CLAUDE.md` |
| 2026-10-01 00:55 (Africa/Cairo) | My Work page (`/my-work`) with section registry; public exports for tasks, calendar, analytics and conversation unread counts; Customer Hub "My Work" nav label renamed to "Service work" | 1-ARCHITECTURE (Sidebar and navigation) · 3-FEATURES (My Work) · 4-CUSTOMER-SERVICE (Routes and navigation) · this index · `CLAUDE.md` · READMEs `features/my-work`, `pages/my-work` |
| 2026-10-01 00:25 (Africa/Cairo) | Communication hub (new main-sidebar section; `/calls`, `/meetings` added; conversations and team chat moved there; Activities item removed from Sales); shared sub-sidebar rule and migration of every internal sidebar; shared module pages and AI setup; settings sections registry; README-per-new-folder rule | 1-ARCHITECTURE (Sidebar and navigation, Sub-sidebar, Module pages and AI setup, Calendar, Definition of Done, Adding a new module, Known debt) · 2-SALES (Leads Center pages, Activities) · 3-FEATURES (Communication hub, Conversations, Internal chat, AI agent, Settings) · this index · `CLAUDE.md` · new READMEs listed above |
