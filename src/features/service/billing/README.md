# features/service/billing — Billing Lite (F4)

Spec §29. Payment plans are **rules, not amounts**. The server's Preview Engine turns a plan + price + dates
into dated lines; the frontend never computes an installment. In mock mode the engine lives in
`mocks/state/paymentPlanEngine.js` (pinned by `paymentPlanEngine.test.js`, including the spec's 8-year example).

| Path | Role |
|---|---|
| `api/billingApi.js` | `GET /settings/payment-plans?item_id=` (plans for an item, nearest scope wins), `POST /billing/payment-plans/{id}/preview` (saves nothing). |
| `components/PlanComponentsField.jsx` | Settings editor for plan components (down payment, installments, delivery, maintenance…, due rules, outside-the-price flag). |
| `components/PlanPreviewTable.jsx` | Renders a preview/schedule: totals, warnings, approval flag, dated lines (collapsed after 12). |
| `components/PlanCalculator.jsx` | Reusable calculator (item → plan → price/qty/dates/overrides → server preview). Accepts `itemId`, `price`, `compact` so a deal or quote screen can embed it later. Shown at `/service/billing` (Services hub tab "Payments"). |

Settings resources (`settings/resources/billingResources.js`): **Payment plans** (`/payment-plans`, editing bumps the
plan version; an assigned plan cannot be deleted → 409) and **Plan assignments** (`/plan-assignments`: scope = item type
or single item, default flag, exclusion, optional price adjustment override).

Rules (server-enforced, mirrored by the mock):
- Order: price → plan/assignment adjustment → discount (limits, else `requires_approval`) → in-price components →
  remaining split into installments (+ interest) → rounding with the remainder on the last line → outside-the-price lines → sort by date.
- A reservation fee deducted from the down payment is shown as `includes_reservation` on the down line (not a separate charge).
- Overrides (down %, count, discount %) outside plan limits return warnings + `requires_approval`; they are not rejected.
- The Deals screen is **not** changed in F4; it embeds `PlanCalculator` when Sales decides to.

Next in F4: payment schedules, payments & allocation, collections (F4b), subscriptions (F4c).
