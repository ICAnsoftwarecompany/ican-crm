import { useMemo } from 'react'
import { WorkflowBuilder, useWorkflowStore } from '../../../features/workflow-engine'

/**
 * Proof of module embedding (see docs section 63/"UI Reuse in Outreach
 * Campaigns") — this is the ENTIRE integration: find any local draft
 * already tied to this campaign, otherwise let the Builder start empty,
 * and render it in context mode. No separate Campaign Sequence Builder
 * exists or is built here.
 */
export function CampaignAutomationTab({ campaign }) {
  const workflowStore = useWorkflowStore()

  const existingWorkflow = useMemo(
    () => workflowStore.list().find((workflow) => workflow.context?.module === 'outreach-campaigns' && String(workflow.context?.entityId) === String(campaign.id)) || null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [campaign.id, workflowStore.workflows]
  )

  return (
    <div className="h-[70vh] overflow-hidden rounded-lg border border-[var(--border)]">
      <WorkflowBuilder
        mode="context"
        context={{ module: 'outreach-campaigns', entity: 'campaign', entityId: campaign.id, source: 'campaign-details' }}
        initialWorkflow={existingWorkflow}
        embedded
      />
    </div>
  )
}
