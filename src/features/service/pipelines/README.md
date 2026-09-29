# features/service/pipelines — Pipeline editor (F3)

Spec §11. One engine for request (case) and service-record pipelines; contracts/components can reuse it.
Edited in Settings → Catalog → Pipelines (`/service/settings/pipelines`) as a settings resource
(`settings/resources/catalogResources.js → pipelinesResource`).

| Path | Role |
|---|---|
| `utils/pipelineEditing.js` | Pure helpers: add/move/remove status (drops its transitions), single initial, toggle transition, client problems (no initial, duplicate key, unreachable). Tested. |
| `components/StatusesField.jsx` | Status rows: label ar/en, key, category, initial, final, pauses SLA (case pipelines). |
| `components/TransitionsField.jsx` | From × to matrix; transitions with `required_fields` are kept and marked `*`. |

Contract: `CRUD /pipelines` — `{ id, entity: case|record, key, label, version, version_id, statuses: [{ id, key,
label, category, is_initial, is_terminal, sla_behavior? }], transitions: [{ from, to, required_fields[] }] }`.
- New statuses are sent with a temporary id `tmp-*`; the server assigns ids and remaps transitions.
- Every save = new version (`version_id`); running cases/records keep their `pipeline_version_id`.
- Removing a status still used → 409 `PIPELINE_STATUS_IN_USE`. Exactly one initial status (422 `initial`).
- The **category** drives the UI (colors, board columns, open/closed); the **key** is for integrations/views.
- Case types and record types point to a pipeline with `pipeline_id`.
