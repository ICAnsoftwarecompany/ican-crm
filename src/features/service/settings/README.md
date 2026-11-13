# features/service/settings — Operations settings (F2)

Tenant configuration for the Customer Hub, at `/service/settings/:section`. Every screen is the same
generic list + dialog driven by a **resource definition**, so a new settings screen is data, not a
new page.

| Path | Role |
|---|---|
| `api/settingsApi.js` | `createResourceApi(endpoint)` (list/create/update/remove), `useResourceList`, `useResourceMutations` (invalidates `serviceKeys.settings(key)` + `resource.invalidates`). |
| `resources/operationsResources.js` | Definitions: case types, queues, SLA policies, business calendars, escalation rules. |
| `resources/index.js` | `SETTINGS_GROUPS` (internal nav), `getSettingsResource(keyOrSlug)`, `getSettingsSlug(key)`. |
| `resources/resourceHelpers.js` | Option builders (`labelOptions`, `priorityOptions`, `agentOptions`…), `formatMinutes`, `listText`. |
| `hooks/useSettingsContext.js` | Loads the resource list + its `dependsOn` lists + case setup; passed to options/summary functions as `ctx`. |
| `components/SettingsWorkspace.jsx` | Internal nav + selected panel. Page passes `basePath`. |
| `components/ResourceSettingsPanel.jsx` | List with summary lines, create/edit/delete (409 `RESOURCE_IN_USE` shown as a toast). |
| `components/ResourceFormDialog.jsx` | FormDialog built from `resource.fields`; fields with the same `row` sit side by side; 422 field errors mapped to `service.settings.validation.<code>`. |
| `components/fields/` | `ResourceField` (text, localized `{ar,en}`, select, checkboxes, switch, number, duration, custom) and composite fields (working hours, holidays, escalation steps). |

Resource definition:

```js
{ key, endpoint, icon, i18nKey,          // i18nKey → .title / .one / .description
  titleField: 'label',                   // localized field shown as the row title
  emptyValue: () => ({ ... }),           // new-item defaults
  fields: [{ name, type, labelKey, hintKey?, options?(ctx), row?, component? }],
  summary: (item, ctx) => string,        // second line in the list
  dependsOn: ['queues'],                 // other lists needed for options
  invalidates: [serviceKeys.caseSetup()] }
```

**Add a settings screen:** add the endpoint under `serviceEndpoints.settings`, a mock `crudHandlers`
entry in `mocks/handlers/settingsHandlers.js`, a definition, list it in `SETTINGS_GROUPS` (+ a slug in
`SECTION_SLUGS`), and `service.settings.resources.<key>.{title,one,description}` in both locales.

Rules: tenant labels are `{ ar, en }` objects (never passed through `t()`); deleting something in use
must fail on the server with 409 `RESOURCE_IN_USE` — the UI suggests deactivating instead.
Authorization is the backend's job; the nav item is not protection.


## Shared assignment settings (2026-11-13)

`/service/settings/assignment` uses `features/service/assignment` for live GET requests: assignment rules, distribution settings and audit logs. Its API adapter also exposes create/update/delete, customer owners and manual assignment for later UI integration. This panel is intentionally read-only until backend response shapes and permission rules are verified. Unlike generic mock CRUD settings, the supplied assignment rule update uses POST, not PATCH. Arabic/English copy and theme tokens are included.


## First page: Customer Hub settings health (2026-11-13)

The default `/service/settings` now redirects to `/service/settings/health`. The first navigation item shows live, verifiable settings-list completion with direct links to missing configurations. See `health/README.md` for the exact denominator, unknown states and limitations. This is not a fabricated tenant-wide readiness score.


## Settings sub-sidebar scroll (2026-11-13)

The Customer Hub Operations Settings sidebar is sticky on desktop (below the app header), with a viewport-bounded height. Its shared `SubSidebarNav` already owns `overflow-y-auto` and `overscroll-contain`, so only the navigation list scrolls inside the sidebar, independently from the settings content. On narrow viewports, the sidebar has a capped height and internal scroll without desktop sticky behavior. The existing shared sidebar components, routes, translations, and theme tokens are unchanged.


## Independent settings scrolling (2026-11-13)

The settings workspace now uses a viewport-bounded desktop grid (`100dvh - 9rem`) with overflow hidden at the workspace boundary. The shared `SubSidebarNav` scrolls inside the fixed-height framed sidebar; the right settings panel has its own independent `overflow-y-auto` region. On mobile the sidebar is capped at 45vh and scrolls internally, while the main content follows normal page flow. This supersedes the prior sticky-only attempt, which did not isolate scrolling. The shared sub-sidebar component is not changed.


## Overview scoring by live API types (2026-11-13)

The overview includes live assignment-rules and distribution-settings APIs. Each has its own percentage based on active records per discovered `entity_type`; new returned types expand the denominator automatically. Generic list-backed settings count one requirement each until a verified subtype contract is available. The overall percentage is weighted by verified requirements, not by settings cards. Unknown API responses are excluded and disclosed. **Configured-record endpoints do not enumerate unconfigured required types**; the UI explicitly warns that missing types cannot be detected until an authoritative types endpoint exists. See `health/README.md` for the scoring contract and examples.
