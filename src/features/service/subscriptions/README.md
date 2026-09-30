# features/service/subscriptions — Subscriptions lifecycle (F4)

Spec §30. A subscription is created by the handoff processor when a signed contract line's item has
`fulfillment.creates = subscription` (recurrence taken from the item type's `recurrence` capability, price from the
contract line). Services hub tab **Subscriptions** (`/service/subscriptions[/:id]`, shown when the tenant has the
`subscriptions` feature) and a Customer 360 section.

| Path | Role |
|---|---|
| `api/subscriptionsApi.js` | `GET/PATCH /subscriptions[/{id}]`, `POST /subscriptions/{id}/cancel|suspend|resume|renew`, `POST /subscriptions/{id}/periods/{periodId}/pay`. |
| `components/SubscriptionsWorkspace.jsx` | List with status / "renewal due" filter. |
| `components/SubscriptionDetailView.jsx` | Plan, notices (trial end, grace, cancel at period end, pending change, renewal due), details, renewal setting, history. |
| `components/SubscriptionActions.jsx` | Renew (manual / expired), resume or keep (withdraw cancel), change price (next period), suspend, cancel (now / period end). |
| `components/SubscriptionPeriods.jsx` | Billing periods (one due line per period in `payments_source = crm`) + mark paid. |

Lifecycle (server job; the mock runs `mocks/state/subscriptionLifecycle.js` on read — idempotent, tested):
- trial → active at `trial_ends_at` (first period billed then).
- Period end: `cancel_at_period_end` → cancelled; `auto` → new period + due line (a pending price change applies here);
  `manual` / `none` → expired. Manual renewals show "renewal due" 30 days before the end.
- Unpaid period after its due date → `past_due` until `grace_until = due + grace_days`, then `suspended`
  (`suspend_reason = non_payment`) and linked entitlements (`source_type = subscription`) are suspended.
  Paying the dues reactivates automatically; a manual suspension needs **Resume**.
- Cancel / expire end the linked entitlements at that date. Proration and pause are later (spec says [لاحقًا]).

Proposed (confirm with backend): `POST /subscriptions/{id}/periods/{periodId}/pay` — in `erp` / `gateway` mode periods are
paid by webhook and this action is hidden.

## F7 — proration

`PATCH /subscriptions/{id} { pending_change: { price, effective: 'now' } }` changes the price today: credit for the
unused days at the old price, charge for them at the new price (`mocks/state/proration.js`, day-based). A positive net is
a due line today (`periods[].kind = 'proration'`); a negative net is kept as `credit_balance` for the next period. The
change is logged in `adjustments[]`. Preview: `POST /subscriptions/{id}/change-preview { price }` → `{ period_days,
days_left, credit_unused, charge_new, net }` (proposed). UI: `components/ChangePlanDialog.jsx`. Default stays "from the
next period" (spec §30).
