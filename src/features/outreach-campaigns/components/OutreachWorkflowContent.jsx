import { WorkflowBuilder, WorkflowLocalStorageNotice } from '../../workflow-engine'

export function OutreachWorkflowContent() {
  return (
    <>
      <WorkflowLocalStorageNotice />
      <div className="h-[min(75vh,780px)] min-h-[480px] overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        <WorkflowBuilder mode="context" context={{ module: 'outreach-campaigns', entity: 'campaign', source: 'outreach-workflow' }} embedded />
      </div>
    </>
  )
}
