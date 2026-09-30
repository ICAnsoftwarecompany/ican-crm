# ICAN CRM — Sales Domain

Leads, customers, statuses, assignment, teams, activities, deals, opportunities and proposals.
Rules and shared engines: [1-ARCHITECTURE.md](1-ARCHITECTURE.md). Other modules: [3-FEATURES.md](3-FEATURES.md).
Describes the **current code**; if code and this file disagree, the code wins — update this file in the same change.

Every module section uses: **Status · What it does · Key files · API · Used by · Known issues**. All endpoints go through `services/httpClient` (bearer token + `api_password` added automatically).

## Contents

- [Domain model](#domain-model)
- [Lead lifecycle](#lead-lifecycle)
- [Statuses, tags and pipeline](#statuses-tags-and-pipeline)
- [Leads page and lead assignment](#leads-page-and-lead-assignment)
- [Leads Center pages](#leads-center-pages)
- [Customer details drawer](#customer-details-drawer)
- [Bulk actions](#bulk-actions)
- [Customer activity timeline](#customer-activity-timeline)
- [Teams and users](#teams-and-users)
- [Activities, calls and meetings](#activities-calls-and-meetings)
- [Deals](#deals)
- [Opportunities](#opportunities)
- [Proposals](#proposals)
- [Sales dashboard](#sales-dashboard)
- [Sales domain known issues](#sales-domain-known-issues)

---

## Domain model

| Entity | Owner (API) | Shape notes (as used by the UI) |
|---|---|---|
| **Customer** | `features/customers` (`customersApi`) | The row the Leads Center lists. Nests a `lead` sub-object; the UI reads most person data from `customer.lead.*`. Soft delete + trash. |
| **Lead** | `features/leads` (`leadsApi`) | `customer.lead`: `id`, `name`, `phone`, `email`, `source`, `status_type_id`, `status`, `tag_id`/`tag`, `lead_type`, `linked_by`, `linked_type`, `interesteds[]`. All lead actions (status change, notes, follow-ups, tag) are sent with `lead_id`. |
| **Status** | `features/definitions` (`definitionsApi`) | Tenant-defined status definitions (`title`, `color`, `type`). Leads use statuses with `type: 'lead'`. Colors also exist as CSS tokens `--status-*` for the default set. |
| **Tag** | `features/definitions` | Tenant-defined tags; one tag per lead (`leadsApi.updateTag`). |
| **Interest** | `features/leads` (`interestedsApi`) | Product interest on a lead: `lead_id`, `product_id`, level/notes. Shown in the drawer's Interests tab. |
| **Activity** (call/meeting) | `features/meetings` API, `features/activities` domain | One backend resource `/api/tenant/meetings`, `type: 'call' \| 'meeting'`, linked to a lead/customer via `taskable_type` + `taskable_id`. |
| **Deal** | `features/deals` | A sales campaign/pipeline container with a `pipeline_template` (stages), team, products and **Deal Leads** (a lead placed on a stage). |
| **Opportunity** | `features/opportunities` | Detected sales signal about an existing customer/lead (Opportunity Center). Mock data only. |
| **Proposal** | `features/proposals` | Price proposal with versions, pricing options and option items; created from a template. |
| **Team** | `features/teams` | Sales team with members (users). |
| **User** | `features/users` | Tenant user; assignee for leads, activities, deals, tasks. |

```text
User ──member of──> Team
Customer ──has one──> Lead ──has──> Status, Tag, Interests[], Activities[] (calls/meetings), Logs[]
Lead ──placed in──> Deal (as Deal Lead, on a pipeline Stage)
Lead/Customer ──subject of──> Opportunity (signal) ──may become──> Proposal
Proposal ──versions──> Version ──options──> Option ──items──> Item (optionally a Product)
```

## Lead lifecycle

1. **Created** — `customersApi.createCustomers` (`NewCustomerDialog`), deal lead creation (`dealLeadsApi.create`), or backend sources (ad lead forms, integrations). The `source` badge shows the origin.
2. **Assigned** — backend assignment rules (`/api/tenant/lead-assignment/*`), manual distribution (`leadsApi.distributeManually`) or deal bulk assign (`dealLeadsApi.bulkAssign`). Assigned user appears as `linked_by` in the drawer header.
3. **Worked** — status changes and notes/follow-ups via `leadsApi.saveAction` (`action: 'create_activity'`, optional `new_status_id` + reason), calls/meetings (activities), tasks, conversations (WhatsApp/Messenger/Gmail), proposals.
4. **Progressed** — status moves through tenant-defined statuses (status board, drawer, bulk action); in deals, the lead moves between pipeline stages.
5. **Closed** — won/lost is represented by statuses (lead) or terminal stages (deal). Deal won/lost endpoints do not exist yet.
6. **Deleted / restored** — `customersApi.deleteCustomers` → trash → `restoreDeletedCustomers` or `forceDeleteCustomers`.

Every event is written to the lead log (`leadsApi.getLeadLog`) and rendered by the [customer activity timeline](#customer-activity-timeline).

## Statuses, tags and pipeline

**Status:** CURRENT

- **What it does:** tenant-defined lead statuses and tags; status board view; status change with optional reason.
- **Key files:** `features/definitions/api/definitionsApi.js`, `hooks/useDefinitions.js`; `pages/customers/pages/customization/` (`CustomerStatusesTab`, `CustomerTagsTab`, `StatusDefinitionDialog`); `pages/customers/pages/statusBoard/` (columns per status); `pages/customers/utils/customerStatus.js` (`extractLeadStatuses`, `filterCustomersByStatusId`); `pages/customers/components/CustomerDetailsDrawer/CustomerStatusChanger.jsx`.
- **API:** `GET /api/tenant/definitions/status`, `POST .../create/status`, `POST .../update/status/{id}`; `GET /api/tenant/definitions/tags`, `POST .../create/tags`, `POST .../update/tags/{id}` (FormData); tag assignment `POST /api/tenant/leads/update-tag`.
- **Used by:** Leads Center table + status tabs, status board (`/LeadsCenter/status-board`), customization (`/LeadsCenter/customization`, active tab stored as `customers-customization-active-tab`), drawer header, bulk status/tag actions, `/settings/definitions`.
- **Deal pipeline stages** are separate from lead statuses: they come from deal pipeline templates — see [Deals](#deals).
- **Known issues:** no drag-and-drop between status columns on the status board (it uses its own column UI, not `PipelineBoard`).

## Leads page and lead assignment

**Status:** PARTIAL

- **What it does:** `/leads` lists lead logs, saves lead actions and manages lead-assignment rules (create/update/list).
- **Key files:** `pages/leads/LeadsPage.jsx`; `features/leads/api/leadsApi.js`, `leadAssignmentApi.js`, `hooks/useLeads.js` (`useLeadLogs`, `useAssignmentRules`, `useLeadMutations`); `features/leads/workflow/leadWorkflowDefinition.js` (automation triggers/actions).
- **API:** `POST /api/tenant/leads/save/action`, `POST /api/tenant/leads/update-tag`, `GET /api/tenant/leads/logs`, `GET /api/tenant/leads/lead/log/{leadId}`, `POST /api/tenant/leads/manual/lead/distribution`; `POST /api/tenant/lead-assignment/create/rule`, `POST /api/tenant/lead-assignment/update/rule/{id}`, `GET /api/tenant/lead-assignment/rules`.
- **Used by:** `/leads`; `saveAction`/`updateTag` are used across the Leads Center, drawer and bulk actions.
- **Known issues:** `/LeadsCenter/assignments` is still a placeholder — the only assignment-rule UI is on `/leads`. No UI for manual distribution outside the API hook.

## Leads Center pages

**Status:** CURRENT (main table) · several sub-pages PLANNED (placeholders)

- **What it does:** the main customer/lead workspace at `/LeadsCenter` with its own layout and internal sidebar.
- **Key files:** `pages/customers/CustomersPage.jsx` (≈1.45k lines: table/pipeline switch, stats, filters, drawer wiring), `components/CustomersActivitySidePanel.jsx` (meetings/calls side panel), `utils/backendLocalDate.js`, `layout/CustomersLayout.jsx` (shared `SubSidebarLayout` + bulk-actions rail; updated 2026-10-01 00:25 (Africa/Cairo)), `constants/customerNavigation.js` (`getCustomersSidebarConfig`), `constants/customersLayoutConstants.js` (bulk-actions slot id/event), `components/CustomersTableColumns.jsx`, `components/customers-table/*`, `components/page-actions/*` (add, import, export, table settings, trash), `components/TableSettingsDrawer.jsx`, `components/StatusTaps/LeadStatusTabs.jsx`.
- **Routes:**

| Route | Page | Status |
|---|---|---|
| `/LeadsCenter` | All customers — **Table** (`DataTable`) or **Pipeline** (Kanban by lead status) view, stats, status tabs, bulk actions, drawer | CURRENT |
| `/LeadsCenter/status-board` | Columns per lead status | CURRENT |
| `/LeadsCenter/customization` | Statuses + tags tabs | CURRENT |
| `/LeadsCenter/teams` | Sales teams (`pages/SalesTeams/CustomerTeamsPage.jsx`, team + members drawers) | CURRENT |
| `/LeadsCenter/trash` | Deleted customers, restore / force delete | CURRENT |
| `/LeadsCenter/activities`, `/activities/meeting/:meetingId` | Activities page / meeting detail | CURRENT |
| `/LeadsCenter/proposals`, `/proposals/templates`, `/proposals/:proposalId/builder` | Proposals | CURRENT |
| `/LeadsCenter/new`, `/follow-up`, `/inactive`, `/segments`, `/assignments`, `/duplicates`, `/import-export`, `/settings` | `CustomerPlaceholderPage` | PLANNED |
| `/lead/:customerId`, `/leads/:customerId` | Full-page lead details (`pages/customers/pages/lead-details/`) using `CustomerDetailsContent mode="page"` + lead switcher | CURRENT |

- **API:** `GET /api/tenant/customers/data`, `GET .../info/{id}`, `POST .../create`, `POST .../update/{id}`, `POST .../delete`, `GET .../deleted/data`, `POST .../restore/deleted`, `POST .../force/delete`.
- **Realtime:** `useCustomersTableRealtime` on `tenant.{tenantId}.customers-table` updates `['customers','list']`, `customers.detail(id)` and `customers.deleted` caches directly.
- **Used by:** table row click opens the [drawer](#customer-details-drawer); columns show Messenger/Gmail/WhatsApp buttons from `features/conversations`.
- **Pipeline view:** a Table / Pipeline toggle in the page header switches `/LeadsCenter` between the `DataTable` and a board with one column per active lead status (plus a "No status" column only when some leads have none). Code: `features/customers/pipeline/` (`CustomersPipelineView`, `CustomerPipelineCard`, `CustomersViewModeToggle`, `useCustomersViewMode`, `useCustomerStatusMove`, `utils/customerPipeline.js` + tests), composed by `pages/customers/components/CustomersPipelineSection.jsx` (adds the page-owned bulk actions and `StatusChangeReasonDialog`). The board is the shared `shared/components/pipeline-board`.
  - Every active status is always a column (fixed 272px width, horizontal scroll when they don't fit; each column scrolls vertically on its own). The status tabs bar and the meetings/calls side panel are hidden in pipeline mode; the board has its own search (name / phone digits / email).
  - **Pipeline settings** (toolbar button → `PipelineCardSettingsDrawer`): choose and reorder the card fields (phone, source, lead ID, tag, latest follow-up, next activity, channels, email, assignee, company, customer code, lead type, created at, last action). The name is always shown. Persisted as `customers-pipeline-card-fields`.
  - Cards are compact: one line per field, long values (e.g. notes) are cut to 1–2 lines and shown in full on hover (`shared/components/ui/TruncatedText`).
  - Same actions as a table row: click = details drawer, Ctrl/Cmd+click = full lead page, card menu = add meeting / call / follow-up, Messenger/Gmail buttons, checkbox selection → the same `CustomersBulkActions` (status, tag, follow-up, messaging).
  - **Long press (≈250 ms, mouse or touch) then drag** a card to another column to change the lead status (`PipelineBoard dragMode="longPress"`, built on `@dnd-kit`; a short click still opens the card). This with the same `leadsApi.saveAction` payload as bulk/drawer status changes (`data.source: 'customers_pipeline'`). Statuses with `has_resone = 1` open the reason dialog first. The card moves optimistically in the `['customers','list']` cache and rolls back on error. Cards can't be dropped on "No status".
  - Not in the pipeline yet: the table's row alert colours (upcoming/overdue activity, new-message flash) and column customization.
- **Persisted UI:** `main-sidebar-collapsed`, `customers-sidebar-collapsed`, `customers-bulk-actions-pin-mode`, `customers-view-mode` (`table` \| `pipeline`) and `customers-pipeline-card-fields` (via the DataTable `useLocalStorage` helper), DataTable `datatable-*-{tableId}` keys.
- **Known issues:** eight placeholder sub-routes (table above); `CustomersPage.jsx` is oversized and route-owned; `customersApi` logs responses to the console.

## Customer details drawer

**Status:** CURRENT

- **What it does:** full customer/lead view in two modes — **drawer** (`CustomerDetailsDrawer` inside `AppDrawer`, opened from the Leads Center table) and **page** (`CustomerDetailsContent mode="page"` on `/lead/:customerId`, sidebar with header + quick actions + Home, main area with the other tabs; `home` redirects to `timeline`).
- **Key files:** `pages/customers/components/CustomerDetailsDrawer/`: `CustomerDetailsDrawer.jsx` (≈1.6k lines, `DRAWER_TABS`, header, tag editor), `CustomerStatusChanger.jsx`, `customerDetailsUtils.js`, `CustomerDetailsTabPrimitives.jsx`; `tabs/` (`HomeTab`, `TimeLineTap/` with Status/Calls/Meetings sub-tabs, `CustomerServiceTabSlot` (lazy Customer Service tab, see [4-CUSTOMER-SERVICE.md](4-CUSTOMER-SERVICE.md#integration-points-outside-the-area)), `TasksTab/`, `InterestsTab/`, `NotesTab`, `FilesTab`, `EmailsTab`, `CalendarTab`); `quick-actions/` (call, meeting, status, follow-up, interests, WhatsApp, Messenger, Email, SMS).
- **Data flow:** `useCustomerInfo(customer.id)` + `definitionsApi.getStatuses()` + `getTags()` → `detailedCustomer`, `leadStatuses`, `currentStatus`, `currentTag`. Any change calls `refreshCustomerDetails(payload)`, which refetches and notifies the parent via `onStatusChanged`.
- **Props:** `<CustomerDetailsDrawer customer open onClose onStatusChanged />`; `<CustomerDetailsContent customer enabled onStatusChanged showOpenPageButton mode="drawer|page" />`.
- **Calls & meetings:** come from `features/call-meetings` (`CallsActionTab`, `MeetingsActionTab`, `CallQuickAction`, `MeetingQuickAction`, schedule dialogs); quick actions open them via `onTimelineAction('call'|'meeting', { intent: 'schedule'|'history' })`.
- **Floating chats:** WhatsApp / Messenger / Mail / SMS chat windows from `features/conversations/components/floating-chat/` (see [3-FEATURES.md → Conversations](3-FEATURES.md#conversations)).
- **Extend:** new tab = component in `tabs/` + entry in `DRAWER_TABS` + branch in `ActiveTabContent`; new quick action = component in `quick-actions/` added to `CustomerQuickActions.jsx`. Tab and quick-action order are user-sortable (long press) and stored in `customer-details-drawer-tabs-order` / `customer-details-quick-actions-order`.
- **API:** customers info, definitions, `leadsApi.saveAction`/`updateTag`, `interestedsApi` (`POST /api/tenant/interesteds/save|edite|delete`), meetings, tasks.
- **Known issues:** Notes/Files/Emails/Calendar tabs are minimal; the Tasks tab is a separate mini-implementation (not the Tasks workspace) and not fully translated; drawer Mail/SMS chats are local stubs (no backend); oversized main file.

## Bulk actions

**Status:** CURRENT · social messaging PARTIAL

- **What it does:** toolbar shown above the Leads Center table when rows are selected: selected count, pin mode (inline / horizontal top / vertical rail, stored in `customers-bulk-actions-pin-mode`), change status (with reason dialog when required), change tag, add follow-up (single selection only), schedule call/meeting, and social messaging (Messenger / WhatsApp / Mail / SMS composer).
- **Key files:** `pages/customers/components/bulk-actions/` (`CustomersBulkActions.jsx`, `PinBulkActionsButton.jsx`, `SelectedCountBadge.jsx`, `selection-actions/` incl. `status/`, `follow-up/`, `ChangeTagBulkAction.jsx`, `social-messaging/`); follow-up dialog `components/follow-up-note/FollowUpNoteDialog.jsx` (draggable, shared everywhere a follow-up is added).
- **API:** `leadsApi.saveAction` (status change / follow-up payload `{ lead_id, action: 'create_activity', type: 'note-to-lead', title, description, note, data, activity_at, new_status_id?, new_status_title?, old_status_title? }`), `leadsApi.updateTag`, meetings create.
- **Used by:** `CustomersPage.jsx` via `DataTable` `selectionContextActions`.
- **Extend:** a new selection action = component in `selection-actions/` exported from its `index.js` and rendered by `CustomersBulkActions.jsx`.
- **Known issues:** social messaging only builds a draft payload (`{ channel, recipients, message, source: 'customers_bulk_actions', status: 'draft' }`) — no caller passes `onSendMessage`, so it shows an "API not connected" toast. A compatibility shim remains at `components/CustomerSocialMessagingPanel.jsx`.

## Customer activity timeline

**Status:** CURRENT

- **What it does:** normalized, grouped, filterable history of a lead (status changes, notes, interests, calls, meetings, emails, WhatsApp, tasks, assignments, proposals, deals, creation).
- **Key files:** `pages/customers/components/customers-table/CustomerActivityTimeline/` (`CustomerActivityTimeline.jsx`, `config/activityTypes.js`, `config/activitySources.js`, `utils/normalizeCustomerActivities.js`, `groupActivitiesByDate.js`, `getActivityRenderer.js`, `renderers/*`); container `LeadActivitiesDialog` in `customers-table/CustomerTableDetailsDialogs/CustomerTableDetailsDialogs.jsx` (portal, draggable, pinnable), next to `ProductDetailsDialog` and `SourceDetailsDialog`.
- **Normalized activity:** `{ id, logId, type, category, importance, title, description, date, user, oldStatus, newStatus, oldStatusId, newStatusId, responseTimeSeconds, source, action, noteText, products, data, raw: { log, activity } }`. Accepts logs with nested `activities[]` or flat activities.
- **API:** `GET /api/tenant/leads/lead/log/{leadId}`; falls back to `getCustomerLeadActivities(row)` when the API returns nothing.
- **Extend:** add the type in `activityTypes.js` → optional renderer in `renderers/` → route it in `getActivityRenderer.js` → extend normalization if new fields are needed.
- **Known issues:** date-group labels ("today"/"yesterday"), filter labels and source labels are hardcoded Arabic; product fallback label is `Product #id`; no virtualization for very long histories.

## Teams and users

**Status:** CURRENT

- **What it does:** sales teams and members; tenant users; online users and user activity panels.
- **Key files:** `features/teams/api/teamsApi.js`, `hooks/useTeams.js`; `features/users/api/usersApi.js`, `hooks/useUsers.js`, `components/ActiveUsersSidebarPanel.jsx`, `UserActivitySidebarPanel.jsx`; pages `pages/teams/`, `pages/users/`, `pages/customers/pages/SalesTeams/`, `/settings/users`.
- **API:** teams `POST /api/tenant/teams/create`, `POST .../update/{teamId}` (FormData), `GET .../get`, `POST .../attach-members/{teamId}`, `POST .../detach-members/{teamId}`; users `POST /api/tenant/users/create/`, `POST .../update/{id}/`, `GET .../get`, `GET /api/online/users`, `GET /api/user/history/{userId}`.
- **Used by:** `/teams`, `/users`, `/LeadsCenter/teams`, `/settings/users`, assignee selectors (activities, tasks, deals, workflow data sources).
- **Known issues:** Unverified: role/permission management UI — the backend does not yet expose `user.permissions`, so frontend permission checks are inert.

## Activities, calls and meetings

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — calls and meetings got their own pages in the Communication hub.

**Status:** CURRENT (transitional ownership across three folders)

- **Where users open them now:** main sidebar → **Communication** → **Calls** (`/calls`) and **Meetings** (`/meetings`), each with a shared sub-sidebar (view, create, reports, calendar, automation, customization, AI setup, settings). See [3-FEATURES.md → Communication hub](3-FEATURES.md#communication-hub). The Sales section no longer has an "Activities" item. `ActivitiesPage` gained `lockedType` (`'call' | 'meeting'`: fixed type, no type tabs, one create button, type not persisted) and `embedded`; `ActivityHeader`/`ActivityTabs` follow `lockedType`; `ScheduleActivityDialog` gained `presentation="inline"` for the create pages. Notification targets (`meeting.*`, `call_reminder`) point to `/meetings` and `/calls`.

- **What it does:** one operational module for calls and meetings across all leads/customers: list/table and calendar views, stats (today, scheduled, in progress, completed, overdue, cancelled), URL-synced filters, create/edit dialog, detail drawer (Overview, Preparation, Report, Notes, Files, Participants [meetings only], History), lifecycle actions and a finish-with-report flow with next actions.
- **Ownership:**
  - `features/meetings/api/meetingsApi.js` — the HTTP layer (`/api/tenant/meetings`), `hooks/useMeetings.js`.
  - `features/activities/` — the domain layer: `api/activitiesApi.js` (maps to `meetingsApi`, normalizes), hooks (`useActivityKeys`: `all`, `list`, `detail`, `reports`, `summary`), `constants/`, `utils/` (`activityOutcomes.js`, `activityNextActions.js`, status/date helpers), Zod `schemas/`, components (`ActivityTable` on `DataTable`, `ActivityCalendar`, `ActivityDrawer`, `ActivityForm`, `ActivityReport`, `ActivityStatus`, `ActivityFilters`, `ActivityStats`), `pages/ActivitiesPage.jsx`.
  - `features/call-meetings/` — reusable call/meeting UI for the customer drawer and elsewhere: `ScheduleActivityDialog` (+ `CallScheduleDialog`, `MeetingScheduleDialog`), `CallsActionTab`, `MeetingsActionTab`, filters, reminder banners, quick actions, `MeetingDataDrawer`, `PreMeetingReportDrawer`, `AfterMeetingReportDrawer` (template-based, sends `title: 'after-meeting report'`), `LiveMeetingIndicator` (header, shows `in_progress` meetings), `ScheduleDetails/scheduleDetailsUtils.js`. Import from `features/call-meetings/index.js`.
- **Lifecycle:** backend statuses `scheduled → in_progress → completed | cancelled`; frontend-derived `today`, `upcoming`, `overdue` (never sent). Actions: scheduled → start/edit/cancel; in progress → finish (report); completed → follow-up; any → view/delete.
- **Report & next action:** `ActivityReportDialog` validates and saves the report, optionally creates the next call/meeting, marks the activity completed, invalidates queries. Next actions (`none`, `call_again`, `schedule_meeting`, `create_task`, `send_proposal`, `send_email`) — only follow-up calls/meetings are wired.
- **Routes:** `/calls/*`, `/meetings/*` (Communication hub) · legacy `/activities`, `/activities/calendar` (still work) · `/activities/calls` → redirects to `/calls`, `/activities/meetings` → `/meetings` · `/LeadsCenter/activities`, `/LeadsCenter/activities/meeting/:meetingId` (tab kept in `?tab=`; back uses `location.state.from`, else `/LeadsCenter/activities`).
- **API (`/api/tenant/meetings`):** `POST` (create, FormData via `toMeetingFormData`: `users[]`, `attachments[]`, booleans as 1/0), `GET` (list), `GET/PUT/DELETE {id}`, `PATCH {id}/status`, `GET/POST {id}/reports`, `DELETE {id}/reports/{reportId}`, `GET reports/summary`, `POST {id}/notes`, `PUT/DELETE {id}/notes/{noteId}`, `POST {id}/attachments`, `DELETE {id}/attachments/{attachmentId}`, `POST {id}/participants`, `DELETE {id}/participants/{userId}`, `PATCH {id}/participants/{userId}/status`, `GET leads/{leadId}/calls-meetings`.
- **Used by:** activities pages, customer drawer timeline and quick actions, bulk actions (schedule), calendar (`activityEventAdapter`), header live-meeting indicator. Mutations also invalidate `meetings`, `customers` and `leads` roots.
- **Extend:** new outcome → `CALL_OUTCOMES`/`MEETING_OUTCOMES` in `utils/activityOutcomes.js`; new next action → `utils/activityNextActions.js` and wire creation in `ActivityReportDialog`; new schedule status → `scheduleDetailsUtils.js` + call/meeting filters.
- **Known issues:** three-folder ownership (`activities` / `call-meetings` / `meetings`) awaits consolidation with adapter tests; statistics computed client-side; ID inputs instead of searchable pickers in places; task/proposal/email next actions not wired; `ActivityCalendar` not on the shared calendar engine; no recurring activities.

## Deals

**Status:** PARTIAL

- **What it does:** Deals Hub (`/deals`, `DataTable` list + create form) and Deal Workspace (`/deals/:dealId`) with sections `overview`, `board`, `team`, `products`, `contracts`, `analytics` (`?tab=`), in `kanban` or `table` view mode (stored in `deal-workspace:view-mode`). The board uses `PipelineBoard` with stages from the deal's pipeline template; toolbar opens the shared calendar, a `WorkflowLauncher` (`module: 'deals'`) and `AgentChat` in an `AppDrawer`.
- **Key files:** `pages/deals/DealsHubPage.jsx`, `DealWorkspacePage.jsx`; `features/deals/api/` (`dealsApi`, `dealLeadsApi`, `dealResourcesApi`, `pipelineTemplatesApi`), `hooks/useDeals.js` (`useDeals`, `useDeal`, `useDealLeads`, `useDealResources`, `usePipelineTemplates`, `useDealMutations`), `utils/dealDisplay.js` (tested); locale `dealWorkspace.js`.
- **Stages resolution:** `deal.pipeline_template.stages` → `deal.pipelineTemplate.stages` → template matching `pipeline_template_id` → `deal.stages`, sorted by `order`. `normalizeLead` unifies lead data found in `lead`, `customer` or the item itself.
- **API:** deals `GET/POST /api/tenant/deals`, `GET/POST(update)/DELETE /api/tenant/deals/{id}`; deal leads `GET /api/tenant/deals/{dealId}/leads`, `POST .../leads/add-existing`, `POST .../leads/create`, `POST .../leads/bulk-assign`, `POST .../leads/{dealLeadId}/change-stage` (`{ stage_id }`), `POST .../leads/products/sync`, `GET .../leads/{dealLeadId}/productsc` (sic); resources `GET/POST .../{dealId}/team`, `DELETE .../team/{memberId}`, `GET/POST .../{dealId}/products`, `DELETE .../{dealId}/products/{productId}`; pipeline templates `GET/POST /api/pipeline-templates`, `GET/POST(update)/DELETE /api/pipeline-templates/{id}`. Create fields: `name, pipeline_template_id, type, status, start_date, end_date, target_revenue, target_leads`.
- **Used by:** sidebar Sales → Deals.
- **Known issues:** no won/lost endpoints — terminal-stage drops only raise `onTerminalStageDrop`; contracts and analytics sections show "not available" (no API); `productsc` path typo kept literally until the backend fixes it; `AgentChat` has no `onAsk` backend so it never answers; calendar is not filtered by deal.

## Opportunities

**Status:** PARTIAL (UI complete, mock data only)

- **What it does:** Opportunity Center (`/opportunities`) surfaces detected sales signals (cross-sell, upsell, renewal, reactivation, buying intent, campaign engagement, referral…). Tabs: Overview (stats, revenue, top 5, source distribution), Inbox (buckets: High Potential, Needs Review, Needs Attention, AI Suggested, System Detected, Campaign Generated, Watching) and Table (`DataTable`). One `OpportunityDrawer` for every entry point with Dismiss / Watch / Qualify / Activate / Assign — actions update the React Query cache immediately. **Score** (fit/intent/engagement/timing) and **AI Confidence** (only for AI-sourced signals) are kept separate.
- **Key files:** `features/opportunities/api/opportunitiesApi.js` (mock-backed; the only file to swap), `mock/opportunitiesMockData.js` (10 fixtures, the reference response shape), `hooks/useOpportunities.js`, `store/opportunityDrawerStore.js`, `constants/opportunityTypes.js`, `utils/opportunityFormatters.js`, `workflow/opportunityWorkflowDefinition.js`; `pages/opportunities/`.
- **API:** none yet. Suggested backend contract: `GET /api/tenant/opportunities` (filters `status, type, priority, source, search`, pagination), `GET .../{id}` (with `signals`, `timeline`), `PATCH .../{id}/qualify|activate|watch|dismiss`, `POST .../{id}/assign`.
- **Used by:** sidebar Growth → Opportunity Center; workflow engine (opportunity triggers/actions).
- **Known issues:** no detection engine, scoring service, expiry automation or realtime; Proposal/Task links from the drawer not built; no bulk actions. **Not** a qualified sales-pipeline "Opportunity" entity — deals cover pipeline work today.

## Proposals

**Status:** CURRENT (route-owned, transitional)

- **What it does:** list (`/LeadsCenter/proposals`), creation wizard (customer, template, owner, currency, expiry → creates the proposal and its first version), visual builder (`/LeadsCenter/proposals/:proposalId/builder`: left sections/blocks library, center canvas, right properties/pricing/versions), shared renderer for canvas and preview, and templates page (`/LeadsCenter/proposals/templates`: activate/deactivate/duplicate).
- **Key files:** `features/proposals/api/proposalsApi.js`, `proposalTemplatesApi.js`, `hooks/useProposals.js` (`useProposalMutations`), `useProposalTemplates.js`; `pages/customers/pages/proposals/` (`CustomerProposalsPage`, `CustomerProposalBuilderPage`, `CustomerProposalTemplatesPage`, `components/ProposalBuilder*`, `ProposalCanvas`, `ProposalPropertiesPanel`, `ProposalPricingPanel`, `ProposalVersionsPanel`, `ProposalWizard`, `renderer/ProposalRenderer.jsx`, `constants/proposalBlockTypes.js`, `utils/proposalPayloads.js`).
- **Content model** (`version.content`): `{ schema_version: 1, title, settings, design, customer, sections: [{ id, title, description, is_visible, blocks: [{ id, type, name, data, styles, is_visible }] }] }`. Block types — basic: cover, heading, text, image, button, divider, spacer; business: customer_info, company_info, products, pricing; proposal: terms, signature, page_break, video, custom, link. Reordering uses `@dnd-kit`; autosave debounced 900 ms to the current version, plus "save now".
- **API:** proposals `/api/tenant/proposals`: `GET` list, `GET show/{id}`, `POST create`, `PUT update/{id}`, `DELETE delete/{id}`; versions `POST create/version/{id}`, `GET version/{id}`, `GET|PUT|DELETE {id}/version/{versionId}`, `POST {id}/current/{versionId}`; options `GET|POST {id}/options`, `PUT|DELETE {id}/options/{optionId}`, `POST {id}/options/{optionId}/set-recommended`, reorder; items `GET|POST {id}/options/{optionId}/items`, `PUT|DELETE .../items/{itemId}`, reorder. Templates `/api/tenant/proposal/template`: `GET` list, `GET show/{id}`, `POST save`, `PUT update/{id}`, `DELETE delete/{id}`, `POST duplicate|activate|deactivate/{id}`, versions (`POST {id}/versions`, `PUT versions/{vid}/builder`, `POST versions/{vid}/current|duplicate`), sections (`POST versions/{vid}/sections`, reorder, `PUT|DELETE sections/{sid}`, `POST sections/{sid}/toggle-visibility`), blocks (`POST sections/{sid}/blocks`, reorder, `PUT|DELETE blocks/{bid}`, `POST blocks/{bid}/toggle-visibility`).
- **Used by:** sidebar Sales → Proposals; activity next action `send_proposal` (not wired).
- **Extend:** new block = type in `proposalBlockTypes.js` → default in `createDefaultBlock` → render in `ProposalRenderer` → fields in `ProposalPropertiesPanel`. New mutation = `proposalsApi` → `useProposalMutations` → invalidate keys. No API logic in components; no JSON editors for end users.
- **Known issues:** create payload has no explicit `customer_id` — customer data is stored in `metadata`; if the server returns no id after create, the builder cannot open; renderer root is intentionally `dir="rtl"`; not yet built: visual template builder, cross-section block drag, A4/mobile preview modes, share link, PDF export, e-signature, comments, permissions; code still lives under `pages/customers`.

## Sales dashboard

**Status:** CURRENT

- **What it does:** the home dashboard (`/`) for the signed-in sales user.
- **Key files:** `pages/dashboard/`, `features/analytics/api/salesDashboardApi.js`, `hooks/useSalesDashboard.js`; locale `dashboard.js`.
- **API:** `GET /api/tenant/sales/dashboard/my-leads`, `GET /api/tenant/sales/dashboard/my-teams`.
- **Known issues:** Unverified: dashboard scope beyond "my leads / my teams" — no manager-level or cross-team analytics endpoints exist.

## Sales domain known issues

- **P0 — Leads vs Customers model is mixed (architectural decision required):** separate `features/leads` and `features/customers` APIs, while the customer record nests `lead` and most UI reads `customer.lead.*`. Decide with the backend before new domains (e.g. Customer Service tickets) attach to "the customer".
- Large route-owned implementations under `pages/customers` (`CustomersPage.jsx`, drawer, proposals) should migrate into features incrementally, with tests first.
- Customer drawer Tasks tab duplicates the Tasks domain; the eight Leads Center placeholder routes need real pages or removal from the internal sidebar.
- Remaining hardcoded Arabic copy in the activity timeline, `DataTable` operator labels and some drawer parts; visual RTL/LTR and dark-mode QA not verified on authenticated routes.
