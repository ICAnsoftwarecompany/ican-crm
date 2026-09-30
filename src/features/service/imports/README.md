# features/service/imports — Import engine (F5)

Spec §15.1. Operations settings → General → **Import data** (`/service/settings/imports`).

| Path | Role |
|---|---|
| `api/importsApi.js` | `GET /imports/entities`, `GET /imports/fields`, `GET /imports/mappings`, `POST /imports/files`, `POST /imports` (dry run), `POST /imports/{id}/execute`, `GET /imports[/{id}]`, `GET /imports/{id}/error-file`. |
| `components/ImportWizard.jsx` | File → Columns → Check (dry run, nothing saved) → Done; error file download. |
| `components/ImportMappingStep.jsx` | Column → field mapping with the first row as sample, mode (create / create-or-update), match key, save mapping. |
| `components/ImportsPanel.jsx` | Wizard + recent imports. |
| `utils/suggestMapping.js` | Auto-maps columns by field key / label (tested). |

Importable: every active service record type (reference, customer phone → existing customer, dates, recipient when the type
has that role, and the type's own fields) and assets (serial, customer phone, product, installation date, address) when the
tenant sells serial-tracked items. Validation per row: required, number, date (YYYY-MM-DD), phone, customer / product lookup,
duplicates in the file, already exists (create mode). Upsert updates by the match key. The mock engine
(`mocks/state/importEngine.js`, tested) parses CSV (quotes, commas, newlines, BOM) and builds the error file (failed rows +
an `errors` column) for fix-and-re-upload.

Contract notes (confirm with backend): `/imports/files` takes `{ file_name, content }` (CSV text ≤ 5 MB, ≤ 10,000 rows) —
the real server may take multipart and return the same `{ file_id, headers, sample, row_count }`; execution is asynchronous
in batches on the server (tenant fairness, one event per record). Not in F5: Excel files, customers/contacts import (CRM
core), B2B portal bulk upload (`POST /portal/org/imports`) — the same engine will serve it.
