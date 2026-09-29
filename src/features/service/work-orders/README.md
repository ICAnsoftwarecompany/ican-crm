# features/service/work-orders — Work orders & field visits (F4)

Spec §38. Case = the problem, work order = the visit. Hub tab **Work orders** (`/service/work-orders[/:id]`, feature `workOrders`).

| Path | Role |
|---|---|
| `api/workOrdersApi.js` | `GET/POST /service/work-orders`, `PATCH /{id}` (assign + schedule → server books the slot), `POST /{id}/on-the-way|check-in|check-out|complete|cancel`. |
| `components/WorkOrdersWorkspace.jsx` | List (open / by status), search, create. |
| `components/WorkOrderCreateDialog.jsx` | Type, customer, asset, entitlement (active ones of the customer), address, zone, duration. Exported for cases / assets later. |
| `components/WorkOrderDetailView.jsx` | Actions by status, schedule, visit (check-in/out, outcome, parts, labor, signature), coverage, history. |
| `components/WorkOrderDialogs.jsx` | Schedule (uses `scheduling/SlotPicker`, technicians only) and Complete visit. |

Flow: new → scheduled (reservation) → on_the_way → in_progress (check-in) → completed | back to new ("needs another visit",
slot released) · cancel releases the slot. Outcomes: completed · partial · failed (reason required) · rescheduled.
**Completing with an entitlement writes a `consume` entry to the entitlement ledger** (`source_type = work_order`); if the
entitlement is not available the visit is marked billable instead. Statuses are fixed in F4 (spec allows a pipeline later).
Not in F4: photos / signature files (need uploads), routes, parts inventory, mobile app (§38.5).
