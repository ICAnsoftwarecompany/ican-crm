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
