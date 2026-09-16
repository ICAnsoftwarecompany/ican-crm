# Tasks Workspace

## Overview

The Tasks Workspace is a CRM-focused task management surface built on top of the existing task APIs and current ICAN CRM UI patterns. It is designed to feel like a lightweight board workspace while preserving the existing task domain, drawer, forms, and API contracts.

## Architecture

The workspace reuses the current domain rather than re-implementing it:

- Existing task API layer: `src/features/tasks/api/tasksApi.js`
- Existing task hooks: `src/features/tasks/hooks/useTasks.js`
- Existing task views: `TaskKanbanView`, `TaskCalendarView`, `TaskDrawer`, `TaskForm`, `TaskFormDialog`
- Current CRM shell: `src/pages/tasks/TasksPage.jsx`

This keeps backend compatibility and avoids fragmenting task logic across multiple parallel implementations.

## Folder structure

- `src/features/tasks/api/` — HTTP API adapters
- `src/features/tasks/components/` — existing task UI
- `src/features/tasks/components/workspace/` — workspace shell and new workspace layout pieces
- `src/features/tasks/hooks/` — query and mutation hooks
- `src/features/tasks/utils/` — task metadata and business helpers

## Existing APIs reused

The workspace continues to rely on the current task endpoints:

- `GET /api/tenant/tasks`
- `GET /api/tenant/tasks/{task}`
- `POST /api/tenant/tasks`
- `PUT /api/tenant/tasks/{task}`
- `PATCH /api/tenant/tasks/{task}/status`
- `POST /api/tenant/tasks/{task}/assign-users`
- `POST /api/tenant/tasks/{task}/assign-teams`
- `POST /api/tenant/tasks/{task}/notes`
- `POST /api/tenant/tasks/{task}/attachments`
- `DELETE /api/tenant/tasks/{task}`

## Board concepts

The current implementation uses a board-oriented UX while keeping list status and board list organization separate.

Important distinction:

- Board/List = organizational placement inside a board workspace
- Task status = workflow state such as `pending`, `in_progress`, `completed`, `cancelled`
- Smart view = computed filtered task collection, not an actual database board

This avoids conflating board placement with business status.

## Smart Views

The workspace provides smart views for:

- All Tasks
- Due Today
- Overdue
- In Progress

These are computed in the frontend from the current task collection and the existing task metadata helpers.

## Lists and Board UX

The board experience is intentionally lightweight and respects the current application structure:

- sidebar for smart views and boards
- header with task search, create task, and view switcher
- board view with horizontally scrollable task lists
- task drawer for detail and editing
- calendar view reuse for date-driven planning

## Task cards

Task cards continue to use the existing task metadata utilities and visual conventions, preserving current CRM styling. They display:

- title
- type
- priority
- status
- due label
- overdue state

## Task Drawer

The existing `TaskDrawer` remains the single source for full task details and editing. It remains the official task detail container to avoid duplicating the task domain.

## CRM linking

Tasks continue to support the current `taskable_type` + `taskable_id` contract. This allows task records to be linked to CRM entities without hardcoding a single entity type.

## Filters and calendar

The current `TasksPage` already provides search, quick filters, status filters, and a calendar view. The workspace layer builds on top of that instead of replacing it.

## Reminders and activity

The reminder and activity fields are already supported in the current forms and API contract. Frontend behavior remains conservative and uses the existing backend-driven model rather than inventing browser timers or duplicate notification engines.

## Realtime and notifications

The project already has a notification center and realtime infrastructure. The tasks workspace should integrate through the same patterns rather than adding a new socket layer or parallel notification system.

## Permissions

Current permissions should remain aligned with the existing tenant-backed backend and task API rules. Access to task actions should continue to be governed by the same authorization model already used elsewhere in the CRM.

## Routing

The current route `/tasks` remains the primary surface. The workspace is designed to work inside the existing routing pattern without rewriting navigation logic.

## RTL and responsiveness

The workspace follows the current RTL/LTR conventions used by the broader CRM. Layout and interaction patterns use the same direction-aware CSS patterns and responsive behavior as the rest of the project.

## Known backend gaps

The following features are not yet backed by a production API in this repository and should be treated as future backend work:

- board persistence across users
- board list storage and ordering
- board membership and visibility controls
- task activity log endpoint
- task board movement tracking
- reminders scheduler
- bulk task actions endpoint
- subtasks/checklists endpoint
- recurring task engine

## Testing checklist

- Open `/tasks`
- Verify smart view sidebar
- Switch board/list/calendar views
- Create task in full form
- Open task drawer
- Update status
- Add note
- Upload attachment
- Search and filter tasks
- Validate overdue logic
- Confirm responsive behavior and RTL layout

## Future Activity Center integration

This workspace is intentionally structured so it can expand later into an activity center that includes tasks, calls, and meetings while keeping each domain stateful and separate.
