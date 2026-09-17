# ICAN CRM Sidebar Architecture

Last updated: 2026-09-17

## Purpose

This is the permanent developer reference for how navigation works in ICAN CRM: how the sidebar is built, why it is organized the way it is, and — most importantly — the exact steps a developer must follow before adding anything new to it. Read this before adding a route to the sidebar, before creating a new business module, and before touching `Sidebar.jsx` or `Header.jsx`.

## Navigation Philosophy

```text
Sidebar
=
Where do I want to work?

Page Navigation (tabs/toolbars inside a page)
=
What part of this area do I want?

Filters / Views
=
What data do I want to see?

Drawer / Detail Page
=
What specific record am I working on?

Actions
=
What do I want to do with it?
```

The CRM will eventually contain 100+ screens. That does not mean the sidebar should contain 100 links. The sidebar's job is to expose **business modules and primary destinations only** — everything else (filters, views, record details, actions) belongs inside a page.

## Current Information Architecture

```text
Dashboard                                            (no section label)

SALES
  Leads            -> /leads
  Customers        -> /LeadsCenter
  Activities       -> /activities
  Proposals        -> /LeadsCenter/proposals

GROWTH
  Campaigns          -> /campaigns
  Opportunity Center -> /opportunities

WORKSPACE
  Conversations      -> /conversations
  Tasks              -> /tasks
  Team Chat          -> /team-chat
  Products & Services -> /products

ADMINISTRATION
  Teams      -> /teams
  Users      -> /users
  Templates  -> /templates
  Settings   -> /settings
```

Every item above points to a route that already exists and works today. Nothing in this list is a placeholder.

## Navigation Hierarchy

```text
PRODUCT
    ↓
BUSINESS MODULE        (Sales, Growth, Workspace, Administration, ...)
    ↓
PRIMARY DESTINATION    (Leads, Customers, Opportunity Center, ...)
    ↓
PAGE
    ↓
TABS / FILTERS / VIEWS (inside the page — e.g. Settings' own internal tabs)
    ↓
ENTITY DETAILS / DRAWERS
```

## Sidebar vs Page Navigation

The sidebar should stay in the 3–7 items-per-section range. When a page needs more granularity than that, it gets its own internal navigation instead of more sidebar entries:

- **Settings** (`/settings`) has its own internal sidebar (`pages/settings/layout/SettingsSidebar.jsx`) for Definitions / Users / Integrations — see `pages/settings/SETTINGS_SECTION_IMPLEMENTATION_AR.md`.
- **Customers** (`/LeadsCenter`) has its own internal sidebar (`pages/customers/layout/CustomersSidebar.jsx`) for New / Follow-up / Inactive / Segments / Assignments / Duplicates / Customization / Import-Export / Trash / Status Board — most of these are intentionally **not** duplicated at the top level; only Customers itself, plus the two genuinely cross-cutting destinations (Activities, Proposals), were promoted to the global Sales section.
- **Products** (`/products`) similarly has its own internal sidebar for Categories / Services / Service Categories.

This is the established pattern in this codebase already (predates this refactor) — the global sidebar refactor follows the same principle one level up.

## Core vs Business Modules

- **Core**: available to every tenant regardless of package — Dashboard, and (today) everything, since no tenant-module system exists yet on the backend.
- **Business Module**: a section that could theoretically be sold/enabled independently — `sales`, `growth`, and later `customer_service`. See `module` on `NavigationSection`/`NavigationItem` in `navigation.config.js`.

## Current Modules

| Module id | Section | Status |
|---|---|---|
| `sales` | Sales | Implemented |
| `growth` | Growth | Implemented (partial — see Future) |
| — | Workspace | Implemented (no `module` id — cross-cutting, always available) |
| — | Administration | Implemented (no `module` id — cross-cutting, always available) |

## Future Modules

| Module id | Section | Status |
|---|---|---|
| `customer_service` | Customer Service (Service Inbox, Tickets, Cases, SLA, Knowledge Base) | **Planned.** No routes exist. Do not add a section until real pages ship. |
| `insights` | Insights (Reports, Analytics) | **Planned.** No routes exist. |
| `automation` | Automation (Workflows, Rules, Triggers, Logs) | **Planned.** May become its own top-level module once workflows exist — see `navigation.config.js`'s `module` field, which already supports this without a Sidebar rewrite. |
| — | Opportunities (qualified pipeline entity, inside Sales) | **Planned.** Distinct from the existing Opportunity Center — see "Opportunity Center vs Opportunities" below. |

