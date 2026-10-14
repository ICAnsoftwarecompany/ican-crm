import { WorkflowModuleWorkspace } from '../../workflow-engine'
import { getCommunicationModule } from '../constants/communicationModules'

/**
 * The shared Workflow Engine builder, opened in this module's context. Triggers/actions specific
 * to the module appear once it registers a workflow definition in
 * features/workflow-engine/config/registerBuiltinModules.js; until then the builder offers the
 * cross-module triggers and actions.
 */
export function CommunicationAutomation({ moduleId }) {
  const module = getCommunicationModule(moduleId)
  return <WorkflowModuleWorkspace context={{ ...module.workflowContext, source: `${module.id}-automation` }} />
}
