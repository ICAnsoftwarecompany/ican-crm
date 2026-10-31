# Lead Tasks

## Task Column And Timeline

2026-10-22 23:30 (Africa/Cairo)

`useLeadTasksColumn` adds the tasks column to CRM and deal-lead tables. A shared
`useLeadTasksIndex` query reads all numbered pages of lead-linked tasks (200/page),
then verifies taskable identity client-side. No per-row list requests. The column
shows total tasks and countdown to the earliest open deadline, updating every
30 seconds without refetching. Closed/cancelled tasks are excluded from countdown;
date-only deadlines use end of day and undated tasks have no fabricated deadline.
Overdue tasks show elapsed lateness rather than negative countdown. The column is
display-only (not sortable/filterable by computed count).

Open tasks displays the same cached list in a drawer, with a countdown for each
dated open task. Selecting a task opens the existing task details/edit drawer at
a higher overlay layer. Task mutations invalidate the shared tasks cache.

The customer activity timeline includes task entries at their creation timestamps,
not future due dates. Entries show description, priority, status, due date/time and
Open task. Undated creation timestamps are left unknown. The timeline shares the
paginated task index so it is not limited to the first response page.


2026-10-22 23:21 (Africa/Cairo)

## Purpose

Create task copies for one or several CRM leads from Leads Center, the shared customer
drawer, or the deal workspace. Uses the existing tasks feature, not a separate API.
Public exports: `useLeadTaskAction`, `LeadTaskDialog`, `leadTaskTargets`.

## Files

- `LeadTaskDialog.jsx`: independent task drawer, title, text, checklist points, files,
  optional due date/time, optional system reminder and low/medium/high/urgent priority.
- `leadTaskModel.js`: identity mapping, supported task payload, sequential batch runner.
- `useLeadTaskAction.jsx`: owns opening/closing and resolves selected records.
- Tests cover identity safety, payload, copies, retry, attachments and invalid selections.

## Integration

```jsx
const tasks = useLeadTaskAction({ dealId, onSaved })
// With dealId: pass normalized deal leads (leadId = CRM lead, id = deal-lead).
// Without dealId: pass CRM customer rows with lead_id or lead.id.
tasks.open(row) // or tasks.open(selectedRows)
return <>{tasks.dialog}</>
```

Context actions in Leads Center and deal tables/cards expose Add task. Both tables
have a bulk-selection toolbar action. The shared customer drawer has a compact
task action; deal drawers use the contextual override. The deal-specific lead page
uses the same action set.

## Persistence Contract

- Existing `POST /api/tenant/tasks` through `useTaskMutations().create`, multipart
  conversion and cache invalidation remain owned by `features/tasks`.
- A separate task per unique lead, as requested. There is no shared multi-lead task.
- Uses supported `type: follow_up` and `taskable_type: App\\Models\\Lead` with the
  actual CRM lead ID. Never uses customer or deal-lead IDs as substitutes.
- This is a new frontend workflow, not a new unconfirmed backend task-type enum.
- Text and Markdown checklist (`- [ ]` / `- [x]`) are stored in description; checklist
  points are not backend subtasks and do not have individual reminders or completion APIs.
  The existing task editor can edit the description after creation.
- Deal context is preserved as `/deals/:dealId/leads/:dealLeadId` in the description;
  tasks still appear under the CRM lead. No unsupported DealLead taskable is invented.
- Files use the existing attachments array and multipart upload.
- Priority is the existing task priority, not an unsupported independent alarm intensity.
- Reminder is system-based and requires date plus time. Disabled reminders send an
  empty reminder_before, matching existing To-Do behavior. Delivery is backend-owned.
- New tasks are assigned to the current user when available, with shared visibility.

## Failure Handling

Invalid/missing lead IDs block the batch, rather than silently omit selected leads.
During creation close and edit are blocked. Successful lead IDs are checkpointed in
memory. Partial failures retain the form/files and lock edits; Retry continues only
unfinished copies. Closing discards this session's retry checkpoint. The API has no
documented idempotency key: an ambiguous network timeout after server commit, browser
reload or restarting the workflow may still duplicate a task and needs server support
to fully prevent. No task data or files are stored in localStorage.
