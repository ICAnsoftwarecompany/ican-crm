# features/service/handoffs — Sales → Service handoff (F3)

Spec §32. When a contract is fully signed the **backend** handoff processor (idempotent per
`contract_id + contract_version`) creates what each line's fulfillment config says — asset (+ warranty +
entitlement), subscription (+ entitlements), booking/enrollment/shipment/project record, work order — and a
handoff record the service team accepts. The frontend never creates those entities itself.

| Path | Role |
|---|---|
| `api/handoffsApi.js` | `GET /service/handoffs?status=` (+ `meta.counts`), `GET/PATCH /service/handoffs/{id}`, `POST …/{id}/accept|reject|reprocess`. |
| `components/HandoffsWorkspace.jsx` | Inbox by status (new, needs review, accepted, active, returned). |
| `components/HandoffDetailView.jsx` | Review items + reprocess, created entities (links), checklist, sales promises, notes, accept (service owner) / return to sales (reason). |
| `components/HandoffStatus.js` | Status tones, `entityPath()` for created entities. |

Failure handling: a line without service setup (or a missing record type) → `needs_review` with `errors[]`;
everything else is still created. Fix the item in Settings → Catalog, then **Process again** (only failed
lines run). Accepting with open review items → 409 `HANDOFF_HAS_ERRORS`. Amendments append to
`amendments_applied[]`. In standalone mode (no Sales) handoffs don't exist; records/assets/contracts are
created manually.
