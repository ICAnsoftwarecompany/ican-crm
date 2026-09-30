import { WorkflowBuilder } from './WorkflowBuilder'
import { WorkflowLocalStorageNotice } from './WorkflowLocalStorageNotice'

/**
 * The shared automation flow embedded as a full page inside a module (added 2026-10-01).
 * Used by the Leads Center (/LeadsCenter/automation) and every Communication hub module
 * (/<module>/automation). `context.module` should be a registered workflow module id to get that
 * module's own triggers/actions first; unknown ids still get the cross-module ones.
 */
export function WorkflowModuleWorkspace({ context }) {
  return (
    <>
      <WorkflowLocalStorageNotice />
      <div className="h-[min(75vh,780px)] min-h-[480px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <WorkflowBuilder mode="context" context={context} embedded />
      </div>
    </>
  )
}
