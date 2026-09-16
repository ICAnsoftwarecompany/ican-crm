# Tasks Workspace Backend Requirements

This document lists only the APIs that are not currently implemented in this repository and are therefore required for the full workspace experience described in the Tasks Workspace design.

## Boards

### POST /api/tenant/task-boards
Purpose: create a user board.

Payload:
{
  "name": "Sales Board",
  "description": "Sales follow-up workload",
  "visibility": "team"
}

Response:
{
  "id": 12,
  "name": "Sales Board",
  "description": "Sales follow-up workload",
  "visibility": "team",
  "created_by": 5,
  "created_at": "2026-09-09T12:00:00Z",
  "updated_at": "2026-09-09T12:00:00Z"
}

### PUT /api/tenant/task-boards/{board}
Purpose: rename or update board settings.

Payload:
{
  "name": "Sales Board Updated",
  "description": "Updated workload board",
  "visibility": "workspace"
}

### DELETE /api/tenant/task-boards/{board}
Purpose: delete or archive a board.

## Board Lists

### POST /api/tenant/task-boards/{board}/lists
Purpose: create a board list.

Payload:
{
  "name": "Follow Up",
  "position": 2
}

Response:
{
  "id": 55,
  "board_id": 12,
  "name": "Follow Up",
  "position": 2,
  "created_at": "2026-09-09T12:00:00Z",
  "updated_at": "2026-09-09T12:00:00Z"
}

### PUT /api/tenant/task-boards/{board}/lists/{list}
Purpose: rename and reorder a list.

### DELETE /api/tenant/task-boards/{board}/lists/{list}
Purpose: delete or archive a list.

## Task Board Positioning

### POST /api/tenant/task-boards/{board}/items
Purpose: associate a task with a board and list position.

Payload:
{
  "task_id": 101,
  "list_id": 55,
  "position": 0
}

Response:
{
  "id": 120,
  "board_id": 12,
  "list_id": 55,
  "task_id": 101,
  "position": 0
}

### PATCH /api/tenant/task-boards/{board}/items/{item}
Purpose: move task across lists or reorder within a list.

## Task Activity Log

### GET /api/tenant/tasks/{task}/activities
Purpose: fetch task history with actor, action, before, after, and timestamp.

Response:
[
  {
    "id": 88,
    "task_id": 101,
    "actor": { "id": 7, "name": "Moumen" },
    "action": "status_changed",
    "before": "pending",
    "after": "in_progress",
    "created_at": "2026-09-09T13:20:00Z"
  }
]

## Realtime Events

### task.created
Purpose: push task creation notifications to relevant UI listeners.

Payload:
{
  "task_id": 101,
  "board_id": 12
}

### task.updated
### task.deleted
### task.status_changed
### task.assigned
### task.unassigned
### task.reminder_triggered
### task_board.created
### task_board.updated
### task_board.deleted
### task_board_list.created
### task_board_list.updated
### task_board_list.deleted
### task_board_item.moved

These events should invalidate or update the TanStack Query cache for the affected task collections.

## Reminder Engine

### POST /api/tenant/tasks/{task}/reminders
Purpose: configure reminder metadata and backend scheduling.

Payload:
{
  "reminder_type": "system",
  "reminder_before": 30,
  "reminder_unit": "minutes"
}

Response:
{
  "id": 10,
  "task_id": 101,
  "reminder_type": "system",
  "reminder_before": 30,
  "reminder_unit": "minutes",
  "status": "scheduled"
}

Backend responsibility: schedule delivery and trigger Notification Center events when due time approaches.

## Bulk Actions

### POST /api/tenant/tasks/bulk-actions
Purpose: apply a bulk status, priority, assignee, or due-date update.

Payload:
{
  "task_ids": [1, 2, 3],
  "action": "assign_users",
  "users": [5, 6]
}

## Subtasks

### GET /api/tenant/tasks/{task}/checklists
### POST /api/tenant/tasks/{task}/checklists
### PATCH /api/tenant/tasks/{task}/checklists/{checklist}
### DELETE /api/tenant/tasks/{task}/checklists/{checklist}

Purpose: support checklist / subtask workflow under the task detail surface.

## Recurring Tasks

### POST /api/tenant/tasks/{task}/recurrence
Purpose: configure recurring task behavior.

Payload:
{
  "recurrence_type": "weekly",
  "recurrence_interval": 1,
  "recurrence_end_date": "2026-12-31"
}

## Server-side Filtering

### GET /api/tenant/tasks?status=...&priority=...&due_date=...&assigned=...&search=...
Purpose: support server-side filtering for large task datasets.

The frontend should pass filters as query params rather than loading a full unfiltered task list for every search.
