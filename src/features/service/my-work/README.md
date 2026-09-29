# features/service/my-work — My Work & Operations Center (F1)

**My Work** is one list of everything assigned to the signed-in user: cases today, then tasks, work
orders, approvals, missing documents and follow-up steps as those phases ship. It is a **read model**
(`work_items`, spec §20.2) built by the backend from events — not a second task system.

| Path | Role |
|---|---|
| `api/myWorkApi.js` | `GET /api/tenant/my-work`, `useMyWork()`, `WORK_ITEM_LINKS` (where each `source_type` opens). |
| `components/MyWorkList.jsx` | The list (`limit` for previews): icon per source, reference, customer, status, priority, due/updated time (overdue in `text-sla-breached`). |
| `components/ServiceCenterCounters.jsx` | Operations Center counters (`SERVICE_CENTER_VIEWS`, incl. SLA at risk/breached toned with `--sla-*`) linking to case views. For cases, `due_at` = `sla.next_due_at`. |

Work item: `{ id, source_type, source_id, title, reference, customer: {id,name}|null, priority,
status: {key,label,category}|null, due_at, updated_at }`.

**Add a source type:** backend adds it to the read model → add a line to `WORK_ITEM_LINKS`, an icon in
`SOURCE_ICON`, and `service.myWork.sources.<type>` in both locales.
