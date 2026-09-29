# features/service/deliveries — Courier dispatch, proof of delivery, COD (F4)

Spec §38.4 (couriers) and §29.14 (COD). Hub tab **Deliveries** (`/service/deliveries`, feature `courierAssignment`).
A shipment stays a service record; this module adds its dispatch state. Couriers are scheduling resources of type `courier`
(zones, vehicle, daily capacity).

| Path | Role |
|---|---|
| `api/deliveriesApi.js` | `GET /service/deliveries` (+ `summary`), `POST /service/deliveries/{recordId}/assign|out-for-delivery|attempts`; `GET /billing/cod-remittances[/pending]`, `POST /billing/cod-remittances`, `POST /{id}/pay`, `DELETE /{id}` (draft). |
| `components/DeliveriesWorkspace.jsx` | Status counters, COD to remit, search, courier filter, table (double-click a row). |
| `components/DeliveryDialog.jsx` | Assign courier, send out, record an attempt: outcome, proof (signature / photo / OTP), receiver, COD collected. |
| `components/CodRemittances.jsx` | Collected COD per merchant → remittance (fees deducted, net) → mark paid with the bank reference. |

Rules (server-enforced, mirrored by `mocks/handlers/deliveriesHandlers.js` + tests):
- Assigning respects the courier's daily capacity (409 `COURIER_AT_CAPACITY`).
- Every attempt is a record entry (`delivery_attempt`); a delivery adds `proof_of_delivery`. Delivered needs a proof method and
  receiver; OTP is verified by the server (the mock accepts any 4 digits); COD collected must equal the COD amount.
- After 3 failed attempts the shipment is `failed` (a workflow opens a "Delivery issue" case on the server — not in the mock).
- Remittance = all collected, unremitted COD of one merchant; fees are the merchant plan's (mock: 55 per shipment + 1%).
  Accounting lives in the ERP.

Proposed (confirm with backend): the `/service/deliveries` endpoints and `/billing/cod-remittances/pending`.
