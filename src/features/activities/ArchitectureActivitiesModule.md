# ICAN CRM Activities Module

## Purpose

`features/activities` is the unified operational module for calls and meetings across all Leads and Customers. It is not tied to one customer drawer. The page lives in the Customers sidebar at `/LeadsCenter/activities` and is also available through `/activities`.

## Architecture

Calls and meetings use the same backend resource: `/api/tenant/meetings`. The frontend exposes a unified activities layer so list pages, forms, drawers, filters, lifecycle actions, reports, and future calendar integrations do not duplicate logic.

## Folder Structure

- `api/activitiesApi.js`: maps the Activities domain to the existing meetings API and normalizes responses.
- `hooks/`: React Query hooks, filter URL state, mutations, reports, and frontend statistics.
- `constants/`: centralized metadata for types, statuses, priorities, derived states, and views.
- `utils/`: date helpers, status helpers, response normalization, filter mapping, outcomes, and next actions.
- `schemas/`: Zod schemas for activity creation/editing and completion reports.
- `components/ActivityHeader`: top page header and create actions.
- `components/ActivityStats`: summary cards for today, scheduled, in progress, completed, overdue, and cancelled.
- `components/ActivityTabs`: All, Calls, Meetings, List, and Calendar switching.
- `components/ActivityFilters`: shareable filters backed by URL query parameters.
- `components/ActivityTable`: existing shared `DataTable` integration.
- `components/ActivityCalendar`: grouped date view prepared for future unified CRM calendar work.
- `components/ActivityDrawer`: detailed drawer with Overview, Preparation, Report, Notes, Files, Participants, and History.
- `components/ActivityForm`: reusable activity create/edit dialog.
- `components/ActivityReport`: finish workflow and structured report dialog.
- `components/ActivityStatus`: lifecycle badges and row/drawer actions.
- `pages/ActivitiesPage.jsx`: orchestration only; business logic stays in hooks/utils/components.

## Calls vs Meetings

The module never creates separate full call and meeting implementations. Both are activities. The backend distinguishes them with `type: "call"` or `type: "meeting"`. Type-specific behavior appears only in field components, outcomes, badges, and conditional drawer tabs.

## API Mapping

- `getActivities(params)` -> `meetingsApi.getMeetings(params)`
- `getActivityInfo(id)` -> `meetingsApi.getMeetingInfo(id)`
- `createActivity(payload)` -> `meetingsApi.createMeetingOrCall(payload)`
- `updateActivity(id, payload)` -> `meetingsApi.updateMeetingOrCall(id, payload)`
- `deleteActivity(id)` -> `meetingsApi.deleteMeetingOrCall(id)`
- `startActivity(id)` -> `meetingsApi.changeStatus(id, { status: "in_progress" })`
- `cancelActivity(id)` -> `meetingsApi.changeStatus(id, { status: "cancelled" })`
- `completeActivity(id)` -> `meetingsApi.changeStatus(id, { status: "completed" })`
- `createActivityReport(id, payload)` -> `meetingsApi.createReport(id, payload)`
- `getActivityReports(id)` -> `meetingsApi.getReports(id)`

## Query Keys

Activity query keys are centralized in `hooks/useActivityKeys.js`: `all`, `list`, `detail`, `reports`, and `summary`.

Mutations invalidate Activities plus the existing `meetings`, `customers`, and `leads` query roots because call/meeting updates appear in customer timelines and lead data.

## Activity Lifecycle

Backend lifecycle statuses are `scheduled`, `in_progress`, `completed`, and `cancelled`.

Actions depend on status:

- Scheduled: start, edit, cancel.
- In progress: finish.
- Completed: create follow-up.
- Any status: view and delete.

## Derived Statuses

`today`, `upcoming`, and `overdue` are frontend derived states. They are calculated from dates and lifecycle status and are not sent as backend statuses.

## Activity Form

`ActivityFormDialog` is reusable from any part of the CRM. It supports `initialType`, editing existing normalized activities, lead/customer linking through `taskable_type` and `taskable_id`, call fields, meeting fields, and reminders.

## Activity Drawer

The drawer opens from table rows or calendar cards. It shows Overview, Preparation, Report, Notes, Files, Participants, and History. Participants appear for meetings only.

## Report System

Finishing an activity opens `ActivityReportDialog`. The flow is: validate report, save report, create next call/meeting if selected, mark current activity as completed, then invalidate relevant queries.

## Next Action System

Next actions live in `utils/activityNextActions.js`: `none`, `call_again`, `schedule_meeting`, `create_task`, `send_proposal`, and `send_email`. Only follow-up calls and meetings create activities right now; task/proposal/email are prepared for future wiring.

## Task Integration

Tasks remain a separate domain. Activities can later generate tasks, but calls and meetings are not converted into tasks.

## Proposal Integration

`send_proposal` is available as a next-action value so the proposal module can be attached without changing the report schema or UI flow later.

## Customer/Lead Integration

Every activity keeps its related entity via `taskable_type` and `taskable_id`. The table and drawer can navigate to `/lead/:id`.

## Calendar

`ActivityCalendar` groups activities by day and opens the same drawer. It is intentionally simple so it can later join a unified CRM calendar with tasks, calls, and meetings.

## Filters

Important filters are synchronized with URL query params: `type`, `view`, `search`, `status`, `priority`, `assigned_to`, `team_id`, `date_from`, and `date_to`.

## Add A New Outcome

Edit `utils/activityOutcomes.js`, add a `{ value, label }` item to `CALL_OUTCOMES` or `MEETING_OUTCOMES`, then the report dialog and table label resolver will pick it up.

## Add A New Next Action

Edit `utils/activityNextActions.js`, add a config object with `value`, `label`, `icon`, `requiresDate`, `requiresTime`, and `createsEntity`. If it creates a new domain object, wire the creation step in `ActivityReportDialog`.

## Future Improvements

- Server-side statistics endpoint.
- Searchable customer/lead/user/team selectors instead of ID inputs.
- Dedicated reschedule flow with audit history.
- Task/proposal/email next-action integrations.
- Recurring activities.
- Meeting agenda and minutes.
- Call recordings and transcripts.
- AI summary and suggested next action.
- Calendar month/week/day views.
- Permission-driven action visibility.
