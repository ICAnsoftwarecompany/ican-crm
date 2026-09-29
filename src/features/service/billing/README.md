# features/service/billing — Billing Lite (F4)

Spec §29. Payment plans are **rules, not amounts**. The server's Preview Engine turns a plan + price + dates
into dated lines; the frontend never computes an installment. In mock mode the engine lives in
`mocks/state/paymentPlanEngine.js` (pinned by `paymentPlanEngine.test.js`, including the spec's 8-year example).

| Path | Role |
|---|---|
| `api/billingApi.js` | `GET /settings/payment-plans?item_id=` (plans for an item, nearest scope wins), `POST /billing/payment-plans/{id}/preview` (saves nothing). |
| `components/PlanComponentsField.jsx` | Settings editor for plan components (down payment, installments, delivery, maintenance…, due rules, outside-the-price flag). |
| `components/PlanPreviewTable.jsx` | Renders a preview/schedule: totals, warnings, approval flag, dated lines (collapsed after 12). |
| `api/schedulesApi.js` | Schedules list/detail, `POST /billing/schedules/{id}/payments|reschedule|reschedule/approve|reschedule/reject|cancel|promises|payoff-quote`, `POST /billing/payments/{id}/reverse`, `POST /billing/lines/{id}/waive-fee`, `GET /billing/collections?view=`. |
| `components/SchedulesList.jsx`, `ScheduleDetailView.jsx` | `/service/billing/schedules[/:id]`: totals, lines (paid / remaining / late fee / status), payments, promises. |
| `components/ScheduleActions.jsx` + dialogs | Record payment (`RecordPaymentDialog`, also in payoff mode), promise to pay, payoff quote, reschedule request, cancel (`ReasonDialog`). |
| `components/PendingReschedule.jsx` | Server-built new lines of a pending reschedule + approve / reject. |
| `components/CollectionsWorkspace.jsx` | `/service/billing/collections`: overdue · due today · next 7 days · promises, aging buckets (1–30 / 31–60 / 61–90 / 90+). |
| `components/PlanCalculator.jsx` | Reusable calculator (item → plan → price/qty/dates/overrides → server preview). Accepts `itemId`, `price`, `compact` so a deal or quote screen can embed it later. Shown at `/service/billing/calculator` (Services hub tab "Payments"). |

Settings resources (`settings/resources/billingResources.js`): **Payment plans** (`/payment-plans`, editing bumps the
plan version; an assigned plan cannot be deleted → 409) and **Plan assignments** (`/plan-assignments`: scope = item type
or single item, default flag, exclusion, optional price adjustment override).

Rules (server-enforced, mirrored by the mock):
- Order: price → plan/assignment adjustment → discount (limits, else `requires_approval`) → in-price components →
  remaining split into installments (+ interest) → rounding with the remainder on the last line → outside-the-price lines → sort by date.
- A reservation fee deducted from the down payment is shown as `includes_reservation` on the down line (not a separate charge).
- Overrides (down %, count, discount %) outside plan limits return warnings + `requires_approval`; they are not rejected.
- The Deals screen is **not** changed in F4; it embeds `PlanCalculator` when Sales decides to.

Schedules (spec §29.9–29.13, server-enforced, mirrored by `mocks/state/billingLedger.js` + tests):
- A contract with `payment_plan_id` creates its schedule when fully signed (plan, price and lines frozen in `plan_snapshot`).
  Contract detail links to it; the Customer 360 Services tab lists the customer's schedules.
- Line status is derived: upcoming · due · partially_paid · paid · overdue · waived · cancelled. Late fees follow `grace_days` +
  `late_fee` (% per started month, capped) — a daily job on the server, derived on read in the mock.
- Payment allocation: oldest line first, late fee before principal; more than the outstanding → 422 `exceeds_outstanding`.
- Reversal adds a negative record (`reversal_of_id`); nothing is deleted. Waiving a late fee needs a reason (audit).
- Early payoff: quote = remaining principal − unearned interest − plan discount + late fees; paying it (`payoff: true`) must match
  the quote exactly (else 422 `payoff_mismatch`) and books the forgiven part as `settled_discount`.
- Reschedule: request → `pending_reschedule` (server-built lines) → approve creates a new schedule (`replaces_schedule_id`,
  `-V{n}` number) and keeps the old one as `rescheduled`; reject clears it.
- Promise to pay: kept when payments between the promise and its date cover it (oldest promise consumes first), broken after its date.

Proposed endpoints not in spec §51 (confirm with backend): `GET /billing/schedules` (list), `/reschedule/approve|reject`
(until the approvals module exists), `/promises`, `POST /billing/payments/{id}/reverse`, `GET /billing/collections`.
Not built yet: transfer (§29.11, needs asset transfer + amendment), receipt upload, ERP/gateway sync (§29.15).

Next in F4: subscriptions (F4c).
