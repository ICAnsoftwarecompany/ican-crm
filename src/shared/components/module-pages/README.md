# shared/components/module-pages — page shells for module sub-pages

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — folder created.

**Status:** CURRENT · **Public API:** `index.js` · **Tests:** `moduleSettingsUtils.test.js`

Domain-agnostic shells that make every module's secondary pages (create, reports, customization, settings, …) look the
same inside a [sub-sidebar](../sub-sidebar/README.md) layout. No imports from `features/`.

| Export | What it is |
|---|---|
| `ModulePageHeader` | Icon + title + description + actions row at the top of a module page. |
| `ModuleNotice` | One-line `info` / `warning` banner ("not connected to the backend yet", "saved in this browser only"). |
| `ModulePlaceholderPage` | A page whose content is not built or not connected yet. Shows a warning notice and the **planned** items (translated list) — never fake data. Replace it with the real page when the API exists. |
| `ModuleSettingsPage` | A module's own "Settings" page that renders **selected sections of the app-wide settings**. It owns no settings UI: callers pass `sections` taken from `pages/settings/registry/settingsSections.jsx` (`getSettingsSections(ids, t)`), so each section is identical here and under `/settings`. Tabs when there is more than one section; the active tab is kept in `?section=`. |
| `resolveActiveSectionId` | Pure helper used by `ModuleSettingsPage`. |

## Example — a module settings page

```jsx
<ModuleSettingsPage
  title={t('communication.pages.settings')}
  description={t('communication.modules.calls.settingsDescription')}
  sections={getSettingsSections(['communication.calls', 'users'], t)}
  fullSettingsPath="/settings"
/>
```

## Strings

`modulePages.*` in `src/locales/{ar,en}/modulePages.js`.
