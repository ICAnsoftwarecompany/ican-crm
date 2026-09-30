# features/communication — Communication hub (التواصل والتعاون)

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — folder created.

**Status:** PARTIAL — navigation, layouts and real pages for view / create / reports (calls, meetings) / calendar /
automation / AI setup are live; customization and module settings are planned content (no backend API yet).

## What it is

One main-sidebar section, **Communication** (`nav.sections.communication`), grouping the four modules that serve
**both** Sales and the Customer Hub:

| Module | Route | Main view (index) | Owner of the business logic |
|---|---|---|---|
| Conversations | `/conversations` | `pages/conversations/ConversationsPage` (unchanged URL) | `features/conversations` |
| Calls | `/calls` (new) | `ActivitiesPage lockedType="call"` | `features/activities` + `features/call-meetings` |
| Meetings (customer + internal) | `/meetings` (new) | `ActivitiesPage lockedType="meeting"` | `features/activities` + `features/call-meetings` |
| Team chat | `/team-chat` (unchanged URL) | `pages/chat/InternalChatPage` | `features/internal-chat` |

This folder owns **no API**. It is the hub's configuration and the module-scoped compositions of shared engines.
Calls and meetings used to be one "Activities" item under Sales; `/activities` and `/activities/calendar` still work,
`/activities/calls` and `/activities/meetings` redirect to `/calls` and `/meetings`.

## Sub-sidebar pages (same for every module)

Built with the shared [sub-sidebar](../../shared/components/sub-sidebar/README.md). Order and grouping in
`navigation/communicationNavigation.js`:

| Group | Page | Path | Calls / Meetings | Conversations / Team chat |
|---|---|---|---|---|
| Work | View | `/<module>` | Activities list locked to the type | existing inbox page (full-bleed) |
| Work | Create | `/<module>/create` | `ScheduleActivityDialog presentation="inline"` | planned (`ModulePlaceholderPage`) |
| Insights | Reports | `/<module>/reports` | `ActivityReports` (client-side aggregation) | planned |
| Insights | Calendar | `/<module>/calendar` | shared `Calendar` engine, module's source only | shared `Calendar`, no source yet + notice |
| Setup | Automation | `/<module>/automation` | shared `WorkflowBuilder` with `workflowContext` | same |
| Setup | Customization | `/<module>/customization` | planned list | planned list |
| Setup | AI setup | `/<module>/ai` | shared `AiSetupPage` (browser draft) | same |
| Footer | Settings | `/<module>/settings` | shared `ModuleSettingsPage` with sections from the settings registry | same |

The same module settings sections also appear in the app-wide Settings under **Settings → Communication →
`/settings/communication/:moduleId`** (single source: `pages/settings/registry/settingsSections.jsx`).

## Files

| Path | Owns |
|---|---|
| `constants/communicationModules.js` | **The registry.** Per module: `id`, `basePath`, `icon`, `calendarSourceIds`, `workflowContext`, `settingsSectionIds`, `aiCapabilities`, `plannedCustomization`, `fullBleedIndex`. `COMMUNICATION_PAGES` lists the sub-pages. |
| `navigation/communicationNavigation.js` | `getCommunicationSidebarConfig(moduleId, t)` → `SubSidebarLayout` config. Tested. |
| `components/CommunicationModuleLayout.jsx` | Route shell: `SubSidebarLayout` + full-bleed index for chat inboxes. |
| `components/CommunicationCalendar.jsx` | Module-scoped view of the shared Calendar (uses `features/calendar` sources, preview drawer, create dialog). |
| `components/CommunicationAutomation.jsx` | Embedded `WorkflowBuilder` in the module's context. |
| `components/ActivityReports.jsx` + `utils/activityReport.js` | Calls/meetings reports: status stats, by-assignee table, by-priority counts. Tested. |
| `index.js` | Public API. |

Route pages: [`pages/communication/`](../../pages/communication/README.md). Strings: `communication.*` in
`src/locales/{ar,en}/communication.js`.

## Add a fifth module (e.g. Email or SMS)

1. Add an entry to `COMMUNICATION_MODULES` (+ its `communication.modules.<id>.*` strings in ar/en — copy an existing
   block).
2. Add `buildModuleRoute('<id>', '<path>')` and an index element in `pages/communication/communicationRoutes.jsx`.
3. Add a nav item to the `communication` section in `app/navigation/navigation.config.js` (+ `nav.*` keys).
4. Its settings section appears automatically in `/settings` (registry maps `COMMUNICATION_MODULES`).

## Known gaps

- **Customization and module settings:** no backend API — pages list the planned content with a warning notice.
- **Reports:** computed in the browser from the latest 200 records; switch to `GET /api/tenant/meetings/reports/summary`
  once its response shape is confirmed.
- **Calendar:** conversations and team chat have no dated source yet.
- **Automation:** calls/meetings/conversations/team-chat have no registered workflow definitions yet
  (`features/workflow-engine/config/registerBuiltinModules.js`), so the builder offers cross-module triggers/actions;
  the engine itself still saves to localStorage (see Workflow engine docs).
- **AI setup:** per-browser draft until `features/ai` exposes an API (see `shared/components/ai-setup/README.md`).
- **Create for conversations / team chat:** `internalChatApi.createConversation` exists but its payload is unconfirmed;
  starting a customer conversation needs a backend contract.
- **Meeting types:** internal vs customer meetings are not a separate field yet (see the meetings settings plan).
