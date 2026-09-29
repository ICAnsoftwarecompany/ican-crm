# features/service/mocks

Demo backend for the Service area. Loaded **lazily** (only when a module is mocked), so it never
weighs on the main bundle. Remove a module's mocks only after it has run `live` for a release.

| File | Role |
|---|---|
| `mockAdapter.js` | Axios adapter: matches the route, waits ~250 ms, returns `{ data, status }` or rejects with an `AxiosError` carrying the backend error body. |
| `router.js` | `findRoute(routes, method, url)` with `:param` segments; strips origin and query string. |
| `errors.js` | `MockHttpError(status, code, message, errors)` + `notFound()`. Body = backend unified error shape. |
| `db.js` | In-memory state per industry template. `registerSeed(name, seed)`, `getCollection(name)`, `getMockManifest()`, `setActiveMockTemplate(key)`. |
| `templates/index.js` | Industry templates: `devices`, `tourism`, `school`, `shipping` (models + terminology). |
| `templates/modelFeatures.js` | Models → features map (mirror of spec §9.4). |
| `handlers/index.js` | `mockRoutes` — one line per module. |
| `handlers/capabilitiesHandlers.js` | `GET /api/tenant/me/capabilities`. |
| `handlers/casesHandlers.js` | Cases: setup, summary, list (views), CRUD, from-conversation, transition (pipeline + required fields + version), assign, activities, reply, notes, customer lookup. Unknown real customer ids are adopted as placeholders (`#<id>`). |
| `handlers/myWorkHandlers.js` | `GET /api/tenant/my-work` from mock cases assigned to the signed-in user + two demo tasks. |
| `handlers/contactsHandlers.js` | Customer contacts, contacts setup (roles, relation types). |
| `seeds/` | Deterministic seeds per template: `caseSetupSeed` (types, pipeline, queues, agents, resolution codes), `casesSeed` (customers, cases, activities), `contactsSeed`; `seedUtils` (seeded random, current user). |
| `utils.js` | `paginate` (Laravel meta), `matchesSearch`, `nowIso`. |

## Writing handlers

```js
// handlers/casesHandlers.js
import { SERVICE_API } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'

registerSeed('cases', (manifest) => buildCases(manifest)) // must work for EVERY template

export const casesHandlers = [
  { method: 'GET', path: `${SERVICE_API}/cases`, handler: ({ query }) => paginate(getCollection('cases'), query) },
  { method: 'GET', path: `${SERVICE_API}/cases/:caseId`, handler: ({ params }) => {
      const found = getCollection('cases').find((item) => item.id === params.caseId)
      if (!found) throw notFound('Case')
      return { data: found }
  } },
]
```

- Return the **same envelope** the backend returns (`{ data, meta }`); use `{ status, body }` for 201/204.
- Simulate real failures too: version conflicts (409), forbidden transitions, disabled features.
- Demo text inside seeds is allowed (this folder is excluded from `check:service`), but keep it neutral
  and in both languages when it is user-facing.

## Tests

`router.test.js`, `mockAdapter.test.js`, `db.test.js`, `handlers/casesHandlers.test.js`, `handlers/contactsHandlers.test.js`.
