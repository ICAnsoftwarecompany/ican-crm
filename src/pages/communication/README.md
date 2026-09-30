# pages/communication — Communication hub routes

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — folder created.

Thin route composition for the Communication hub. Business logic and configuration live in
[`features/communication`](../../features/communication/README.md).

| File | Owns |
|---|---|
| `communicationRoutes.jsx` | `communicationRoutes` — the four module route trees (`/conversations`, `/calls`, `/meetings`, `/team-chat`), each `CommunicationModuleLayout` + 8 child pages. Spread into `MainLayout` children in `app/router/index.jsx`. Paths must match `COMMUNICATION_MODULES[].basePath`. |
| `CommunicationPages.jsx` | The shared sub-pages, each taking `moduleId`: `CommunicationCreatePage`, `CommunicationReportsPage`, `CommunicationCalendarPage`, `CommunicationAutomationPage`, `CommunicationCustomizationPage`, `CommunicationAiPage`, `CommunicationModuleSettingsPage`. |

Index (view) pages reuse existing pages: `ConversationsPage`, `InternalChatPage`, and `ActivitiesPage` with
`lockedType="call" | "meeting"` and `embedded`.

`CommunicationModuleSettingsPage` imports `getSettingsSections` from `pages/settings/registry` — the only allowed
page→page dependency here, because the settings registry is the single source of settings sections.