## Navigation Configuration Schema

Single source of truth: `src/app/navigation/navigation.config.js`.

```js
/**
 * @typedef {Object} NavigationItem
 * @property {string} id
 * @property {string} labelKey        // i18next key, e.g. 'nav.leads'
 * @property {React.ComponentType} icon
 * @property {string} path            // must be an existing route
 * @property {boolean} [end]          // exact-match only (like NavLink's `end`)
 * @property {string[]} [activePatterns] // see "Active Route Resolution"
 * @property {string} [module]        // tenant module gate
 * @property {string} [permission]    // permission gate
 * @property {string} [featureFlag]   // reserved, not wired to anything yet
 * @property {{type:'count', source:string}} [badge] // reserved schema, not implemented
 *
 * @typedef {Object} NavigationSection
 * @property {string} id
 * @property {'section'} type
 * @property {string} labelKey
 * @property {boolean} [hideLabel]    // used by the single-item Overview section
 * @property {string} [module]
 * @property {NavigationItem[]} items
 */
```

## Navigation Rendering Pipeline

```text
navigationConfig
        ↓
getVisibleNavigation()          — module filter -> permission filter -> feature-flag filter -> drop empty sections
        ↓
resolveActiveNavigation()       — pick the single best-matching item/section for the current pathname
        ↓
useNavigation()                 — the hook both Sidebar and Header call
        ↓
Sidebar renders sections/items  — Header reads { activeItem } for the page title/icon
```

All of this logic lives in `src/app/navigation/`:

- `navigation.config.js` — the data (sections + items).
- `navigation.utils.js` — pure functions: pattern matching, active resolution, module/permission/flag filtering, empty-section removal. No React, no i18n, no store access — fully unit-testable in isolation.
- `useNavigation.js` — the one hook that wires `navigation.config` + `navigation.utils` + `useAuthStore` + `useLocation` together and returns `{ sections, activeItem, activeSectionId }`.

`Sidebar.jsx` and `Header.jsx` both call `useNavigation()`. Neither owns navigation data, and Header no longer imports anything from Sidebar.

## Module Visibility

`isModuleEnabled(moduleId, enabledModules)` in `navigation.utils.js`:

