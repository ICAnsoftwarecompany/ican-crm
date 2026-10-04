# features/leads/close — Closing a lead (Leads Center)

> **Documentation update:** 2026-10-04 14:45 (Africa/Cairo) — folder added.

**What it owns:** closing a lead as **won** or **lost**, and **reopening** a closed one, from every Leads Center status
change. A lead is closed by moving it to a status whose kind (Statuses settings) is `is_deal` (won) or `is_lost`.
Summary: [docs/2-SALES.md → Closing a lead](../../../../docs/2-SALES.md#closing-a-lead) · backend needs:
[docs/backend/BACKEND-REQUESTS.md §A](../../../../docs/backend/BACKEND-REQUESTS.md).

| File | Owns |
|---|---|
| `leadClose.js` (tested) | `getStatusCloseKind`, `resolveCloseMode(from, to)` → `won` / `lost` / `reopen` / null, `getStatusesOfKind`, `LEAD_LOST_REASONS`, `LEAD_FOLLOW_UP_PRESETS`, `validateCloseForm`, `resolveFollowUpDate`, `buildLeadClosePayload`, `getLeadInterests`, `getRowStatusId`, `statusLookup`. |
| `useLeadClose.js` | Sends one `save/action` per lead, then a follow-up task (lost + follow-up); returns `{ done, failed, failedRows }`. |
| `useLeadCloseRequest.jsx` | **The interception point.** `interceptStatusChange({ rows, status, onDone })` opens the dialog and returns true for a close / reopen, false for a plain change. Render `dialog` once. A partial bulk failure keeps only the failed rows. |
| `LeadCloseDialog.jsx` · `LostFields.jsx` · `WonFields.jsx` · `CloseField.jsx` | The dialog: won (interest, value, note), lost (reason chips, note, follow-up), reopen (note). |
| `LeadCloseDialog.test.jsx` | Plain change passes through; lost needs a reason and sends the body + follow-up task; bulk win refused; reopen needs a note. |

**Public API** (`features/leads/index.js`): `useLeadCloseRequest`, `useLeadClose`, `LeadCloseDialog`, and the helpers above.

**Wired into:** board drop (`pages/customers/components/CustomersPipelineSection.jsx`), drawer quick action
(`StatusQuickAction.jsx`) and status changer (`CustomerStatusChanger.jsx`), bulk actions (`CustomersBulkActions.jsx`).
The follow-up note dialog disables won/lost statuses ("use Close").

**Request:** unchanged `POST /api/tenant/leads/save/action`; close data in the existing `data` object
(`close_type`, `lost_reason_key`, `follow_up_at`, `won_value`, `interest_id`). Labels: `customers.leadClose.*`.

**How to extend:** a new lost reason → `LEAD_LOST_REASONS` + `customers.leadClose.reasons.<key>` (ar + en), until the
tenant list endpoint (backend §A4) replaces the constant. A new entry point → call `interceptStatusChange` before the
plain change and render `dialog`.

**Known gaps:** the server does not block moving a closed lead yet (§A3) — UI guard only; reasons are a fixed list (§A4);
the close fields live in `data`, so reports cannot group them yet (§A2, §A6); a lead inside a deal should be won from the
deal — the UI only says so (§A5). Not seen in a browser (no login available).
