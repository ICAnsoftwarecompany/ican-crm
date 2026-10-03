/**
 * Deals' Workflow Engine registration (2026-10-03).
 *
 * Every trigger/action is `backendSupport: false`: the backend has no deal events or workflow runner yet
 * (docs/deals/DEALS-WORKSPACE-SPEC.md §9.7 lists the events it must emit). The builder can design deal
 * automations now; nothing runs until the backend executes them — the engine never fakes a run.
 */
import { registerWorkflowModule } from '../../workflow-engine/registry/workflowRegistry'

const trigger = (id, labelKey, icon, fields = []) => ({
  id: `deal.${id}`, type: 'trigger', module: 'deals', category: 'deal', labelKey: `workflow.deals.triggers.${labelKey}`,
  icon, eventName: `deal.${id}`, fields, backendSupport: false,
})

const condition = (id, operators, fields) => ({
  id: `deal.${id}`, type: 'condition', module: 'deals', labelKey: `workflow.deals.conditions.${id}`, operators, fields, backendSupport: false,
})

const action = (id, labelKey, icon, fields, recommended = false) => ({
  id: `deal.${id}`, type: 'action', module: 'deals', labelKey: `workflow.deals.actions.${labelKey}`, icon, fields, recommended, backendSupport: false,
})

const dealWorkflowDefinition = {
  module: 'deals',
  labelKey: 'workflow.modules.deals',
  icon: 'Handshake',
  triggers: [
    trigger('lead_added', 'leadAdded', 'UserPlus'),
    trigger('stage_changed', 'stageChanged', 'ArrowRightLeft', [{ key: 'to_stage', type: 'text', labelKey: 'workflow.deals.fields.toStage' }]),
    trigger('lead_won', 'leadWon', 'Trophy'),
    trigger('lead_lost', 'leadLost', 'XCircle'),
    trigger('lead_stale', 'leadStale', 'Hourglass', [{ key: 'days', type: 'number', labelKey: 'workflow.deals.fields.days', required: true }]),
    trigger('contract_created', 'contractCreated', 'FileSignature'),
    trigger('installment_due', 'installmentDue', 'CalendarClock', [{ key: 'days_before', type: 'number', labelKey: 'workflow.deals.fields.daysBefore', required: true }]),
    trigger('installment_overdue', 'installmentOverdue', 'AlertTriangle'),
  ],
  conditions: [
    condition('estimated_value', ['equals', 'greater_than', 'less_than'], [{ key: 'value', type: 'number' }]),
    condition('source', ['equals', 'not_equals'], [{ key: 'value', type: 'text' }]),
    condition('owner', ['equals', 'not_equals', 'is_empty'], [{ key: 'value', type: 'user', source: 'users' }]),
    condition('lost_reason', ['equals', 'not_equals'], [{ key: 'value', type: 'text' }]),
  ],
  actions: [
    action('assign_owner', 'assignOwner', 'UserCheck', [{ key: 'user_id', type: 'user', source: 'users', required: true }], true),
    action('change_stage', 'changeStage', 'ArrowRightLeft', [{ key: 'stage_id', type: 'text', labelKey: 'workflow.deals.fields.toStage', required: true }], true),
    action('create_task', 'createTask', 'ListTodo', [
      { key: 'title', type: 'variable_text', labelKey: 'workflow.deals.fields.title', required: true },
      { key: 'user_id', type: 'user', source: 'users' },
      { key: 'due_in_days', type: 'number', labelKey: 'workflow.deals.fields.dueInDays' },
    ], true),
    action('schedule_call', 'scheduleCall', 'PhoneCall', [{ key: 'user_id', type: 'user', source: 'users' }]),
    action('notify_team', 'notifyTeam', 'Bell', [{ key: 'message', type: 'variable_text', labelKey: 'workflow.deals.fields.message', required: true }]),
  ],
  variables: [
    { key: 'deal.name', labelKey: 'workflow.variables.dealName' },
    { key: 'deal_lead.name', labelKey: 'workflow.variables.dealLeadName' },
    { key: 'deal_lead.stage', labelKey: 'workflow.variables.dealLeadStage' },
    { key: 'contract.number', labelKey: 'workflow.variables.contractNumber' },
  ],
}

registerWorkflowModule(dealWorkflowDefinition)

export default dealWorkflowDefinition
