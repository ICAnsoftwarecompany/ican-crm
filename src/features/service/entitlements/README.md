# features/service/entitlements — Entitlements & ledger (F3)

Spec §35. Answers "is the customer entitled to this service?". The **balance is computed by the server
from the ledger** (`consume / restore / adjust / expire / reset`), never stored as a counter.

| Path | Role |
|---|---|
| `api/entitlementsApi.js` | `GET /service/entitlements`, `GET …/{id}` (+ `transactions`), `POST …/{id}/transactions`, `POST /service/entitlements/check`. |
| `components/EntitlementsList.jsx` | List (hub tab, asset detail, customer tab) → opens the drawer. |
| `components/EntitlementDrawer.jsx` | Balance, validity, source, ledger, manual movement (consume / restore / adjust with reason). |
| `components/EntitlementBalance.jsx` | "Used 3 of 4" meter or "Unlimited". |
| `components/CaseCoveragePanel.jsx` | Case side panel (when the tenant has `entitlements`): result of the check for the case's customer + type. |

Check result: `covered | not_covered | expired | exhausted | suspended | paid_required` (+ `entitlement_id`,
`remaining`, `sla_policy_id`, `reason`). The check never consumes — consumption happens on the server at a
defined event (work order completed, case opened for some types). Consuming an unavailable entitlement →
409 `ENTITLEMENT_NOT_AVAILABLE`.
