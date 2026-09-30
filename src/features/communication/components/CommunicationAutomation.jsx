import { WorkflowBuilder, WorkflowLocalStorageNotice } from '../../workflow-engine'
import { getCommunicationModule } from '../constants/communicationModules'

/**
 * The shared Workflow Engine builder, opened in this module's context (same pattern as Outreach's
 * workflow tab). Triggers/actions specific to the module appear once the module registers a
 * workflow definition in features/workflow-engine/config/registerBuiltinModules.js; until then the
 * builder offers the cross-module triggers and actions.
 */
export function CommunicationAutomation({ moduleId }) {
  const module = getCommunicationModule(moduleId)

  return (
    <>
      <WorkflowLocalStorageNotice />
      <div className="h-[min(75vh,780px)] min-h-[480px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <WorkflowBuilder
          mode="context"
          context={{ ...module.workflowContext, source: `${module.id}-automation` }}
          embedded
        />
      </div>
    </>
  )
}
