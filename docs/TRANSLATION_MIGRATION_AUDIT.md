# ICAN CRM Translation Migration Audit

Status: PARTIAL working audit, updated 2026-09-19 (modular locale architecture + Wave 3/4 session). This is a triage ledger, not proof that all UI is bilingual. Code is the source of truth. The source tree changed during this audit; Phase 3 documentation and calendar/VisualFlow files are present and preserved.

## Locale Modularization Plan (executed this session)

Inventory of the pre-modularization `src/locales/{ar,en}/common.json` (1,320/1,320 leaf keys) by top-level namespace, its size, and its main consumer, used to derive the module split below (file-name == top-level i18next key, one file per namespace, no i18next runtime-namespace change — `defaultNS` stays `common`):

| Top-level key | Leaf keys | Main consumer | Ownership |
| --- | ---: | --- | --- |
| `app` | 14 | App shell (title, 404, network status) | shared/app-shell |
| `nav` | 28 | Global navigation (`app/navigation`) | shared/app-shell |
| `actions` | 15 | Generic verbs used across every feature | cross-cutting |
| `auth` | 8 | Login screen | features/auth |
| `status` | 7 | Shared lead/customer status vocabulary | cross-cutting |
| `common` | 15 | Generic loading/error/retry/theme/am-pm | cross-cutting |
| `dataTable` | 147 | Shared DataTable engine | shared/components/data-table |
| `leads` | 12 | Legacy/adjacent leads surface | features/leads |
| `customers` | 298 | Customers / Leads Center (table, drawer, follow-up, proposals nav, sidebar) | pages/customers |
| `proposals` | 208 | Proposal builder/renderer/wizard/templates | pages/customers/pages/proposals |
| `activities` | 21 | Shared status/priority/type/duration vocabulary | features/activities, features/call-meetings |
| `conversations` | 8 | Conversations feature | features/conversations |
| `dashboard` | 8 | Dashboard | pages/dashboard |
| `opportunities` | 19 | Opportunities feature | features/opportunities |
| `outreachCampaigns` | 169 | Outreach campaigns (WhatsApp/Messenger/Gmail) | features/outreach-campaigns |
| `workflow` | 251 | Workflow engine builder/nodes/execution | features/workflow-engine |
| `visualFlow` | 62 | Shared Visual Flow canvas | shared/components/visual-flow |
| `visualFlowDemo` | 10 | Visual Flow demo/playground page | pages/playground |
| `calendar` | 20 | Shared calendar engine | shared/components/calendar |

Domains listed in the task's illustrative structure that do **not** yet exist as namespaces (`tasks`, `products`, `campaigns`, `internalChat`, `integrations`, `analytics`, `teams`, `users`, `settings`, `validation`, `errors`) were **not** created as empty files — those features either reuse `actions`/`common`/`status` today or have not been migrated yet; a module file is created the first time that domain gets real translated copy, per `docs/LOCALES_ARCHITECTURE.md`.

`customers` (298) and `workflow` (251) are the largest domains but were judged not large enough to need sub-modularization (a few hundred lines each, still a normal single-file size) — see `docs/LOCALES_ARCHITECTURE.md` "Sub-modularization" for the pattern to use if that changes later.

**Execution result:** `src/locales/{ar,en}/common.json` (1,564 lines each) replaced by 19 symmetrical module files per language plus `index.js` aggregators, plus a root `src/locales/index.js` resources registry consumed by `src/i18n.js`. Translation-key paths are byte-identical to before (verified: every `t()` call site needed zero changes). `scripts/check-translations.mjs` rewritten to dynamically import each language's `index.js`, flatten leaves, and additionally fail if a module file on disk isn't registered in `index.js` or vice versa (duplicate/omitted-module protection per task requirement). Added `src/locales/locales.test.js` (6 tests: both languages assemble, module lists match, nested keys survive composition, AR/EN leaf-key sets match, no empty/non-string leaves) — this is the "no domain module silently omitted" regression test.

**Bug found and fixed during modularization:** `scripts/check-hardcoded-text.mjs`'s `ALLOW_SUBSTRINGS` exclusion for `/locales/` compared against `path.join()` output, which uses backslashes on Windows — so on Windows the exclusion silently never matched, and converting locale files from `.json` (invisible to the scanner's `.jsx?` file filter) to `.js` (now visible) would have made every translation *value* falsely reported as a hardcoded-UI violation (3,975 false positives observed before the fix). Fixed by normalizing path separators before the substring check; re-verified the advisory counts return to the exact pre-modularization baseline (2,674 AR / 317 files, 276 EN / 76 files) — i.e. the module split changed zero actual translation content.

Validation after modularization: `npm run check:i18n` PASS (1,320/1,320, 19/19 modules registered both languages), `npm run lint` PASS, `npm run check:architecture` PASS, `npx vitest run` PASS (108/108 — 102 prior + 6 new locale tests), `npm run build` PASS (2,692 modules). Created `docs/LOCALES_ARCHITECTURE.md` as the permanent developer reference; updated `docs/ARCHITECTURE.md` and `docs/FEATURE_DEVELOPMENT_CHECKLIST.md` to point at the new module layout instead of the old `common.json` paths.

