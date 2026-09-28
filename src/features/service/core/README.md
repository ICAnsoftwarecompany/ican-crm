# features/service/core

Foundation shared by every Service sub-module. Nothing here knows about a specific industry.

| Path | Exports | Notes |
|---|---|---|
| `api/serviceHttp.js` | `createServiceApi(moduleKey)`, `isModuleMocked`, `withServiceTransport` | Wraps the shared `httpClient`; swaps only the Axios adapter when the module is mocked (lazy-loaded mock chunk). |
| `api/endpoints.js` | `TENANT_API`, `SERVICE_API`, `serviceEndpoints` | Paths copied from the backend contract (spec §51). |
| `capabilities/capabilitiesApi.js` | `getServiceCapabilities()` | `GET /api/tenant/me/capabilities`. |
| `capabilities/useServiceCapabilities.js` | `useServiceCapabilities()`, `useServiceTerminology()` | Manifest + `hasFeature()`; `term(entity, form)` for tenant naming. |
| `capabilities/capabilities.utils.js` | `normalizeManifest`, `isFeatureEnabled`, `resolveTerm` | Pure, tested. |
| `constants/serviceModules.js` | `SERVICE_PHASES`, `SERVICE_MODULES`, `CURRENT_SERVICE_PHASE`, helpers | Phase registry + `backend: 'mock' \| 'live'` per module. **Update when a phase or module changes.** |
| `constants/serviceCatalog.js` | `SERVICE_MODEL_CODES`, `SERVICE_FEATURE_KEYS`, `SERVICE_TERM_ENTITIES` | Label keys only; logic never branches on them. |
| `constants/queryKeys.js` | `serviceKeys` | Every Service query key sits under `['service']`. |
| `components/ServiceMockBanner.jsx` | — | Shows demo-data state and the industry template switcher. |
| `components/CapabilitiesOverview.jsx` | — | Models, features, terminology of the tenant. |
| `components/ServiceRoadmap.jsx` | — | Live phase board from `serviceModules.js`. |

## Query keys

- `serviceKeys.capabilities()` → `['service', 'capabilities']`
- Add sub-module keys as `serviceKeys.<module>…` so `invalidateQueries({ queryKey: serviceKeys.all })`
  refreshes the whole area (used after switching the mock template).

## Tests

`api/serviceHttp.test.js`, `capabilities/capabilities.utils.test.js`.
