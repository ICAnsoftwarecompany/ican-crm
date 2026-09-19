# Translation Migration Report

Status: PARTIAL, updated 2026-09-19 (modular locale architecture + Wave 3 Leads + Wave 4 Calls/Meetings/Activities + Wave 6 Tasks + Wave 7 Products/Services + Wave 10 Opportunities/Campaigns complete). The requested full bilingual completion gate is **not met**. See [TRANSLATION_MIGRATION_AUDIT.md](TRANSLATION_MIGRATION_AUDIT.md) for route inventory, the Wave 10 update, and sampled classification, and [LOCALES_ARCHITECTURE.md](LOCALES_ARCHITECTURE.md) for the modular locale developer guide.

## Modular locale architecture

`src/locales/{ar,en}/common.json` (1,564 lines each) has been replaced by 20 symmetrical per-domain module files, assembled by `index.js` aggregators into the same single `common` i18next namespace the app already used — no `t()` call site anywhere in the app needed to change.

```text
src/locales/
├── index.js                # resources registry consumed by src/i18n.js
├── en/ (and ar/, identical module set)
│   ├── index.js
│   ├── app.js  nav.js  actions.js  auth.js  status.js  common.js
│   ├── dataTable.js
│   ├── leads.js  customers.js  proposals.js
│   ├── activities.js  callMeetings.js
│   ├── conversations.js  dashboard.js  opportunities.js  outreachCampaigns.js  campaigns.js
│   ├── tasks.js  products.js
│   ├── workflow.js  visualFlow.js  visualFlowDemo.js  calendar.js
```

`scripts/check-translations.mjs` was rewritten to dynamically import each language's `index.js`, flatten every leaf key, and additionally fail if a module file on disk isn't registered in `index.js` (or vice versa) — protecting against a domain module being created but never imported. `src/locales/locales.test.js` adds 6 regression tests (both languages assemble, module lists match, nested keys survive composition, leaf-key sets match, no empty/non-string leaves).

A real cross-platform bug was found and fixed during this work: `scripts/check-hardcoded-text.mjs`'s `/locales/` exclusion compared against `path.join()` output, which uses backslashes on Windows, so the exclusion silently never matched there. Converting locale files from `.json` (invisible to the scanner's file-extension filter) to `.js` (now visible) would have produced ~4,000 false-positive "hardcoded UI" hits — the translation *values* themselves. Fixed by normalizing path separators before the substring check; the advisory count returned to exactly the pre-modularization baseline, confirming the module split changed zero actual translation content.

## Before and current counts

| Measure | Original baseline | Previous session end | Current |
| --- | ---: | ---: | ---: |
| Arabic locale leaf keys | 693 | 1,320 | 2,394 |
| English locale leaf keys | 693 | 1,320 | 2,394 |
| Locale module files (per language) | 1 (monolithic) | 1 | 23 |
| Arabic-script candidate lines | 3,440 in 349 files | 2,674 in 317 files | 1,455 in 219 files |
| Conservative English UI candidate lines | 337 in 80 files | 276 in 76 files | 221 in 58 files |

Candidate counts are heuristic line counts, may overlap across languages, and include intentional, technical and dead-code strings. Every reduction this session reflects a reachable-UI fix in a specific file, verified against the scanner file-by-file (not assumed from the aggregate delta).

## Work completed

**Wave 1 (prior session, retained):** Canonical shared DataTable and nearby shared overlay/form/pagination components.

**Wave 2 (prior session, retained):** Full Customers/Leads Center area — table/hover-card layer, `CustomerDetailsDrawer.jsx`, follow-up-note dialogs, status-change dialogs, the entire proposals sub-feature (15 files), Leads Center sidebar navigation.

**Part I — Modular locale architecture (this session):** See above. Inventoried the pre-modularization namespace tree (19 top-level keys), documented ownership per domain in the audit's "Locale Modularization Plan," executed the split, wired `src/i18n.js` to the new registry, updated `check:i18n`, added the regression test, fixed the scanner path bug, wrote `docs/LOCALES_ARCHITECTURE.md`, and updated `docs/ARCHITECTURE.md`/`docs/FEATURE_DEVELOPMENT_CHECKLIST.md` to stop pointing at the retired `common.json` paths.

**Wave 3 — Leads (this session, complete):** `features/leads` has no UI of its own (API/hooks/workflow-definition only). `pages/leads/LeadsPage.jsx` — a lead-log/assignment-rule admin page, previously fully hardcoded Arabic — fully migrated under new `leads.page.*` keys.

**Wave 4 — Calls/Meetings/Activities (this session, complete for reachable UI):** Every file in `features/activities` and `features/call-meetings` migrated — roughly 60 files. Notable patterns:

