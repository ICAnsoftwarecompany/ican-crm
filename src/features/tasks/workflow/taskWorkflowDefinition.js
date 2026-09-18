/**
 * Tasks' Workflow Engine registration.
 *
 * Backend reality check: `features/tasks/api/tasksApi.js` is a real,
 * complete REST API (`/api/tenant/tasks`) — create/update/assign-users/
 * change-status all exist, so these actions are `backendSupport: true`.
 * Triggers remain `false` — no domain-event/webhook system exists yet for
 * any module (see docs "Backend Gaps").
 */
import { registerWorkflowModule } from '../../workflow-engine/registry/workflowRegistry'

const taskWorkflowDefinition = {
  module: 'tasks',
  labelKey: 'workflow.modules.tasks',
  icon: 'CheckSquare',

  triggers: [
    {
      id: 'task.created',
      type: 'trigger',
      module: 'tasks',
      category: 'task',
      labelKey: 'workflow.tasks.triggers.created.label',
      icon: 'Plus',
      eventName: 'task.created',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'task.assigned',
      type: 'trigger',
      module: 'tasks',
      category: 'task',
      labelKey: 'workflow.tasks.triggers.assigned.label',
      icon: 'UserCheck',
      eventName: 'task.assigned',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'task.due',
      type: 'trigger',
      module: 'tasks',
      category: 'task',
      labelKey: 'workflow.tasks.triggers.due.label',
      icon: 'CalendarClock',
      eventName: 'task.due',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'task.overdue',
      type: 'trigger',
      module: 'tasks',
      category: 'task',
      labelKey: 'workflow.tasks.triggers.overdue.label',
      icon: 'AlertTriangle',
      eventName: 'task.overdue',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'task.completed',
      type: 'trigger',
      module: 'tasks',
      category: 'task',
      labelKey: 'workflow.tasks.triggers.completed.label',
      icon: 'CheckCircle2',
      eventName: 'task.completed',
      fields: [],
      backendSupport: false,
    },
  ],

  conditions: [
    {
      id: 'task.priority',
      type: 'condition',
      module: 'tasks',
      labelKey: 'workflow.tasks.conditions.priority',
      operators: ['equals', 'not_equals'],
      fields: [{ key: 'value', type: 'text' }],
      backendSupport: true,
    },
    {
      id: 'task.status',
      type: 'condition',
      module: 'tasks',
      labelKey: 'workflow.tasks.conditions.status',
      operators: ['equals', 'not_equals'],
      fields: [{ key: 'value', type: 'text' }],
      backendSupport: true,
    },
    {
      id: 'task.assigned_user',
      type: 'condition',
      module: 'tasks',
      labelKey: 'workflow.tasks.conditions.assignedUser',
      operators: ['equals', 'not_equals', 'is_empty'],
      fields: [{ key: 'value', type: 'user', source: 'users' }],
      backendSupport: true,
    },
  ],

  actions: [
    {
      id: 'task.create',
      type: 'action',
      module: 'tasks',
      labelKey: 'workflow.tasks.actions.create.label',
      icon: 'Plus',
      recommended: true,
      fields: [
        { key: 'title', type: 'text', labelKey: 'workflow.tasks.fields.title', required: true },
        { key: 'description', type: 'variable_text', labelKey: 'workflow.tasks.fields.description' },
        { key: 'assigned_to', type: 'user', labelKey: 'workflow.tasks.fields.assignedTo', source: 'users' },
        { key: 'priority', type: 'text', labelKey: 'workflow.tasks.fields.priority' },
      ],
      backendSupport: true,
    },
    {
      id: 'task.assign',
      type: 'action',
      module: 'tasks',
      labelKey: 'workflow.tasks.actions.assign.label',
      icon: 'UserCheck',
      fields: [{ key: 'user_id', type: 'user', source: 'users', required: true }],
      backendSupport: true,
    },
    {
      id: 'task.change_status',
      type: 'action',
      module: 'tasks',
      labelKey: 'workflow.tasks.actions.changeStatus.label',
      icon: 'RefreshCw',
      fields: [{ key: 'status', type: 'text', labelKey: 'workflow.tasks.fields.newStatus', required: true }],
      backendSupport: true,
    },
    {
      id: 'task.change_priority',
      type: 'action',
      module: 'tasks',
      labelKey: 'workflow.tasks.actions.changePriority.label',
      icon: 'Flag',
      fields: [{ key: 'priority', type: 'text', labelKey: 'workflow.tasks.fields.priority', required: true }],
      backendSupport: false,
    },
  ],

  variables: [
    { key: 'task.title', labelKey: 'workflow.variables.taskTitle' },
    { key: 'task.status', labelKey: 'workflow.variables.taskStatus' },
    { key: 'task.priority', labelKey: 'workflow.variables.taskPriority' },
  ],
}

registerWorkflowModule(taskWorkflowDefinition)

export default taskWorkflowDefinition
