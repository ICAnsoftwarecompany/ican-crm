# Customer Hub settings health

Updated: 2026-11-13 01:25 (Africa/Cairo).

`SettingsHealthPanel` is the first Operations Settings page at `/service/settings/health`. `settingsHealth.js` defines the auditable checks and pure evaluator.

**Metric definition:** completed verifiable resource lists / successfully verified resource lists × 100. A list is configured when it contains at least one active record. Unavailable, malformed and failed responses are `unknown`, excluded from the denominator and clearly disclosed. The coverage counter shows how many checks were verified. A 100% score does not certify system readiness: presence of one item does not validate business configuration, dependencies, tenant permissions or backend enforcement. Settings without a supported list API are not counted.

Uses existing `createResourceApi` and React Query keys; no new backend endpoints, mock data or credentials. Links open the existing resource screens. Add stronger per-resource validation rules only with verified backend contracts. Arabic/English translations and theme variables required.
