# pages/settings/pages/communication — Communication settings

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — folder created.

| File | Route / use |
|---|---|
| `CommunicationSettingsSection.jsx` | The settings section of one Communication hub module. No settings API exists yet, so it shows a warning and the planned settings (`communication.modules.<id>.settingsItems`). Registered in `../../registry/settingsSections.jsx` as `communication.<moduleId>`. |
| `CommunicationSettingsPage.jsx` | `/settings/communication/:moduleId` — header + the section above. Unknown module ids redirect to `/settings`. |

The same section is shown on the module's own page (`/calls/settings`, …) through the shared `ModuleSettingsPage`.
When a backend API for a module's settings exists, replace the planned list inside `CommunicationSettingsSection`
(or register a dedicated section component) — both places update together.
