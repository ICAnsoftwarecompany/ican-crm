# features/service/records — Service records & batches (F3)

Spec §33. A **service record** is the customer-facing service instance (booking, shipment, enrollment,
project, service contract…) — not a case, task, work order or asset. Everything a screen shows comes from
the **record type configuration** (`/service/record-types`): pipeline, participant roles, component types,
entry types, batches, field schema. No industry branching.

Lives in the **Services hub** (one sidebar item, tabs from `core/components/ServicesHubNav.jsx`):
`/service/records/:recordType`, `/service/records/:recordType/:recordId`, `/service/batches/:recordType/:batchId?`.

| Path | Role |
|---|---|
| `api/recordsApi.js` | All record/batch endpoints (shape documented at the top). |
| `hooks/useRecords.js` | Setup, list (infinite), summary, detail, sections, mutations (record, nested items, documents, customer updates), batches. |
| `utils/recordType.js` | Pure: find type, allowed transitions, tabs from configuration, component margin. Tested. |
| `components/RecordsWorkspace.jsx`, `RecordsTable.jsx` | Views (active / needs attention / done / all), search, DataTable, manual create. |
| `components/RecordCreateDialog.jsx`, `CustomerSelect.jsx` | Manual create (standalone mode); contract-created records arrive via handoff. |
| `components/detail/*` | Detail: overview (core + tenant fields + owner), participants (roles, min/max), components (supplier status, cost/sell/margin), entries, required documents (upload/verify/reject), timeline + customer update. |
| `components/BatchesWorkspace.jsx`, `BatchDetailView.jsx` | Batches of a type; batch records + bulk status (server reports skipped records). |

API (all under `/api/tenant/service`):
`GET /records/setup` · `GET /records?type=&view=&search=&batch_id=&customer_id=` · `GET /records/summary?type=` ·
`POST /records` · `GET|PATCH /records/{id}` · `POST /records/{id}/transition` ·
`CRUD /records/{id}/participants|components` · `GET|POST /records/{id}/entries` ·
`GET /records/{id}/documents` + `POST …/documents/{docId}/upload|verify|reject` ·
`GET /records/{id}/timeline` · `POST /records/{id}/updates` (customer-facing) ·
`GET|POST /batches` · `GET /batches/{id}` · `POST /batches/{id}/bulk-status`.

Errors: 409 `RECORD_TRANSITION_NOT_ALLOWED`, 409 `CONFLICT_VERSION`, 409 `DOCUMENT_NOT_UPLOADED`,
422 `role: ['max']` (role full). Participant names, supplier names and entry values are user data
(`dir="auto"`/`bdi`); known entry values are translated via `service.records.entryValues.*`.
Cost amounts are permission-sensitive — the server may omit them.
