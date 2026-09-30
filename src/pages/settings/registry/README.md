# pages/settings/registry — settings sections registry

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — folder created.

`settingsSections.jsx` is the **single source of every settings section**. Two places render from it:

1. The app-wide settings under `/settings/*` (its sub-sidebar config is `../constants/settingsNavigation.js`).
2. Any module's own settings page (shared `ModuleSettingsPage`), which shows only the section ids that module lists —
   e.g. `/calls/settings` shows `['communication.calls', 'users']`.

| Export | Use |
|---|---|
| `getSettingsSections(ids, t)` | `[{ id, label, description, element }]` in the given order; unknown ids skipped. Pass to `<ModuleSettingsPage sections>`. |
| `SettingsSectionOutlet({ sectionId })` | Renders one section (used by `/settings/communication/:moduleId`). |
| `SETTINGS_SECTION_IDS` | All ids. |

Current ids: `definitions`, `users`, `integrations`, `appearance`, `communication.conversations`,
`communication.calls`, `communication.meetings`, `communication.team-chat`.

**Add a section:** add an entry to `SECTIONS`, add `settings.sections.<id>.label/description` in ar + en (or reuse a
module title key as the communication sections do), then either list its id in a module (`settingsSectionIds`) or add
a `/settings/...` route + sub-sidebar item.

Related: `../pages/communication/` holds `CommunicationSettingsSection` (planned settings list per communication module —
no API yet) and `CommunicationSettingsPage` (`/settings/communication/:moduleId`).
