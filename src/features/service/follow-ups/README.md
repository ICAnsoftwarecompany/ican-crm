# follow-ups — Follow-up Programs (F5, spec §39)

Planned check-ins that are **not cases**: after a sale, before a renewal, during onboarding. A program is a versioned
list of steps; each due step becomes a task for the owner (live: in the existing Task Engine, `taskable =
follow_up_enrollment`), and the outcome the agent records decides what happens next.

| Piece | Where |
|---|---|
| Program editor (settings → Follow-ups → Follow-up programs) | `settings/resources/followUpResources.js` + `components/FollowUpStepsField.jsx`, `FollowUpStepEditor.jsx` |
| Workspace `/service/follow-ups` (Services hub tab) | `components/FollowUpsWorkspace.jsx`, `FollowUpDrawer.jsx`, `FollowUpHistory.jsx` |
| Manual enrollment | `components/EnrollFollowUpDialog.jsx` (exported; can be embedded with a fixed `customer`) |
| Rule / offset mapping for the editor | `constants/followUps.js` (+ test) |
| Mock engine | `mocks/state/followUpEngine.js` (+ test), `mocks/handlers/followUpsHandlers.js` (+ test) |

## Step shape (spec §39.2)

```json
{ "key": "day2", "offset": "+2 day", "channel": "call",
  "task_title": { "ar": "...", "en": "Post-installation call" },
  "checklist": [{ "ar": "...", "en": "Installed correctly?" }],
  "outcomes": ["satisfied", "issue_found", "no_answer"],
  "on_outcome": { "issue_found": "create_case:ct-complaint", "no_answer": "retry:+1 day:2" } }
```

- `offset`: `+N hour|day|week|month` from enrollment, or `-N day from end` counted back from the subject's end date
  (contract / subscription). Programs whose first step counts from the end need `subject_ends_at` on manual enroll.
- `on_outcome`: missing = go to the next step · `retry:+1 day:2` = same step again later, at most 2 retries, then next
  · `create_case:<case_type_id>` = open a case (assigned to the owner) and go to the next step. The spec example
  writes `max2` and a type name; we use a number and the case-type id so the rule survives renames.
- Checklist items and task titles are `{ar, en}`; the editor writes the current UI language only.
- Editing a program bumps `version`; running enrollments keep `program_version` (live: the server snapshots the steps).

## Endpoints

| Call | Status |
|---|---|
| `CRUD /api/tenant/follow-up-programs` | spec §51 |
| `GET /api/tenant/follow-ups?view=overdue\|due_today\|upcoming\|completed\|all&mine=1&program_id&customer_id&search` → page + `summary` counts | proposed |
| `POST /api/tenant/follow-ups { program_id, customer_id, owner_id?, subject_ends_at? }` (409 `FOLLOW_UP_ALREADY_ENROLLED`) | proposed |
| `POST /api/tenant/follow-ups/{id}/outcome { outcome, note?, checklist[] }` → enrollment + `effect` (advanced\|retry\|completed) | proposed |
| `POST /api/tenant/follow-ups/{id}/exit { reason }` | proposed |

Owner: `assignment.type = portfolio_owner` → the customer's portfolio owner, else `fallback_user_id`, else the caller.
Event triggers (`contract.signed`, `subscription.renewal_window`, …) and exit conditions run on the server; the UI only
configures them. Due buckets use the viewer's local day.

Not built: queue/team assignment execution, audience conditions, quality checklist link, per-step SLA, bulk enroll.
