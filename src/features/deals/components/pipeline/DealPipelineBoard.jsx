import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PipelineBoard } from '../../../../shared/components/pipeline-board'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { isWonStage } from '../../utils/dealStages'
import { DealLeadCard } from './DealLeadCard'

/**
 * Kanban of the deal's leads (shared PipelineBoard, long-press drag so a click still opens the card).
 * Moving between normal stages calls change-stage (optimistic). Dropping on a won/lost stage never moves
 * the card by itself: it opens the won/lost dialog, and only a confirmed close moves it (backend rules 1–2).
 */
export function DealPipelineBoard({ dealId, stages, leads, lanes, ownerNames, actions }) {
  const { t } = useTranslation()
  const { changeStage } = useDealLeadMutations(dealId)

  const handleMove = async (itemId, fromStageId, toStageId) => {
    const lead = leads.find((entry) => String(entry.id) === String(itemId))
    if (lead && lead.status !== 'open') {
      toast.error(t('dealWorkspace.pipeline.closedLeadMove'))
      return
    }
    try {
      await changeStage.mutateAsync({ dealLeadId: itemId, stageId: toStageId })
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.pipeline.moveFailed')))
    }
  }

  const handleTerminalDrop = ({ itemId, stage }) => {
    const lead = leads.find((entry) => String(entry.id) === String(itemId))
    if (!lead) return
    if (lead.status !== 'open') {
      toast.error(t('dealWorkspace.pipeline.alreadyClosed'))
      return
    }
    if (isWonStage(stage)) actions.onWon(lead, stage)
    else actions.onLost(lead, stage)
  }

  return (
    <PipelineBoard
      stages={stages}
      items={lanes ? lanes.items : leads}
      itemStageKey="stage_id"
      groupBy={lanes ? { key: 'laneId', lanes: lanes.lanes.map((lane) => ({ ...lane, label: lane.label || t('dealWorkspace.pipeline.noTeamLane') })) } : null}
      dragMode="longPress"
      columnWidth={272}
      columnBodyClassName="max-h-[calc(100vh-22rem)] overflow-y-auto"
      onItemMove={handleMove}
      onTerminalStageDrop={handleTerminalDrop}
      renderEmpty={() => (
        <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">{t('dealWorkspace.board.empty')}</div>
      )}
      renderCard={(lead) => <DealLeadCard lead={lead} ownerName={ownerNames.get(String(lead.ownerId)) || lead.ownerName} actions={actions} />}
    />
  )
}
