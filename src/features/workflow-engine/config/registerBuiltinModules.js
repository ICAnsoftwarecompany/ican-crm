/**
 * Side-effect-only module: importing it registers every built-in module's
 * workflow capabilities. Imported once from index.js so any consumer of
 * the public workflow-engine API (WorkflowBuilder, WorkflowLauncher,
 * useWorkflowBuilder, the registry itself) gets a fully populated registry
 * without the app's bootstrap code needing to know about individual
 * modules — see docs "طريقة إضافة Module جديد".
 */
import { registerWorkflowModule } from '../registry/workflowRegistry'
import './registerDataSources'
import '../../leads/workflow/leadWorkflowDefinition'
import '../../opportunities/workflow/opportunityWorkflowDefinition'
import '../../outreach-campaigns/workflow/outreachWorkflowDefinition'
import '../../tasks/workflow/taskWorkflowDefinition'

/**
 * No Notifications feature exists anywhere in this codebase yet (checked —
 * no API, no UI). "Send Notification" is named as a common action across
 * several spec sections (Opportunities, Tasks, Customer Service), so it's
 * registered here — under a small standalone module rather than folded
 * into an unrelated feature — purely so it exists in the registry as a
 * cross-module option. It is `backendSupport: false`; wiring it up is a
 * documented backend requirement (see WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md).
 */
registerWorkflowModule({
  module: 'notifications',
  labelKey: 'workflow.modules.notifications',
  icon: 'Bell',
  triggers: [],
  conditions: [],
  actions: [
    {
      id: 'notification.send',
      type: 'action',
      module: 'notifications',
      labelKey: 'workflow.notifications.actions.send.label',
      icon: 'Bell',
      fields: [
        { key: 'user_id', type: 'user', labelKey: 'workflow.notifications.fields.recipient', source: 'users', required: true },
        { key: 'message', type: 'variable_text', labelKey: 'workflow.notifications.fields.message', required: true },
      ],
      backendSupport: false,
    },
  ],
  variables: [],
})