## Wave 2 completion update (Customers wave finished)

Completed the rest of the Customers wave requested after the checkpoint below: `CustomerDetailsDrawer.jsx` (69 AR + 8 EN → 0 reachable; all remaining scanner hits confirmed dead code in three unused legacy header components — `CustomerHeader`, `CustomerHeaderModernLegacy`, `CustomerHeaderModernSplit` — verified by repo-wide grep showing zero JSX usage; only `CustomerHeaderModern` is actually rendered and is now fully migrated), the follow-up-note dialog family (`FollowUpNoteDialog.jsx`, `FollowUpScheduleSection.jsx`, `FollowUpInterestedProductSection.jsx` — also removed a hardcoded `dir="rtl"` on the floating dialog root, since the component uses logical Tailwind properties throughout and should follow the app's language, not force RTL), the status-change dialogs (`StatusChangeReasonDialog.jsx`, `ChangeStatusBulkAction.jsx`), and the entire proposals sub-feature (13 files: `ProposalPropertiesPanel.jsx`, `proposalBlockTypes.js`, `ProposalBuilderSidebar.jsx`, `proposalBuilderContent.js`, `ProposalWizard.jsx`, `ProposalBuilder.jsx`, `ProposalPricingPanel.jsx`, `ProposalRenderer.jsx`, `CustomerProposalsPage.jsx`, `CustomerProposalTemplatesPage.jsx`, `ProposalBuilderHeader.jsx`, `ProposalVersionsPanel.jsx`, `ProposalModal.jsx`, `ProposalPreviewDialog.jsx`, `proposalPayloads.js`). Also fixed the Leads Center sidebar navigation (`customerNavigation.js` + `CustomersSidebar.jsx`), found while triaging a proposals-nav scanner hit — the entire sidebar (3 groups, 14 nav items, header, collapse toggle) was hardcoded Arabic regardless of language.

Notable fixes beyond string replacement:
- `proposalPayloads.js`'s `formatDate` hardcoded the `ar-EG` locale regardless of app language; it now delegates to the existing canonical `shared/utils/dateTime.js#formatDate(value, language)`, which the rest of the app already uses for locale-aware date formatting.
- `ProposalBuilder.jsx` and `CustomerProposalsPage.jsx`/`CustomerProposalTemplatesPage.jsx` had a hardcoded `dir="rtl"` on their page root; removed since these are ordinary app pages using logical CSS properties, not customer-facing documents.
- `ProposalRenderer.jsx`'s `<article dir="rtl">` (the actual rendered proposal document content, as opposed to the app chrome around it) was deliberately **left as-is** — this renders the business document a customer receives, and forcing its direction independent of the CRM operator's UI language looks like an intentional business decision (Arabic-market customer documents), not a translation bug. Flagged as REVIEWED, not fixed, pending explicit product confirmation.
- Currency codes in `proposalBuilderDefaults.js` (EGP/USD/EUR/SAR/AED) were left untranslated — INTENTIONAL, ISO currency codes are conventionally not localized.

Reused existing keys extensively instead of creating duplicates wherever wording matched exactly (e.g. `customers.phone`, `customers.table.cancel`, `activities.priority.*`, `proposals.builder.fields.*` reused across the wizard, pricing panel and templates page) — see the locale files for the full `proposals.*` namespace tree (~120 new keys this pass).

Session totals for the full Customers wave: AR candidates 3,301 → 2,674 (−627) across 343 → 317 files; EN candidates 321 → 276 (−45) across 79 → 76 files. Key count 805/805 → 1,320/1,320. Every reduction was verified file-by-file (not assumed from the aggregate), and every remaining hit in a touched file was traced to a specific, documented reason (dead code or explicit TECHNICAL/INTENTIONAL classification).

## Wave 2 session update (earlier checkpoint, retained for history)

Continued from the shared-UI checkpoint below (Wave 1 was already complete: canonical DataTable and adjacent shared overlays/forms). This pass fully migrated the **reachable** UI in the Customers table/hover-card layer, the first named priority of Wave 2:

- `pages/customers/components/CustomersTableColumns.jsx` — all column headers, filter-option labels, hover/button tooltips, status/priority/duration formatting. 79 Arabic + 27 English scanner candidates → 0 reachable (24 Arabic + 10 English remain, all confirmed **DEAD_CODE**: `LeadNoteHoverDetails`, `ScheduledActivityHover`, `DelayedFullTextHover`, `DelayedActivityHover`, `getActivityStatusMeta`, `getActivityPriorityMeta`, `renderActivityDetails`, `renderActivityMainInfo`, `renderActivityWithRemaining`, `renderActivityType`, `renderActivityStatus` are defined in this file but never invoked from the exported `columns` array — verified by tracing every call site. Left untouched; deleting dead code is outside a translation task's scope).
- `pages/customers/components/customers-table/CustomerTableHovers/CustomerTableHovers.jsx` — the actual hover-detail renderers consumed by the table (`CustomerLeadNoteHoverDetails`, `CustomerScheduledActivityHoverDetails`, `CustomerNotePreviewHover`, `CustomerMarketingSourceHoverDetails`, `CustomerPersonHoverDetails`, `CustomerStatusChangeHoverDetails`, `CUSTOMER_SOURCE_META`) — fully migrated, `t` threaded through every function.
- `CustomerPersonCell.jsx`, `CustomerMarketingSourceCell.jsx`, `CustomerLeadActivitiesCell.jsx`, `CustomerProductsCell.jsx` — `t` threaded from `CustomersTableColumns.jsx` render callbacks down to every hover card.
- `CustomerTableDetailsDialogs/CustomerTableDetailsDialogs.jsx` — `LeadActivitiesDialog` (drag/pin/close/loading/error strings) and `OpenDetailsButton` migrated. `ProductDetailsDialog`, `SourceDetailsDialog`, `EmptyInfoState` confirmed **exported but never imported anywhere in `src`** (verified by repo-wide grep) — DEAD_CODE, left untouched.
- `pages/customers/CustomersPage.jsx` — all toasts, `window.confirm` dialogs, row/bulk context-menu actions, activity range/status filters, empty states. 62 candidates → 0 reachable (4 remain, all confirmed DEAD_CODE/COMMENT: an unused `getTodayActivitiesByType` function, one commented-out `{/* <PageToolbar> */}` JSX block the scanner's line-based check can't see through, and one `: true ? … : 'unreachable string'` dead ternary branch).

New reusable namespaces added (both locales, verified paired): `customers.table.*` (headers, hover labels, source/person labels, activity-timeline dialog), `activities.status.*` / `activities.priority.*` / `activities.type.*` / `activities.duration.*` (deliberately generic — Wave 4's call-meetings files will reuse these instead of duplicating), `common.am` / `common.pm`, `customers.page.*` (toasts, confirms, row/bulk actions). Key count: 805/805 → 969/969 (164 new keys, `npm run check:i18n` PASS throughout).

Explicitly preserved as non-violations this pass: tenant-defined attribute-column headers, `statusesQuery`/`tagsQuery`/`usersQuery` filter-option data (backend-supplied labels), the `'customer note added'` activity-title string used for equality matching against backend data (changing it breaks note detection — BUSINESS_LOGIC, not copy), and a set of already-English technical hover fields (`ID`, `Scope`, `Meeting Link`, `Location`, `Latitude`/`Longitude`, `Call Provider`, `External Call ID`, `Recording URL`, `Call Duration/Status`, `Caller`/`Callee Number`, `Team ID`, `Created By`) classified TECHNICAL and deferred — not a language-mismatch bug since they already render identically in both languages, lower priority than genuine violations.

Validation this pass: `npm run check:i18n` PASS (969/969), `npm run lint` PASS (whole `src`, zero errors), `npm run check:architecture` PASS, `npx vitest run` PASS (102/102, no regressions), `npm run build` PASS (2653 modules; the pre-existing large-chunk warning is unchanged in nature, not introduced by this pass). Scanner totals: Arabic candidates 3,301→3,112 across 343→339 files; English candidates 321→291 across 79 files (unchanged file count — remaining English hits are in files not yet touched this pass).

## Baseline and method

`npm run check:hardcoded-text` scanned 797 JS/JSX files and flagged 3,440 Arabic-script lines in 349 files. The conservative English extension flagged 337 lines in 80 files. `npm run check:i18n` reported 693/693 non-empty AR/EN leaf keys at the start of this focused pass (Phase 3's historical 672/672 predates the shared-UI edits already in progress). A line is a candidate, not necessarily a unique literal or violation. The scanner excludes locale files, single-line comments and some mock/demo paths but includes the unimported `data-table - Copy`; multiline comments, business data and JSX dynamic expressions need manual classification. Run `DETAIL=1` (PowerShell: `$env:DETAIL='1'`) for file/line excerpts and `FULL=1` for all ranked files.

Classification vocabulary: VIOLATION, FALLBACK, MOCK_DATA, BUSINESS_DATA, TECHNICAL, COMMENT, TEST_DATA, INTENTIONAL, FALSE_POSITIVE, NEEDS_REVIEW. Only examined entries receive a classification; the remainder are NEEDS_REVIEW. Do not infer zero remaining violations from key parity.

| Feature | File / location | Literal or pattern | Classification | Action | Status |
| --- | --- | --- | --- | --- | --- |
| Shared table | `DataTable.jsx` toolbar, selection, scroll and split headers | Arabic commands/tooltips | VIOLATION | Replaced with `t('dataTable.*')` | FIXED in canonical component; visual QA pending |
| Shared table | `DataTable.jsx:137` date-like column regex | Arabic date/time words | TECHNICAL | Preserve detection behavior | INTENTIONAL |
| Shared table | `DataTable.jsx` swatch hex values | Color data, not copy | TECHNICAL | Preserve color values | INTENTIONAL |
| Shared table | `DataTableBody`, `DataTableCompareDialog`, `ExportDialog`, `DataTableShortcuts`, `DateRangeInput`, `TableStyleCustomizer` | Commands, tooltips and export/print headers | VIOLATION | Localized static UI; preserved row data, column headers and filter values | FIXED in these components; visual QA pending |
| Shared table | `ColumnFilter.jsx`, `DataTableFooter.jsx`, `DataTableHeader.jsx`, `ActiveFilters.jsx` | Arabic labels and commands | VIOLATION | Localized in current working tree | FIXED in named components; build passed, visual QA pending |
| Shared overlays/forms | `AppDrawer`, `AppModal`, `ConfirmDialog`, `FormDialog`, `Select`, `Pagination`, `ResourceState` | Arabic/English defaults | VIOLATION | Localized in current working tree | FIXED in named components; build passed, visual QA pending |
| Legacy table copy | `shared/components/data-table - Copy` | old Arabic copy | INTENTIONAL legacy, unimported | Do not edit as live UI; prevent new imports | REVIEWED |
| Opportunities | `features/opportunities/constants/opportunityTypes.js` | mock opportunity names, labels and enum-like values | MIXED MOCK_DATA / NEEDS_REVIEW | Inspect each displayed label without changing values | OPEN |
| Calls/meetings | `PreMeetingReportDrawer`, `MeetingDataDrawer`, `ScheduleActivityDialog` | 111, 92, 83 Arabic candidate lines respectively | NEEDS_REVIEW, many likely VIOLATION | Manual field-by-field translation | OPEN |
| Customers | `CustomersTableColumns.jsx`, `CustomersPage.jsx`, `CustomerTableHovers.jsx`, `CustomerPersonCell.jsx`, `CustomerMarketingSourceCell.jsx`, `CustomerLeadActivitiesCell.jsx`, `CustomerProductsCell.jsx`, `CustomerTableDetailsDialogs.jsx` | Table headers, hover cards, toasts, confirms, context-menu actions | VIOLATION | Migrated to `t()`; new `customers.table.*`/`customers.page.*`/`activities.*` keys | FIXED (reachable UI only); remaining candidates confirmed DEAD_CODE, see Wave 2 session update above |
| Customer notes | `CustomersTableColumns.jsx` and activity payloads | customer-entered text | BUSINESS_DATA | Never translate stored content | INTENTIONAL |
| English providers | WhatsApp, Messenger, Gmail, Meta | provider names | INTENTIONAL | Keep names; translate surrounding instructions | REVIEWED |
| API/routes | `/api/*`, router paths, status/permission keys | technical identifiers | TECHNICAL | Preserve | INTENTIONAL |

## Route coverage

The table enumerates current router patterns, including nested paths. CODE_REVIEW means route registration and owner identified, not that every component was translated. NOT_VERIFIED means no authenticated browser matrix was performed. No route is marked fully verified yet.

| Route pattern(s) | Page / workspace | Translation / RTL-LTR status |
| --- | --- | --- |
| `/login` | LoginPage | CODE_REVIEW; UI NOT_VERIFIED |
| `/` | DashboardPage | CODE_REVIEW; UI NOT_VERIFIED |
| `/leads` | LeadsPage | CODE_REVIEW; UI NOT_VERIFIED |
| `/LeadsCenter` | CustomersPage | CODE_REVIEW; UI NOT_VERIFIED |
| `/LeadsCenter/new`, `/LeadsCenter/follow-up`, `/LeadsCenter/inactive` | Customer list variants | CODE_REVIEW; UI NOT_VERIFIED |
| `/LeadsCenter/segments`, `/LeadsCenter/assignments`, `/LeadsCenter/teams` | Customer organization | CODE_REVIEW; UI NOT_VERIFIED |
| `/LeadsCenter/duplicates`, `/LeadsCenter/customization`, `/LeadsCenter/import-export` | Customer utilities | CODE_REVIEW; UI NOT_VERIFIED |
| `/LeadsCenter/trash`, `/LeadsCenter/settings`, `/LeadsCenter/status-board` | Customer administration | CODE_REVIEW; UI NOT_VERIFIED |
| `/LeadsCenter/activities`, `/LeadsCenter/activities/meeting/:meetingId` | Customer activities/detail | CODE_REVIEW; UI NOT_VERIFIED |
| `/LeadsCenter/proposals`, `/LeadsCenter/proposals/templates`, `/LeadsCenter/proposals/:proposalId/builder` | Proposal list/templates/builder | CODE_REVIEW; UI NOT_VERIFIED |
| `/lead/:customerId`, `/leads/:customerId` | CustomerLeadDetailsPage | CODE_REVIEW; UI NOT_VERIFIED |
| `/activities`, `/activities/calls`, `/activities/meetings`, `/activities/calendar` | ActivitiesPage modes | CODE_REVIEW; UI NOT_VERIFIED |
| `/conversations`, `/team-chat` | Conversations/InternalChat | CODE_REVIEW; UI NOT_VERIFIED |
| `/campaigns` | Advertising campaigns | CODE_REVIEW; UI NOT_VERIFIED |
| `/outreach-campaigns`, `/outreach-campaigns/:campaignId` | Outreach list/detail | CODE_REVIEW; UI NOT_VERIFIED |
| `/opportunities`, `/automation` | Opportunity/Workflow centers | CODE_REVIEW; UI NOT_VERIFIED |
| `/tasks`, `/calendar` | Tasks and shared Calendar route | CODE_REVIEW; UI NOT_VERIFIED |
| `/products`, `/products/categories`, `/products/services`, `/products/service-categories` | Product/service workspaces | CODE_REVIEW; UI NOT_VERIFIED |
| `/teams`, `/users`, `/templates` | Administration/template workspaces | CODE_REVIEW; UI NOT_VERIFIED |
| `/settings`, `/settings/definitions`, `/settings/users`, `/settings/integrations` | Settings layout | CODE_REVIEW; UI NOT_VERIFIED |
| `/integrations/facebook/callback` | OAuth callback | CODE_REVIEW; UI NOT_VERIFIED |
| `/playground/datatable`, `/playground/visual-flow` | Development demos | CODE_REVIEW; UI NOT_VERIFIED |
| Unmatched routes (`*`) | NotFoundPage | Localized in Phase 1; visual NOT_VERIFIED |

## Non-route coverage

| Surface | Owner | Review status |
| --- | --- | --- |
| Main Header/Sidebar/nav, NetworkStatusIndicator | `shared/layout`, `app/navigation` | Phase 1 labels addressed; further strings NEEDS_REVIEW |
| Generic dialogs, drawers, form controls, feedback | `shared/components` | Defaults localized in current working tree; other strings NEEDS_REVIEW |
| Canonical DataTable and filters/export/print | `shared/components/data-table` | Core and named adjacent components localized; other files and RTL/LTR visual behavior NEEDS_REVIEW |
| Calendar, task board/Kanban, timelines | `shared/calendar`, `features/tasks`, `pages/customers` | NEEDS_REVIEW |
| VisualFlow/workflow node editors | `shared/visual-flow`, `features/workflow-engine` | NEEDS_REVIEW; IDs must remain unchanged |
| Call/meeting reports and forms | `features/call-meetings`, `features/activities` | FIXED (reachable UI) — see Wave 3/4 update below |
| Customer drawer/floating chats, proposal builder | `pages/customers` | NEEDS_REVIEW (proposal builder FIXED in Wave 2; floating chats not yet re-verified) |
| Conversation popups, notification center | `features/conversations`, `internal-chat`, `notifications` | NEEDS_REVIEW |

## Wave 3/4 update (this session — modular locales + Leads + Calls/Meetings/Activities)

**Part I — Modular locale architecture (executed, see "Locale Modularization Plan" above).** `src/locales/{ar,en}/common.json` replaced by 20 symmetrical per-domain module files (`app, nav, actions, auth, status, common, dataTable, leads, customers, proposals, activities, callMeetings, conversations, dashboard, opportunities, outreachCampaigns, workflow, visualFlow, visualFlowDemo, calendar`) plus `index.js` aggregators and a root `src/locales/index.js` registry. `i18next` namespace unchanged (`common`); every existing `t()` call site required zero changes. `scripts/check-translations.mjs` rewritten to dynamically import the modules and additionally fail on any file/registration mismatch. Added `src/locales/locales.test.js` (6 regression tests). Fixed a real Windows-path bug in `scripts/check-hardcoded-text.mjs` found during this work (see above). Created `docs/LOCALES_ARCHITECTURE.md`.

**Wave 3 — Leads (complete).** `features/leads` has no UI of its own (API/hooks/workflow-definition only, zero scanner hits). `pages/leads/LeadsPage.jsx` (19 AR + 1 EN candidates → 0): admin-style lead-log/assignment-rule page, was fully hardcoded Arabic; now fully translated under new `leads.page.*` namespace, mixed Arabic-with-English-technical-terms phrasing preserved where it referred to literal field/enum names (`lead_id`, `action: call, note, status_change`).

**Wave 4 — Calls/Meetings/Activities (complete for reachable UI).** Every file in `features/activities` and `features/call-meetings` was migrated. Highlights:
- `PreMeetingReportDrawer.jsx` (111→0): 5 real-estate/sales report templates converted from module-level Arabic literal data to a `getPreMeetingTemplates(t)` factory; new `activities.preMeetingReport.*` namespace including a shared `options.*` catalog (property types, payment methods, etc.) reused later by `afterMeetingTemplates.js`.
- `MeetingDataDrawer.jsx` (92→0), `ScheduleActivityDialog.jsx` (83→0, converted `PRIORITY_OPTIONS`/`REMINDER_OPTIONS`/`SCHEDULE_CONFIG` to `t`-based factories), `afterMeetingTemplates.js` (77→0, same factory-function treatment as the pre-meeting templates, `getAfterMeetingTemplates(t)`), `AfterMeetingReportDrawer.jsx` (31→0) and its 4 sibling components/helpers — all fully migrated.
- `features/activities/constants/activityConstants.js` — the shared `ACTIVITY_TYPES`/`ACTIVITY_STATUSES`/`ACTIVITY_DERIVED_STATES`/`ACTIVITY_PRIORITIES` lookup tables converted to `get*(t)` factory functions; this single change fixed 8 downstream consumers (badges, tabs, filters, form) with heavy reuse of the existing `activities.status/priority/type.*` vocabulary (verified exact-string matches before reusing; kept `activities.scheduleDialog.priorityOptions.*`'s grammatical-gender variant separate from `activities.priority.*` where the source Arabic differed, e.g. "عالية" vs "مرتفعة").
- `activityColumns.jsx`, `ActivitiesPage.jsx`, `ActivityDrawer.jsx` + all 7 drawer tabs, `ActivityForm.jsx` + 5 field subcomponents, `ActivityReportDialog.jsx`, `activitySchema.js`/`activityReportSchema.js` (Zod schemas converted to `get*Schema(t)` factories so validation messages localize), `MeetingFilters.jsx`/`CallFilters.jsx` (+ `getMeetingStatusLabel`/`getCallStatusLabel`, kept as two separate label sets since Arabic call/meeting status agreement differs by grammatical gender), `MeetingsActionTab.jsx`/`CallsActionTab.jsx`, `MeetingQuickAction.jsx`/`CallQuickAction.jsx`, `MeetingReminderBanner.jsx`/`CallReminderBanner.jsx`, `LiveMeetingIndicator.jsx`, `scheduleDetailsUtils.js`, `scheduleUiUtils.js` — all fully migrated.
- New `src/locales/{ar,en}/callMeetings.js` module created for call-meetings-feature-owned chrome that isn't part of the shared activities-report vocabulary (live-meeting indicator, filters, action-tab labels, reminder banners, quick actions).
- Deliberately left as data-layer fallbacks (not component-layer, no `t` in scope; documented in code): `activityHelpers.js#normalizeActivity`'s two Arabic default-title strings and `activityDateHelpers.js`/`scheduleUiUtils.js`'s duration formatters keep a `t`-optional signature — when called from a component `t` is always passed and the text is fully localized; the bare fallback branch only fires for the (currently nonexistent) case of a call from outside React. Classified FALLBACK, not VIOLATION.
- Deliberately left untranslated (TECHNICAL/INTENTIONAL, confirmed by re-scanning): `<option value="online">Online</option>`-style selects where the displayed text is the literal technical mode/enum value itself (Online/Offline, Manual/Cloud Call Center, Lead/Customer, Participants/Team) — same pattern already established and left alone in the Customers wave; brand names "Google Meet"/"Zoom".

Session totals for this update alone: AR candidates 2,674 → 1,903 (−771) across 317 → 258 files; EN candidates 276 → 262 (−14) across 76 → 71 files. Key count 1,320/1,320 → 1,996/1,996 (676 new keys, all in `activities.js` and the new `callMeetings.js`). `npm run check:i18n`, `lint`, `check:architecture`, `npx vitest run` (108/108, includes the 6 new locale tests), and `npm run build` all PASS after this update.

## Wave 6/7 update (this session — Tasks and Products/Services)

**Wave 6 — Tasks (complete for reachable UI).** All of `features/tasks` (~20 files: `TaskDrawer.jsx`, `TaskForm.jsx`/`TaskFormDialog.jsx`, `taskMeta.js`, board/* — `TaskBoardHeader.jsx`, `TaskCardMenu.jsx`, `InlineTaskCreator.jsx`, `board/TaskCard.jsx`, workspace/* — `TasksWorkspaceHeader.jsx`, `TasksWorkspaceSidebar.jsx`, `TasksSidebarPanel.jsx`, `TasksNavbarButton.jsx`, `TaskCalendarView.jsx`, `TaskKanbanView.jsx` (confirmed dead/unimported but fixed anyway to avoid a landmine — see below)) plus `pages/tasks/TasksPage.jsx` (was only partially migrated: one `t()` call existed, the rest of the page was still raw Arabic). New `src/locales/{ar,en}/tasks.js` module (~150 keys). Notable:
- `taskMeta.js`'s `TASK_TYPE_META`/`TASK_PRIORITY_META`/`TASK_STATUS_META` plain objects converted to `get*MetaMap(t)` factories (same pattern as `activityConstants.js` in Wave 4) — fixed 9 downstream consumers across `features/tasks`, `pages/tasks`, and `features/calendar/adapters/taskEventAdapter.js` in one change. Heavy reuse of the `activities.*` vocabulary built in Wave 4 (type/priority/status labels) where the Arabic text matched exactly; kept separate `tasks.statuses.*` entries where it didn't (task statuses use different Arabic wording/gender than activity statuses — "جاري العمل" vs "قيد التنفيذ", "مكتملة" vs "مكتمل").
- `TaskForm.jsx` had its own **second, unlinked copy** of the type/priority option lists (`TASK_TYPES`/`TASK_PRIORITIES`) duplicating `taskMeta.js`'s meta maps with identical Arabic text — consolidated to derive from `taskMeta.js` instead of maintaining a duplicate source of truth (values unchanged, only the translation source consolidated).
- Fixed a real locale bug in `TaskCalendarView.jsx`: date/time formatting hardcoded `'ar-EG'` via raw `toLocaleDateString`/`toLocaleTimeString` calls regardless of app language; switched to the project's canonical `shared/utils/dateTime.js#formatDate/formatTime`.
- `taskMeta.js`'s data-layer helpers (`getTaskTitle`, `formatTaskDateLabel`, `getTaskAssigneeLabel`) given the same `t`-optional signature pattern as Wave 4's `activityHelpers.js` — every real (component) call site now passes `t` and is fully localized; the bare-Arabic fallback branch only fires for the one remaining data-adapter call site (`taskEventAdapter.js`, documented in code) that has no `t` available.
- `pages/customers/.../CustomerDetailsDrawer/tabs/TasksTab/*` is a **separate, duplicated** mini task-list embedded in the Customer drawer with its own local `getTaskTitle`/`getTaskPriorityMeta`/`TASK_STATUSES` (does not import `taskMeta.js`) — NOT covered by this wave, flagged as a follow-up (~44 candidate lines across `taskUtils.js`/`TaskCreateForm.jsx`/`TasksTab.jsx`/`TaskList.jsx`/`TaskCreateDialog.jsx`).

**Wave 7 — Products / Services (complete for reachable UI).** All of `pages/products` (11 files: `ProductCategoriesPage.jsx`, `ProductsPage.jsx`, `ProductFormDrawer.jsx`, `CategoryFormDrawer.jsx`, `AdditionalDataFields.jsx`, `ProductsSidebar.jsx`/`ProductsMobileSidebar.jsx`/`ProductsLayout.jsx`, `productNavigation.js`, `ServicesPage.jsx`, `ServiceCategoriesPage.jsx`). New `src/locales/{ar,en}/products.js` module. Notable:
- `ProductCategoriesPage.jsx` is reused by `ServiceCategoriesPage.jsx` via prop overrides (`title`/`description`/`emptyMessage`/`createLabel`); `ProductsPage.jsx` is reused the same way by `ServicesPage.jsx`. Converted the Arabic literal defaults to `t()`-resolved defaults and translated the two wrapper pages' override props, preserving the override mechanism itself.
- Fixed another hardcoded-locale date bug: `ProductCategoriesPage.jsx` and `ProductsPage.jsx` each had a local `formatDate()` calling `toLocaleDateString('ar-EG')` regardless of app language; both replaced with the canonical `shared/utils/dateTime.js#formatDate`.
- `productNavigation.js`'s `productNavigationGroups` constant converted to `getProductNavigationGroups(t)` (same pattern as `customerNavigation.js` in Wave 2).
- Preserved intentionally-ungendered/gender-specific duplicate wording: product status labels ("نشط"/"معطل", masculine, since "المنتج" is masculine) kept distinct from category status labels ("نشطة"/"معطلة", feminine, matching the source text) rather than force-reusing one for the other.

Session totals for Waves 6+7: AR candidates 1,903 → 1,627 (−276) across 258 → 239 files; EN candidates 262 → 256 (−6) across 71 → 67 files. Key count 2,178/2,178 → 2,246/2,246 (68 new keys — lower than earlier waves because Products reused Wave 4's `activities.*` vocabulary heavily). Two new locale modules registered (`tasks.js`, `products.js`), bringing the total to 22 modules per language. `check:i18n`, `lint`, `check:architecture`, `npx vitest run` (108/108), and `npm run build` all PASS.

## Wave 10 update (this session — Opportunities and Campaigns)

**Wave 10 — Opportunities (complete for reachable UI).** All of `pages/opportunities` (16 files: `OpportunityCenterPage.jsx`, `OpportunityOverview.jsx`, `OpportunityInbox.jsx`, `OpportunitiesTable.jsx`, and the whole `OpportunityDrawer/` subtree — header, why-section, signals list, customer card, activity timeline, score breakdown, actions bar, and the four action dialogs: dismiss/activate/watch/assign) plus `features/opportunities/constants/opportunityTypes.js` and `features/opportunities/utils/opportunityFormatters.js`. `opportunities.js` locale module extended from 21 app-chrome keys to a full domain vocabulary (`types`, `statuses`, `sources`, `signalTypes`, `dismissReasons`, `timelineEvents`, `scoreComponents`, `relativeTime`, `columns`, `dialogs`, `groups`, `inbox`, `actionsBar`, `customerCard`, `drawer`). Notable:
- `opportunityTypes.js`'s plain constant arrays (`OPPORTUNITY_TYPES`/`STATUSES`/`PRIORITIES`/`SOURCES`/`SIGNAL_TYPES`/`DISMISS_REASONS`/`TIMELINE_EVENT_LABELS`, plus their `_MAP` variants) converted to `get*(t)` factories — same pattern as `activityConstants.js` (Wave 4) and `taskMeta.js` (Wave 6). This one change had ~15 downstream consumers across `pages/opportunities` and `features/workflow-engine/hooks/useDataSourceOptions.js` (a workflow dynamic-data-source adapter that lists opportunity statuses as a field option source) — all found via repo-wide grep and updated in lockstep so nothing was left calling the old plain-array signature.
- `opportunityFormatters.js` rewritten so every label/meta getter takes `t`, and `formatCurrency`/`formatDateTime`/`formatRelativeTime` take a `language` param and resolve the `Intl` locale via a local `resolveLocale(language)` helper — fixing the same class of hardcoded-`'ar-EG'` bug already found and fixed in Wave 6 (`TaskCalendarView.jsx`) and Wave 7 (`ProductCategoriesPage.jsx`/`ProductsPage.jsx`).
- `OPPORTUNITY_PRIORITIES` reuses `activities.scheduleDialog.priorityOptions.high/medium/low` (exact Arabic match); `OPPORTUNITY_SOURCES`'s `call`/`meeting` entries reuse `activities.type.call`/`activities.type.meeting` instead of duplicating — both are genuine key-reuse, not new content.
- Found and fixed a real display bug while migrating `useOpportunities.js`: the mutation hooks (`qualify`/`activate`/`watch`/`dismiss`/`assign`) were writing a hardcoded English `label: 'Status changed'` / `label: 'Assigned'` onto every timeline event they created. `OpportunityActivityTimeline.jsx` renders `event.label || getTimelineEventLabel(event.type, t)` — since `label` was always present, the correctly-localized fallback was silently dead code and every opportunity timeline event showed raw English regardless of app language. Fixed by dropping the redundant hardcoded `label` field so the timeline now always resolves the localized label from `event.type`. Also translated the synthetic timeline actor name (`'أنت'` → `t('opportunities.you')`).
- Score components (`Fit`/`Intent`/`Engagement`/`Timing`) and the `Score`/`AI Confidence` headings kept in English in both locales, consistent with the existing precedent already in this file from before this session.

**Growth — Campaigns (complete for reachable UI).** `pages/campaigns/CampaignsPage.jsx` (the Facebook/Meta-ads-linked campaigns admin page — distinct from the outreach-campaigns feature, which was already covered by the existing `outreachCampaigns.js` module) fully migrated. `features/campaigns` has no UI of its own (API/hooks only, same shape as `features/leads` in Wave 3) — confirmed via grep, no Arabic literals found there. New `src/locales/{ar,en}/campaigns.js` module created (12 keys) since this is a distinct domain with real content, not folded into `outreachCampaigns.js`.

Session totals for Wave 10: AR candidates 1,627 → 1,455 (−172) across 239 → 219 files; EN candidates 256 → 221 (−35) across 67 → 58 files. Key count 2,246/2,246 → 2,394/2,394 (148 new keys). One new locale module registered (`campaigns.js`), bringing the total to 23 modules per language. `check:i18n`, `lint`, `check:architecture`, `npx vitest run` (108/108), and `npm run build` all PASS.

## Priority queue

1. ~~Finish canonical DataTable and adjacent shared UI.~~ DONE (Wave 1).
2. ~~Customers/Leads Center wave in full.~~ DONE (Wave 2, complete).
3. ~~Leads-specific screens (`features/leads`, `pages/leads/LeadsPage.jsx`).~~ DONE (Wave 3, complete).
4. ~~Call-meeting/activity reports and every file in `features/call-meetings` and `features/activities`.~~ DONE (Wave 4, complete).
5. ~~Modular locale architecture (20→23 per-domain files).~~ DONE (Part I, complete).
6. ~~Tasks (`features/tasks`, `pages/tasks`).~~ DONE (Wave 6, complete) — except the separate duplicated Customer-drawer Tasks tab, flagged above as a follow-up.
7. ~~Products/Services (`pages/products`).~~ DONE (Wave 7, complete).
8. ~~Opportunities (`pages/opportunities`, `features/opportunities`) and Campaigns (`pages/campaigns`).~~ DONE (Wave 10, complete).
9. Outreach (`features/outreach-campaigns`/related pages — the existing `outreachCampaigns.js` module covers some of this already; not yet re-verified against current UI), communication (conversations/internal-chat), workflow engine, integrations, administration (teams/users/settings), app shell re-audit, Customer-drawer Tasks tab follow-up — NOT started.
10. Verify AR/EN RTL/LTR on desktop/mobile authenticated routes and non-route overlays. Until then the final gate is not met.

## Current checkpoint

After the full Wave 2 Customers pass, `check:i18n` reports 1,320/1,320 keys (PASS, up from 805/805 at session start). The advisory scan reports 2,674 Arabic-script candidate lines in 317 files (down from 3,301/343) and 276 conservative English candidates in 76 files (down from 321/79). These are candidate *lines*, not individual violations; every reduction reflects a reachable-UI fix in a specific file, verified against the scanner file-by-file rather than assumed from the aggregate delta. The scanner still exits zero and is not a translation compliance gate. Customers/Leads Center is now the first feature row FIXED for reachable UI (dead code and one deliberately-deferred customer-document direction choice excepted, both documented above); every other feature row remains NEEDS_REVIEW.
