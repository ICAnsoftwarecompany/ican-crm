# features/service/assets — Assets & warranty (F3)

Spec §34. An asset is what became owned by / dedicated to the customer after fulfillment (an AC unit, a
car, a real-estate unit). Warranty is its own entity and creates an entitlement. Shown in the Services
hub only when the tenant has the `assets` feature (model B).

| Path | Role |
|---|---|
| `api/assetsApi.js` | `GET/POST /service/assets`, `GET/PATCH /service/assets/{id}`, `POST …/{id}/transfer`, `POST /service/warranties/{id}/void`; hooks. |
| `components/AssetsWorkspace.jsx` | Search + status filter + DataTable (warranty state, installation date), register asset. |
| `components/AssetDetailView.jsx` | Details, warranties (void with reason), entitlements (reuses `../entitlements`), service history (linked cases), ownership transfers. |
| `components/AssetCreateDialog.jsx` | Manual registration (standalone / old sales). Contract sales create assets via the handoff. |
| `components/AssetStatusBadge.jsx` | Status + warranty tones. |

Rules: serial numbers are unique per tenant (422 `serial_number: ['taken']`). Transfer keeps history;
the server decides which entitlements move (the mock moves asset-bound ones). Voiding a warranty suspends
its entitlements. Service history grows in F4 (work orders) — same `service_history[]` shape.
