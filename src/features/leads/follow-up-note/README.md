# Lead Follow-Up

## Shared CRM Dialog - 2026-10-19 18:35 (Africa/Cairo)

Owns the existing follow-up/note editor and its schedule/interest fields, moved without behavioral changes from `pages/customers/components/follow-up-note`. Public export: `FollowUpNoteDialog` from `features/leads`. Both Leads Center and deal-lead actions use the same implementation.

Inputs are `open`, `customer`, optional `statuses/currentStatus`, `onClose`, and `onSaved`. `customer.lead.id`/`lead_id` must be the CRM lead ID, never a deal membership ID. The editor keeps its existing activity, note, optional status/schedule and interest behavior. Closing statuses remain excluded by its existing validation. Embedded consumers own refreshing their feature caches after save. The floating editor is legacy UI and was not redesigned in this migration.