- Data-driven "template library" files (`PreMeetingReportDrawer.jsx`'s 5 report templates, `afterMeetingTemplates.js`'s 5 result templates) converted from module-level literal arrays to `get*Templates(t)` factory functions, with a shared `activities.preMeetingReport.options.*` catalog reused across both files and across templates wherever the underlying Arabic text was byte-identical (property types, payment methods, interest levels).
- The shared activity vocabulary (`ACTIVITY_TYPES`/`ACTIVITY_STATUSES`/`ACTIVITY_DERIVED_STATES`/`ACTIVITY_PRIORITIES` in `activityConstants.js`) converted from plain lookup objects to `get*(t)` factories — one change that fixed 8 downstream badge/tab/filter/form consumers, reusing the existing `activities.status/priority/type.*` namespace built in the prior session's Wave 2 (kept a separate `activities.scheduleDialog.priorityOptions.*` / `callMeetings.callStatus.*` set where the source Arabic used a different grammatical gender or form than the shared vocabulary, e.g. "عالية" vs "مرتفعة" for "high").
- Zod validation schemas (`activitySchema.js`, `activityReportSchema.js`) converted to `get*Schema(t)` factories so validation error messages localize instead of always showing Arabic regardless of app language.
- New `src/locales/{ar,en}/callMeetings.js` locale module created for call-meetings-feature-owned UI chrome that isn't part of the shared activities-report vocabulary (live-meeting indicator, meeting/call filters, action-tab labels, reminder banners, quick-action menus).
- `MeetingFilters.jsx`/`CallFilters.jsx` kept two separate status-label sets (`activities.status.*` for meetings, new `callMeetings.callStatus.*` for calls) because Arabic status words agree grammatically with the noun's gender (مجدول vs مجدولة) — reusing one set for both would have produced grammatically incorrect Arabic.

Classified and deliberately left unchanged: two Arabic default-title strings in `activityHelpers.js#normalizeActivity` and the duration formatters in `activityDateHelpers.js`/`scheduleUiUtils.js`, all of which run at the data-normalization layer outside React/i18n context — each was given a `t`-optional signature (fully localized when called from a component, which is every real call site; the literal-Arabic branch is an unreachable-today fallback, documented in code, classified FALLBACK not VIOLATION) — and a set of `<option value="x">x</option>`-style selects (Online/Offline, Manual/Cloud Call Center, Lead/Customer, Participants/Team) plus the brand names "Google Meet"/"Zoom", classified TECHNICAL/INTENTIONAL consistent with the same pattern already established and left alone in the Wave 2 Customers pass.

Preserved throughout: column headers, row/business data, filter operators, route paths, API endpoints, payloads and backend enums. No API contract or route URL changes were made in this pass.

**Wave 6 — Tasks (this session, complete for reachable UI):** All of `features/tasks` (~20 files) plus `pages/tasks/TasksPage.jsx`. `taskMeta.js`'s meta maps converted to `get*MetaMap(t)` factories, fixing 9 downstream consumers in one change; heavy reuse of Wave 4's `activities.*` vocabulary where Arabic text matched exactly, separate `tasks.statuses.*` kept where task/activity status wording or gender differed. Consolidated a duplicate type/priority option list in `TaskForm.jsx` into `taskMeta.js`'s single source. Fixed a hardcoded-`'ar-EG'` date-format bug in `TaskCalendarView.jsx`. Flagged (not fixed): the Customer-drawer's separate duplicated Tasks-tab mini-implementation.

**Wave 7 — Products/Services (this session, complete for reachable UI):** All of `pages/products` (11 files). Converted Arabic-literal default props to `t()`-resolved defaults for the `ProductCategoriesPage.jsx`/`ServiceCategoriesPage.jsx` and `ProductsPage.jsx`/`ServicesPage.jsx` prop-override reuse pattern. Fixed two more hardcoded-`'ar-EG'` date bugs. Kept product-status and category-status labels as separate keys (masculine vs. feminine Arabic grammatical agreement).

**Wave 10 — Opportunities and Campaigns (this session, complete for reachable UI):** All of `pages/opportunities` (16 files, including the full `OpportunityDrawer/` subtree and its four action dialogs) plus `features/opportunities/constants/opportunityTypes.js` and `features/opportunities/utils/opportunityFormatters.js`, converted to the same `get*(t)`-factory pattern as Waves 4/6 — this one change had ~15 downstream consumers, including `features/workflow-engine/hooks/useDataSourceOptions.js`, all updated in lockstep. `pages/campaigns/CampaignsPage.jsx` (the Meta-ads campaigns admin page, distinct from outreach campaigns) migrated under a new `campaigns.js` locale module. `OPPORTUNITY_PRIORITIES` and two `OPPORTUNITY_SOURCES` entries (`call`/`meeting`) reuse Wave 4's `activities.*` vocabulary exactly rather than duplicating. Fixed a genuine display bug in `useOpportunities.js`: mutation hooks were writing a hardcoded English `label` onto every timeline event, which silently defeated the localized fallback already wired into `OpportunityActivityTimeline.jsx` — every opportunity timeline event was showing raw English text regardless of app language; fixed by removing the redundant hardcoded label. Also fixed the same class of hardcoded-`'ar-EG'` bug (already seen in Waves 6/7) in `opportunityFormatters.js`'s currency/date formatters.

## Candidate classification

