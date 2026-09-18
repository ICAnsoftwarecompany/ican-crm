/**
 * Leads' Workflow Engine registration. This file only DESCRIBES
 * capabilities (triggers/conditions/actions/variables) — it contains no
 * engine logic of its own; see
 * src/features/workflow-engine/docs/WORKFLOW_ENGINE_ARCHITECTURE_AR.md
 * "طريقة إضافة Module جديد".
 *
 * Backend reality check (see that doc's "Backend Gaps" for the full audit):
 * - No domain-event/webhook system exists anywhere in this app today, so
 *   every TRIGGER below is `backendSupport: false` — this is true for
 *   every module's triggers, not specific to Leads.
 * - `lead.status.change` is real (`leadsApi.saveAction` — used today by
 *   StatusQuickAction.jsx).
 * - `lead.tag.add`/`lead.tag.remove` are real (`leadsApi.updateTag`).
 * - `lead.assign_user` is real (`leadAssignmentApi.distributeManually` —
 *   manual single-lead distribution, not the assignment-*rules* API).
 * - `lead.create_opportunity` is NOT real — Opportunities has no backend
 *   yet (`features/opportunities/api/opportunitiesApi.js` resolves against
 *   local mock data only).
 * - `task.create` is a cross-module action, real via `tasksApi.createTask`
 *   (see features/tasks/workflow/taskWorkflowDefinition.js).
 */
import { registerWorkflowModule } from '../../workflow-engine/registry/workflowRegistry'

const leadWorkflowDefinition = {
  module: 'leads',
  labelKey: 'workflow.modules.leads',
  icon: 'Users',

  triggers: [
    {
      id: 'lead.created',
      type: 'trigger',
      module: 'leads',
      category: 'lead',
      labelKey: 'workflow.leads.triggers.created.label',
      descriptionKey: 'workflow.leads.triggers.created.description',
      icon: 'UserPlus',
      eventName: 'lead.created',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'lead.updated',
      type: 'trigger',
      module: 'leads',
      category: 'lead',
      labelKey: 'workflow.leads.triggers.updated.label',
      icon: 'Pencil',
      eventName: 'lead.updated',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'lead.status_changed',
      type: 'trigger',
      module: 'leads',
      category: 'lead',
      labelKey: 'workflow.leads.triggers.statusChanged.label',
      descriptionKey: 'workflow.leads.triggers.statusChanged.description',
      icon: 'RefreshCw',
      eventName: 'lead.status_changed',
      fields: [
        { key: 'from_status', type: 'select', labelKey: 'workflow.leads.fields.fromStatus', source: 'lead_statuses', required: false },
        { key: 'to_status', type: 'select', labelKey: 'workflow.leads.fields.toStatus', source: 'lead_statuses', required: true },
      ],
      backendSupport: false,
    },
    {
      id: 'lead.assigned',
      type: 'trigger',
      module: 'leads',
      category: 'lead',
      labelKey: 'workflow.leads.triggers.assigned.label',
      icon: 'UserCheck',
      eventName: 'lead.assigned',
      fields: [{ key: 'assigned_user', type: 'user', labelKey: 'workflow.leads.fields.assignedUser', required: false }],
      backendSupport: false,
    },
  ],

  conditions: [
    {
      id: 'lead.status',
      type: 'condition',
      module: 'leads',
      labelKey: 'workflow.leads.conditions.status',
      operators: ['equals', 'not_equals', 'in', 'not_in'],
      fields: [{ key: 'value', type: 'select', source: 'lead_statuses' }],
      backendSupport: true,
    },
    {
      id: 'lead.source',
      type: 'condition',
      module: 'leads',
      labelKey: 'workflow.leads.conditions.source',
      operators: ['equals', 'not_equals', 'contains'],
      fields: [{ key: 'value', type: 'text' }],
      backendSupport: true,
    },
    {
      id: 'lead.assigned_user',
      type: 'condition',
      module: 'leads',
      labelKey: 'workflow.leads.conditions.assignedUser',
      operators: ['equals', 'not_equals', 'is_empty', 'is_not_empty'],
      fields: [{ key: 'value', type: 'user', source: 'users' }],
      backendSupport: true,
    },
    {
      id: 'lead.tags',
      type: 'condition',
      module: 'leads',
      labelKey: 'workflow.leads.conditions.tags',
      operators: ['contains', 'not_contains'],
      fields: [{ key: 'value', type: 'select', source: 'tags' }],
      backendSupport: true,
    },
  ],

  actions: [
    {
      id: 'lead.change_status',
      type: 'action',
      module: 'leads',
      labelKey: 'workflow.leads.actions.changeStatus.label',
      icon: 'RefreshCw',
      recommended: true,
      fields: [{ key: 'status_id', type: 'select', labelKey: 'workflow.leads.fields.newStatus', source: 'lead_statuses', required: true }],
      backendSupport: true,
    },
    {
      id: 'lead.assign_user',
      type: 'action',
      module: 'leads',
      labelKey: 'workflow.leads.actions.assignUser.label',
      icon: 'UserCheck',
      recommended: true,
      fields: [{ key: 'user_id', type: 'user', labelKey: 'workflow.leads.fields.assignedUser', source: 'users', required: true }],
      backendSupport: true,
    },
    {
      id: 'lead.add_tag',
      type: 'action',
      module: 'leads',
      labelKey: 'workflow.leads.actions.addTag.label',
      icon: 'Tag',
      fields: [{ key: 'tag_id', type: 'select', labelKey: 'workflow.leads.fields.tag', source: 'tags', required: true }],
      backendSupport: true,
    },
    {
      id: 'lead.remove_tag',
      type: 'action',
      module: 'leads',
      labelKey: 'workflow.leads.actions.removeTag.label',
      icon: 'Tag',
      fields: [{ key: 'tag_id', type: 'select', labelKey: 'workflow.leads.fields.tag', source: 'tags', required: true }],
      backendSupport: true,
    },
    {
      id: 'lead.create_opportunity',
      type: 'action',
      module: 'leads',
      labelKey: 'workflow.leads.actions.createOpportunity.label',
      icon: 'Target',
      fields: [],
      backendSupport: false,
    },
  ],

  variables: [
    { key: 'lead.name', labelKey: 'workflow.variables.leadName' },
    { key: 'lead.phone', labelKey: 'workflow.variables.leadPhone' },
    { key: 'lead.email', labelKey: 'workflow.variables.leadEmail' },
    { key: 'lead.source', labelKey: 'workflow.variables.leadSource' },
    { key: 'lead.status', labelKey: 'workflow.variables.leadStatus' },
  ],
}

registerWorkflowModule(leadWorkflowDefinition)

export default leadWorkflowDefinition
