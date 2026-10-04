# features/leads/close — Closing a lead (Leads Center)

> **Documentation update:** 2026-10-04 14:45 (Africa/Cairo) — folder added. 2026-10-04 20:04 (Africa/Cairo) — reasons per status, retarget mode,
> add to a deal, open-deal block.

**What it owns:** closing a lead as a **sale** (`is_deal`) or **lost** (`is_lost`), marking it **try again later**
(`is_retarget`), and **reopening** a closed one, from every Leads Center status change. Kinds come from Statuses settings.
Summary: [docs/2-SALES.md → Closing a lead](../../../../docs/2-SALES.md#closing-a-lead) · backend needs:
[docs/backend/BACKEND-REQUESTS.md §A](../../../../docs/backend/BACKEND-REQUESTS.md).

| File | Owns |
|---|---|
| `leadClose.js` (tested) | `getStatusCloseKind`, `resolveCloseMode(from, to)` → `won` / `lost` / `retarget` / `reopen` / null, `getStatusesOfKind`, `getMissingCloseKinds`, `getStatusReasons` (status own list, else default lost list), `isReasonRequired`, `LEAD_LOST_REASONS`, follow-up presets, `validateCloseForm`, `resolveFollowUpDate`, `buildLeadClosePayload`, `getLeadInterests`, `getLeadOpenDeal`, `getRowStatusId`, `statusLookup`. |
| `useLeadClose.js` | Sends one `save/action` per lead, then a follow-up task when a date is set; or, for "add to a deal", one `add-existing` request for all leads. Returns `{ done, failed, failedRows }`. `useReasonLabel`. |
| `useLeadCloseRequest.jsx` | **The interception point.** `interceptStatusChange({ rows, status, onDone })` opens the dialog and returns true for a close / reopen, false for a plain change. Render `dialog` once. A partial bulk failure keeps only the failed rows. |
| `LeadCloseDialog.jsx` · `WonFields.jsx` · `DealPicker.jsx` · `ReasonChips.jsx` · `FollowUpFields.jsx` · `CloseField.jsx` | The dialog: sale (record here — reason, interest, value, note — or add to a deal), lost (reason, note, follow-up), retarget (required follow-up, reason, note), reopen (note). |
| `LeadCloseDialog.test.jsx` | Plain change passes through; lost needs a reason and sends the body + task; status own reasons; retarget; open-deal block; bulk add to a deal; reopen note. |

**Public API** (`features/leads/index.js`): `useLeadCloseRequest`, `useLeadClose`, `LeadCloseDialog`, and the helpers above.

**Wired into:** board drop (`pages/customers/components/CustomersPipelineSection.jsx`), drawer quick action
(`StatusQuickAction.jsx`) and status changer (`CustomerStatusChanger.jsx`), bulk actions (`CustomersBulkActions.jsx`).
The follow-up note dialog disables won/lost statuses ("use Close").

**Request:** unchanged `POST /api/tenant/leads/save/action`; close data in the existing `data` object
(`close_type`, `reason_key`, `reason_id`, `lost_reason_key`, `follow_up_at`, `won_value`, `interest_id`). Labels: `customers.leadClose.*`.

**How to extend:** reasons belong to each status (Statuses settings, backend §A4); `LEAD_LOST_REASONS` is only the fallback
(+ `customers.leadClose.reasons.<key>`, ar + en). A new entry point → call `interceptStatusChange` before the
plain change and render `dialog`.

**Known gaps:** the server does not block moving a closed lead yet (§A3) — UI guard only; reasons per status are not saved yet
(§A4); the open-deal block needs `deals[]` on the lead row (§A5); close fields live in `data`, so reports cannot group them yet
(§A2, §A8). Not seen in a browser (no login available).