- `moduleId` undefined → always visible (core).
- `enabledModules` is not an array (i.e. the backend hasn't started returning `user.modules` yet) → always visible. **The frontend never fabricates a restriction the backend doesn't send.**
- Otherwise → visible only if `enabledModules.includes(moduleId)`.

Today `useAuthStore`'s `user` object has no `modules` field, so every module-gated section renders for everyone — exactly as it should until tenant packages are a real backend concept.

## Permission Visibility

`hasNavigationPermission(permissionKey, userPermissions)` in `navigation.utils.js` follows the identical "undefined = don't hide" rule. **Sidebar visibility is UX only.** It is not, and must never be treated as, the actual security boundary — that is always the backend/route layer (`PrivateRoute` today handles authentication; per-route authorization is a backend concern). No permission system exists in this codebase yet (confirmed by inspection — `useChatPermissions` and `agentPermissions.js` are narrow, feature-local role checks, not a global RBAC system), so this is an architecture-ready interface, not a pretense of security that doesn't exist.

## Active Route Resolution

`resolveActiveNavigation(sections, pathname)` in `navigation.utils.js` scores every item's `activePatterns` against the current pathname and returns the single best match (exact matches always beat prefix matches; among prefix matches, the longer/more specific one wins). This replaces the old `location.pathname.startsWith(item.to)` heuristic in the previous flat `Sidebar.jsx`, which could not distinguish a parent route from a similarly-prefixed sibling.

Pattern syntax:

- `'/settings'` — exact match only.
- `'/settings/*'` — matches `/settings` itself and anything nested under it (`/settings/integrations`, etc.).
- Omit `activePatterns` entirely and the resolver defaults to `[path]` when `end: true`, or `[path, `${path}/*`]` otherwise.

Example already in `navigation.config.js`:

```js
{
  id: 'customers',
  path: '/LeadsCenter',
  activePatterns: ['/LeadsCenter', '/LeadsCenter/*', '/lead/*', '/leads/*'],
}
```

This correctly keeps **Customers** highlighted on `/LeadsCenter/proposals/123/builder`, and also on the standalone customer-detail routes `/lead/:id` and `/leads/:id` — a small, deliberate improvement over the previous behavior (visiting `/leads/123` used to highlight the unrelated **Leads** item purely because the string `/leads/123` happened to start with `/leads`). No URLs changed; only which sidebar item lights up.

## Header Integration

`Header.jsx` calls `useNavigation()` and reads `activeItem` for the page title/icon fallback:

```js
const { activeItem } = useNavigation()
const title = customTitle || (activeItem ? t(activeItem.labelKey) : '')
const Icon = customIcon || activeItem?.icon
```

`usePageHeaderStore()` (existing, unchanged) still takes priority — any page can call `usePageHeader()` to override the title/icon/actions exactly as before. Header no longer imports `NAV_ITEMS` from `Sidebar.jsx`; both components depend on `src/app/navigation/` instead:

```text
                 navigation.config
                  /             \
                 /               \
            Sidebar             Header
```

## RTL / LTR Rules

- All spacing/positioning in `Sidebar.jsx` uses logical properties already present in the codebase (`start-0`, `ps-*`, `ms-*`, etc.) — unchanged from before this refactor.
- The section-collapse chevron rotates via a CSS transform (`rotate-0` / `-rotate-90`), which is direction-agnostic (no left/right assumptions).
- Verified manually in a running browser: Arabic (RTL) and English (LTR), including collapsed-sidebar tooltips, section chevrons, and the active-item indicator.

## Responsive Behavior

The primary `Sidebar` (this file) has **no separate mobile drawer today** — it renders as a fixed collapsible column (`w-16` / `w-60`) at all breakpoints, exactly as before this refactor. This was true before this task and is preserved as-is; redesigning it into a mobile drawer was out of scope ("do not redesign the entire mobile application unless required"). Sub-section sidebars (`CustomersSidebar`, `SettingsSidebar`, `ProductsSidebar`) already have their own mobile drawer pattern (`*MobileSidebar.jsx` + backdrop), which is unaffected by this refactor and remains the reference pattern if/when the primary Sidebar gets a mobile drawer.

## Collapsed Sidebar Behavior

- Collapsed mode renders icons only, centered, with `title` attributes for native tooltips — the same convention already used by `CustomersSidebar`/`SettingsSidebar`/`ProductsSidebar`.
- Section headers and chevrons are hidden when collapsed (no unreadable nested labels); every item from every section still renders as a flat icon list.
- The active item's background highlight remains visible in collapsed mode.

## UX Rules

1. **Progressive disclosure** — sections expand/collapse; only the active section is forced open.
2. **Maximum depth** — `Section -> Destination`, nothing deeper. Anything needing more depth gets its own in-page navigation (tabs, sub-sidebar).
3. **User mental model** — organized by what a salesperson/admin is trying to do, not by folder structure.
4. **Operational items first** — Sales/Growth/Workspace render above Administration.
5. **Stable positions** — new destinations are inserted according to which section owns them, never appended arbitrarily to the bottom.
6. **Avoid overload** — a filter/view (e.g. "My Leads", "Overdue Leads") is never a sidebar item; it belongs inside the destination page.

## When to Add a Sidebar Item

Ask, in order:

1. Is this a primary, recurring destination a user returns to daily/weekly? → maybe.
2. Does a route already exist for it (or will one exist in this same change)? → required, never link to a non-existent page.
3. Which section owns it conceptually (Sales / Growth / Workspace / Administration / future Customer Service or Insights)?
4. Would this section exceed ~7–9 items with it added? If so, reconsider — does it belong in that module's own internal sub-navigation instead (see "Sidebar vs Page Navigation")?

If all of the above check out, add one entry to `navigationConfig` in `navigation.config.js`. **You should never need to edit `Sidebar.jsx` or `Header.jsx` JSX to add a normal destination.**

## When NOT to Add a Sidebar Item

- It's a filter/status/view of an existing entity ("My Tasks", "Overdue Leads", "Completed Campaigns") → put it inside the destination page instead.
- It's a record detail or a workflow step ("Proposal Builder", "Lead Detail") → drawer, dedicated sub-page, or dialog, not a new sidebar entry.
- The page doesn't exist yet ("Tickets", "Reports") → document it as Future in this file; do not add a fake link.
- It's a one-off admin screen naturally reached from Settings → put it inside Settings' own internal tabs (see "Settings Strategy").

## New Feature Decision Tree

```text
New Feature
     ↓
Is it a new business domain?
     │
     ├── YES → Consider a new Module/Section (add module id in navigation.config.js)
     │
     └── NO
           ↓
Is it a primary recurring user destination?
           │
           ├── YES → Sidebar Item (one entry in navigationConfig)
           │
           └── NO
                  ↓
Does it belong to an existing entity/workflow?
                  │
                  ├── YES → Page Tab / View / Action (inside the existing page)
                  │
                  └── NO → Drawer / Dialog / Contextual Action
```

## How to Add a New Page

Worked example — imagine a future **Sales Forecast** page at `/sales/forecast`:

1. Is Forecast a primary destination? Yes, assume so for this example.
2. Which module owns it? `sales`.
3. Does it need a sidebar entry? Yes.
4. Does it already belong inside Reports/Analytics instead? Check first — if Insights already covers this, don't duplicate it here.
5. What permission controls it? `forecast.view` (reserved key; not enforced anywhere yet since no permission backend exists).
6. What tenant module controls it? `sales`.
7. What translation keys are needed? `nav.salesForecast` in both `src/locales/ar/common.json` and `src/locales/en/common.json`.
8. What active routes belong to it? `/sales/forecast` and anything nested under it.

Resulting config change (the **only** code change needed — no Sidebar/Header JSX edits):

```js
{
  id: 'sales-forecast',
  labelKey: 'nav.salesForecast',
  icon: ChartIcon,
  path: '/sales/forecast',
  module: 'sales',
  permission: 'forecast.view',
  activePatterns: ['/sales/forecast', '/sales/forecast/*'],
}
```

Plus: register the actual route in `src/app/router/index.jsx`, build the page, add the two translation keys.

## How to Add a New Module

Worked example — **Customer Service**:

1. Register the module id: `customer_service`.
2. Create its section in `navigation.config.js`:
   ```js
   {
     id: 'customer-service',
     type: 'section',
     labelKey: 'nav.sections.customerService',
     module: 'customer_service',
     items: [ /* Service Inbox, Tickets, Cases, SLA, Knowledge Base */ ],
   }
   ```
3. Register the actual routes in `src/app/router/index.jsx` as they're built (do this incrementally — don't add a nav item before its route exists).
4. Define permissions per item as needed (`ticket.view`, etc. — reserved keys, same "don't fabricate enforcement" rule as above).
5. Add translations: `nav.sections.customerService` (already reserved in both locale files) plus each item's key.
6. Enable tenant entitlement by returning `'customer_service'` inside `user.modules` from the backend once that concept exists — no frontend change needed beyond that.
7. Sidebar renders it automatically — `getVisibleNavigation()` picks up the new section the moment its items pass the module/permission filters. No Sidebar.jsx edit required.

## How to Add Permissions

Add a `permission: 'some.key'` to the relevant `NavigationItem`. Nothing else changes today (since `hasNavigationPermission` always returns `true` while `user.permissions` is undefined) — the key becomes live the moment the backend starts returning a `permissions` array on the authenticated user, with zero navigation-layer code changes.

## How to Add Tenant Package Restrictions

Add a `module: 'some_module'` to a `NavigationSection` (gates the whole section) or an individual `NavigationItem` (gates just that item). Same "dormant until real data exists" behavior as permissions — see `isModuleEnabled`.

## Translation Requirements

Section labels live under `nav.sections.*`; item labels live under `nav.*`, matching the existing flat convention already used for `nav.dashboard`, `nav.leads`, etc. Every `labelKey` in `navigation.config.js` must exist in **both** `src/locales/ar/common.json` and `src/locales/en/common.json`. Reserved-but-unused keys are fine (e.g. `nav.opportunities`, `nav.leadGeneration` are already reserved for the "Future" items documented above) — never delete a reserved key just because it isn't wired into a nav item yet.

## Icon Guidelines

- One `lucide-react` icon per primary destination, consistent `size={16}` in the sidebar.
- Reused an existing icon (`CalendarClock`, `FileSignature`) for Activities/Proposals to match the icon already used for the same concepts inside `pages/customers/constants/customerNavigation.js` — don't introduce a second icon for a concept that already has one elsewhere in the app.
- Avoid reusing the same icon for unrelated destinations.

## Badge Guidelines

The schema (`NavigationItem.badge = { type: 'count', source: string }`) is documented in the JSDoc typedef in `navigation.config.js` but **not implemented** — no item currently sets it, and no rendering code reads it. Do not add fake counts. When a real workspace-summary endpoint exists (e.g. open ticket count), wire it through a dedicated hook that resolves `source` → number, not by coupling `Sidebar.jsx` directly to individual feature APIs.

## Naming Conventions

- Entity names (data): **Customers, Leads, Opportunities, Tickets** (future).
- Workflow/workspace names (process): **Opportunity Center, Outreach Campaigns**, **Service Inbox** (future).
- Keep sidebar labels short and scannable — "Leads" not "Lead Management System". Arabic labels follow the same rule (already true of every existing label in this codebase).

## Opportunity Center vs Opportunities (do not merge)

This distinction is important enough to call out on its own:

- **Opportunity Center** (`/opportunities`, under **Growth**) is what's implemented today: AI/system-rule/segment/campaign/manual-detected sales signals, reviewed and acted on via Dismiss / Watch / Qualify / Activate. See `src/features/opportunities/OPPORTUNITY_CENTER.md` for the full domain model. This is workflow/discovery terminology — it belongs in Growth, not Sales.
- **Opportunities** (a plain qualified-pipeline entity, would live under **Sales**) is **not implemented**. There is no `/opportunities`-adjacent "regular pipeline" page today; "Qualify"/"Activate" inside Opportunity Center change an opportunity's *status* in place rather than moving it into a separate pipeline entity/page. If a dedicated qualified-pipeline page is ever built, give it its own route and its own Sales sidebar item — never repoint the existing Opportunity Center item to it, and never rename Opportunity Center to plain "Opportunities".

## Outreach Campaigns vs Campaigns (do not merge)

Another same-word collision, introduced when Outreach Campaigns shipped:

- **Campaigns** (`/campaigns`, under **Growth**) is the pre-existing Meta/Facebook **Ads** campaigns feature (`src/features/campaigns/`, `src/pages/campaigns/CampaignsPage.jsx`) — creating/managing ad campaigns, ad sets, ads, and lead forms against Meta's ad platform. Nothing to do with messaging your own CRM contacts.
- **Outreach Campaigns** (`/outreach-campaigns`, under **Growth**) is the messaging feature this section documents: sending WhatsApp/Gmail/Messenger campaigns to existing leads/customers. Backed by `src/features/MessegeCampaign/` (kept as-is; note the folder name is a pre-existing typo, not a mistake to silently rename) via the `src/features/outreach-campaigns/` domain layer. See `src/features/outreach-campaigns/docs/OUTREACH_CAMPAIGNS_ARCHITECTURE_AR.md` for the full domain model.

Never repoint one route/nav item to the other's page, and never collapse them into a single "Campaigns" concept — they have different backends, different data models, and different audiences (ad platform vs. CRM contacts).

## Settings Strategy

`Settings` stays a single sidebar entry. Internal navigation (Definitions, Users, Integrations today; General/CRM/Notifications/Security etc. later) lives inside `pages/settings/layout/SettingsSidebar.jsx`, exactly as already built. **Integrations is deliberately not a top-level sidebar item** — it's one of Settings' internal tabs. Do not promote it to the global sidebar; that would violate this same rule the moment any other settings sub-page also wanted to "graduate".

## Templates Strategy

`Templates` (`/templates`) is kept as its own Administration destination for now, unchanged, per the explicit "do not arbitrarily move it" instruction for this refactor. It currently only covers WhatsApp Templates. **Recommendation for a future pass** (not applied here): once Templates also covers Proposal/Email/Automation templates, revisit whether it should remain a global destination or move under Settings/Administration's internal navigation — the same way Integrations already did.

## Products & Services, Tasks, Team Chat — shared/cross-module

Per the architecture rules given for this refactor:

- **Products & Services** (`/products`) is shared data used by Sales, Proposals, Campaigns, and (later) Customer Service — kept under **Workspace**, not Sales.
- **Tasks** (`/tasks`) can originate from a Lead, Customer, Opportunity, Meeting, or Campaign — kept under **Workspace**, not Sales.
- **Team Chat** (`/team-chat`) is internal collaboration, not sales work — kept under **Workspace**.

## Conversations Migration Strategy

`Conversations` (`/conversations`) is kept under **Workspace** for now (the "short-term" option from the original brief), unchanged from before this refactor. When a real Customer Service module is built, re-evaluate whether Conversations becomes **Customer Service > Service Inbox** or remains a shared cross-module communications workspace (it already serves Messenger/Gmail/WhatsApp for both sales and support-flavored conversations) — decide based on the actual channels/backing code at that time, not on this document alone.

## Customer as a Shared Core Entity

There is exactly one `Customers` destination (`/LeadsCenter`) in the sidebar. Sales, and later Customer Service, both operate on the same customer record — this codebase already does this correctly (e.g. `CustomerDetailsDrawer` is shared infrastructure). Do not create `Sales Customers` / `Service Customers` style duplicate destinations when Customer Service is eventually built; instead extend the shared customer detail view with Service-specific tabs (Tickets, Cases, Service History), the same way it already has Sales-flavored tabs today.

## Development Methodology (every future feature)

```text
STEP 1   Define the business capability.
STEP 2   Determine owning module.
STEP 3   Determine whether it is: primary destination / subpage / tab / view / drawer / dialog / action.
STEP 4   Determine tenant entitlement (module id, even if not enforced yet).
STEP 5   Determine user permission (permission key, even if not enforced yet).
STEP 6   Define the route in src/app/router/index.jsx.
STEP 7   Add translation keys (ar + en).
STEP 8   Register navigation ONLY if it is a primary destination (STEP 3 said so).
STEP 9   Verify active-route behavior (does the right item light up on nested paths?).
STEP 10  Test expanded/collapsed sidebar.
STEP 11  Test Arabic RTL.
STEP 12  Test English LTR.
STEP 13  Test desktop/mobile.
STEP 14  Update this file if the architecture itself changed (new section, new schema field, new rule).
```

## Navigation Roadmap

**Phase 1 — This refactor (done):** flat `NAV_ITEMS` array → sectioned config-driven navigation (`src/app/navigation/`), reusable active-route resolution, Header decoupled from Sidebar.

**Phase 2 — Module/permission wiring (future):** once the backend exposes `user.modules` / `user.permissions`, `isModuleEnabled`/`hasNavigationPermission` start actually filtering — no navigation-layer code changes needed, only backend + auth response shape.

**Phase 3 — CRM expansion (future):** add `Customer Service` and `Insights` sections as their pages ship; consider promoting `Automation` to a top-level module.

**Phase 4 — Advanced workspace (future, not started):** global search / command palette (`Cmd+K`) for long-tail destinations and actions, so the sidebar can stay small even as the number of screens grows into the hundreds. Sidebar = frequent destinations; command palette = everything else. Also: favorites, recent pages, real badge counts via a dedicated workspace-summary hook, module landing pages for large modules (e.g. a Customer Service overview page with Queues/SLA Alerts/Agent Workload, exposing only a handful of items in the sidebar itself).

## Developer Checklist

Before merging any change that touches navigation:

- [ ] Route already exists (or is added in the same change) for any new sidebar item.
- [ ] Translation keys added to **both** `ar/common.json` and `en/common.json`.
- [ ] Section chosen matches this document's IA, not an arbitrary spot.
- [ ] Section stays within ~7–9 items; otherwise reconsider (module landing page / in-page navigation).
- [ ] No `Sidebar.jsx`/`Header.jsx` JSX edits were needed for a normal destination.
- [ ] Active-route highlighting verified on nested paths, not just the exact path.
- [ ] Collapsed sidebar still shows a sensible icon + tooltip.
- [ ] RTL and LTR both checked.
- [ ] This file updated if the architecture (not just the data) changed.