Every file listed as FIXED above was classified line-by-line, not sampled. Known examples beyond the prior session's: template-library seed data (labels, placeholders, select options) was VIOLATION and fixed; `<option>` elements whose text equals their technical `value` are TECHNICAL; brand names ("Google Meet", "Zoom") are INTENTIONAL; the two data-layer Arabic default strings noted above are FALLBACK; the hardcoded English timeline-event `label` in `useOpportunities.js` (Wave 10) was a VIOLATION that also happened to be a display bug (it silently overrode a working localized fallback) and was fixed by deletion rather than translation. No reliable totals exist yet for the remaining ~1,450 Arabic and ~220 English candidate lines outside the files fixed across Waves 1-4, 6, 7 and 10 — those remain NEEDS_REVIEW at scanner level (concentrated in Outreach, Conversations/Internal Chat, Workflow Engine, Integrations, and Administration, none of which have been audited yet).

## Feature coverage

| Area | Audited / fixed | Remaining | Status |
| --- | --- | --- | --- |
| Locale architecture | Modularized into 23 per-domain files, symmetrical AR/EN, regression-tested | N/A | FIXED |
| Shared DataTable | Canonical table and listed adjacent controls | Other shared table files, visual RTL/LTR | PARTIAL |
| Shared dialogs/drawers/forms | Existing defaults in working tree | Other instances and visual behavior | PARTIAL |
| Calendar, timeline, Kanban, Visual Flow | Inventory only | All static UI review | NOT_VERIFIED |
| Customers / Leads Center | Table/hover-card layer, details drawer, follow-up and status-change dialogs, proposals sub-feature, sidebar nav — reachable UI fully migrated | Dead code and one flagged direction-choice review (see audit) | FIXED |
| Leads (`features/leads`, `pages/leads`) | No UI in `features/leads`; `LeadsPage.jsx` fully migrated | — | FIXED |
| Calls, meetings, activities | Every file in `features/call-meetings` and `features/activities` — reachable UI fully migrated | Visual RTL/LTR verification only | FIXED |
| Tasks | `features/tasks` and `pages/tasks/TasksPage.jsx` — reachable UI fully migrated | Duplicated Customer-drawer Tasks tab (separate mini-implementation, not yet migrated) | FIXED (main feature); PARTIAL (duplicate tab) |
| Products, services | `pages/products` (products, categories, services, service categories) — reachable UI fully migrated | Visual RTL/LTR verification only | FIXED |
| Opportunities | `pages/opportunities` and `features/opportunities` — reachable UI fully migrated | Visual RTL/LTR verification only | FIXED |
| Campaigns (Meta ads admin) | `pages/campaigns/CampaignsPage.jsx` fully migrated; `features/campaigns` has no UI | Visual RTL/LTR verification only | FIXED |
| Outreach campaigns | Not audited this session (existing `outreachCampaigns.js` module predates this session's waves) | Full re-verification against current UI | NOT_VERIFIED |
| Conversations, internal chat, integrations | Inventory only | Menus, popups, provider UI | NOT_VERIFIED |
| Workflow, analytics, teams, users, settings | Inventory only | Node UI and remaining forms | NOT_VERIFIED |
| App shell/authentication | Prior Phase 1 localization retained; Leads Center sidebar fixed | Header/top-level nav areas outside Customers not re-verified | PARTIAL |

All route patterns are listed in the audit, with **CODE_REVIEW / UI NOT_VERIFIED** status. This is an inventory, not route-by-route code or visual verification. Non-route surfaces outside Customers/Leads/Calls/Meetings/Activities/Tasks/Products/Opportunities/Campaigns are likewise not fully audited.

## RTL/LTR and visual QA

No authenticated AR Light, AR Dark, EN Light or EN Dark browser matrix was performed in this pass, on desktop or mobile. No new `dir="rtl"`/`dir="ltr"` overrides were introduced in Waves 3-4 or Wave 10. Every visual matrix cell is NOT_VERIFIED.

## Validation

| Check | Result |
| --- | --- |
| `npm run check:i18n` | PASS, 2,394/2,394, 23/23 locale modules registered both languages |
| `npm run check:hardcoded-text` | Advisory only; 1,455 AR and 221 EN candidates remain project-wide |
| `npm run check:architecture` | PASS |
| `npm run lint` | PASS (whole `src`, zero errors) |
| `npm run build` | PASS, pre-existing large-bundle warning unchanged |
| `npx vitest run` | PASS, 14 files / 108 tests (102 prior + 6 new locale regression tests), no regressions |
| Translation compliance hard gate | NOT ENABLED; precision and migration incomplete |

## Next work

Continue the priority queue in the audit: Outreach campaigns next (re-verify against current UI), then Communication (conversations/internal-chat), Workflow Engine, Integrations, Administration (teams/users/settings), a final App Shell re-audit, and the duplicated Customer-drawer Tasks tab flagged in the Wave 6 update. Get a product decision on the proposal-document RTL question flagged in the prior session before it's assumed either way. Add a documented intentional-literal baseline and fail only on *new* high-confidence violations once scanner precision and remaining debt are understood. Verify representative authenticated routes and overlays in both languages, directions, themes and viewport sizes before declaring completion.
