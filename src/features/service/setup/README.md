# features/service/setup — Setup wizard (F3)

Spec §47.2. Settings → General → Setup wizard (`/service/settings/setup`). Steps: industry template →
business models (A–H) → terminology → dry-run review → apply.

| Path | Role |
|---|---|
| `api/setupApi.js` | `GET /settings/templates` (+ `meta.active`), `POST /settings/templates/{key}/apply { models, terminology, dry_run }`. Apply invalidates every `service` query. |
| `components/SetupWizardPanel.jsx` | The wizard (settings custom section). |

Templates only **seed configuration** (case types, queues, record types, item types, SLA…), idempotently —
existing data is kept and everything stays editable. Models decide features (spec §9.4); terminology maps
entities to term keys. In mock mode apply reseeds the demo data for the chosen template and overrides the
manifest (models/terminology) until reload.
