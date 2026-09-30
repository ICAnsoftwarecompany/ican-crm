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

## Template versioning (F6)

Settings → General → **Template version** (`/service/settings/template-version`, `TemplateVersionsPanel`).

| API | Role |
|---|---|
| `GET /api/tenant/settings/templates/installation` | Installed vs latest version, the version list with notes, `pending`/`conflicts` counts, and upgrade history. |
| `POST …/installation/upgrade { dry_run: true }` | Diff: each change is `pending` (safe to apply), `conflict` (the tenant edited that item), or `already` (already matches). |
| `POST …/installation/upgrade { choices: { <changeId>: 'take' \| 'keep' } }` | Applies the upgrade. Defaults: take every `pending` change and keep the tenant's own value on a `conflict`. Returns `applied`/`skipped` and writes a history entry. `409 TEMPLATE_UP_TO_DATE` when already on the latest version. |

An upgrade never deletes: "removed" items are deactivated. The mock diff (v1→v2) lives in
`mocks/state/templateUpgrades.js`.
