/**
 * Opportunities' Workflow Engine registration.
 *
 * Backend reality check: `features/opportunities/api/opportunitiesApi.js`
 * is entirely mock (`opportunitiesMockData` + `setTimeout`, no
 * `httpClient` call anywhere) — the Opportunity Center itself is
 * documented as a static-mock-data UI (see
 * features/opportunities/OPPORTUNITY_CENTER.md). Every action below is
 * therefore `backendSupport: false`; wiring a workflow action to the mock
 * API would create exactly the "fake successful workflow" the engine spec
 * forbids, so these actions are registered for the Builder UI/registry
 * completeness only — see docs "Backend Gaps".
 *
 * The product spec's "Stage"/"Move Opportunity Stage" concept doesn't
 * exist as a pipeline stage in this codebase — Opportunity Center uses a
 * flat `status` (new/reviewing/watching/qualified/activated/dismissed/
 * expired, see constants/opportunityTypes.js). Mapped onto that reality
 * rather than inventing a stage field that doesn't exist.
 */
import { registerWorkflowModule } from '../../workflow-engine/registry/workflowRegistry'

const opportunityWorkflowDefinition = {
  module: 'opportunities',
  labelKey: 'workflow.modules.opportunities',
  icon: 'Target',

  triggers: [
    {
      id: 'opportunity.created',
      type: 'trigger',
      module: 'opportunities',
      category: 'opportunity',
      labelKey: 'workflow.opportunities.triggers.created.label',
      icon: 'Target',
      eventName: 'opportunity.created',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'opportunity.status_changed',
      type: 'trigger',
      module: 'opportunities',
      category: 'opportunity',
      labelKey: 'workflow.opportunities.triggers.statusChanged.label',
      icon: 'RefreshCw',
      eventName: 'opportunity.status_changed',
      fields: [{ key: 'to_status', type: 'select', labelKey: 'workflow.opportunities.fields.toStatus', source: 'opportunity_statuses', required: true }],
      backendSupport: false,
    },
    {
      id: 'opportunity.won',
      type: 'trigger',
      module: 'opportunities',
      category: 'opportunity',
      labelKey: 'workflow.opportunities.triggers.won.label',
      icon: 'Trophy',
      eventName: 'opportunity.activated',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'opportunity.lost',
      type: 'trigger',
      module: 'opportunities',
      category: 'opportunity',
      labelKey: 'workflow.opportunities.triggers.lost.label',
      icon: 'XCircle',
      eventName: 'opportunity.dismissed',
      fields: [],
      backendSupport: false,
    },
  ],

  conditions: [
    {
      id: 'opportunity.status',
      type: 'condition',
      module: 'opportunities',
      labelKey: 'workflow.opportunities.conditions.status',
      operators: ['equals', 'not_equals', 'in', 'not_in'],
      fields: [{ key: 'value', type: 'select', source: 'opportunity_statuses' }],
      backendSupport: false,
    },
    {
      id: 'opportunity.value',
      type: 'condition',
      module: 'opportunities',
      labelKey: 'workflow.opportunities.conditions.value',
      operators: ['equals', 'greater_than', 'less_than'],
      fields: [{ key: 'value', type: 'number' }],
      backendSupport: false,
    },
    {
      id: 'opportunity.owner',
      type: 'condition',
      module: 'opportunities',
      labelKey: 'workflow.opportunities.conditions.owner',
      operators: ['equals', 'not_equals', 'is_empty'],
      fields: [{ key: 'value', type: 'user', source: 'users' }],
      backendSupport: false,
    },
  ],

  actions: [
    {
      id: 'opportunity.change_status',
      type: 'action',
      module: 'opportunities',
      labelKey: 'workflow.opportunities.actions.changeStatus.label',
      icon: 'RefreshCw',
      recommended: true,
      fields: [{ key: 'status', type: 'select', labelKey: 'workflow.opportunities.fields.newStatus', source: 'opportunity_statuses', required: true }],
      backendSupport: false,
    },
    {
      id: 'opportunity.assign_user',
      type: 'action',
      module: 'opportunities',
      labelKey: 'workflow.opportunities.actions.assignUser.label',
      icon: 'UserCheck',
      recommended: true,
      fields: [{ key: 'user_id', type: 'user', source: 'users', required: true }],
      backendSupport: false,
    },
    {
      id: 'opportunity.create',
      type: 'action',
      module: 'opportunities',
      labelKey: 'workflow.opportunities.actions.create.label',
      icon: 'Target',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'opportunity.add_note',
      type: 'action',
      module: 'opportunities',
      labelKey: 'workflow.opportunities.actions.addNote.label',
      icon: 'StickyNote',
      fields: [{ key: 'note', type: 'variable_text', labelKey: 'workflow.opportunities.fields.note', required: true }],
      backendSupport: false,
    },
  ],

  variables: [
    { key: 'opportunity.name', labelKey: 'workflow.variables.opportunityName' },
    { key: 'opportunity.value', labelKey: 'workflow.variables.opportunityValue' },
    { key: 'opportunity.status', labelKey: 'workflow.variables.opportunityStatus' },
  ],
}

registerWorkflowModule(opportunityWorkflowDefinition)

export default opportunityWorkflowDefinition
