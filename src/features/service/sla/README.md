# features/service/sla — SLA presentation (F2)

The **backend computes SLA** (business calendar, holidays, pauses, escalation scheduler). The frontend
only renders `case.sla` from the case payload; there is no SLA math here.

| Path | Role |
|---|---|
| `utils/slaState.js` | `SLA_STATES`, color maps to the `--sla-*` tokens (light + dark in `src/index.css`). |
| `components/SlaBadge.jsx` | Compact indicator for tables/cards/headers: state color + time to next target. Renders nothing without a policy. |
| `components/SlaPanel.jsx` | Case side panel: first response + resolution with progress bars, due/done time, policy name. |

Contract (`case.sla`, null when no policy applies):

```js
{ policy: { id, name: {ar,en} },
  state: 'on_track' | 'at_risk' | 'breached' | 'paused' | 'met',
  next_due_at,                                   // null while paused
  first_response: Metric, resolution: Metric }
// Metric: { target_minutes, due_at, completed_at, state, elapsed_percent }
```

Related server behaviour used by the UI:
- Case views `sla_at_risk`, `sla_breached` (open cases only, sorted by `next_due_at`); `sort=sla_due` on any view.
- Timeline activity `sla_escalated` `{ percent, action, target, metric, rule }` written when an escalation step fires.
- My Work `due_at` for cases = `sla.next_due_at`.

Configuration (policies, calendars, escalation rules) lives in `../settings`. The mock engine is
`mocks/state/sla.js` (wall-clock time, "at risk" from 75 %) — it mirrors the output shape only.
