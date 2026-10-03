import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PipelineBoard } from '../../../../shared/components/pipeline-board'
import { DEAL_STATUSES, DEAL_TYPES } from '../../constants/dealOptions'
import { DealCard } from './DealCard'

// Column dots reuse the lead-status tokens (semantic, themed for light and dark).
const STATUS_COLORS = {
  draft: 'var(--text-muted)',
  active: 'var(--status-won)',
  paused: 'var(--status-contacted)',
  completed: 'var(--status-qualified)',
  cancelled: 'var(--status-lost)',
}
const TYPE_COLORS = { sales: 'var(--status-new)', campaign: 'var(--status-contacted)', project: 'var(--status-qualified)' }

/**
 * Every deal as a board (read-only): one column per status, or per type. A card opens the deal's workspace.
 * Status changes stay in the deal's settings (the update endpoint takes the whole deal, not a status move).
 */
export function DealsBoard({ deals, infos, groupBy = 'status' }) {
  const { t } = useTranslation()
  const columns = useMemo(() => {
    const values = groupBy === 'type' ? DEAL_TYPES : DEAL_STATUSES
    const known = new Set(values)
    const extra = [...new Set(deals.map((deal) => deal[groupBy === 'type' ? 'type' : 'statusValue']).filter((value) => value && !known.has(value)))]
    return [...values, ...extra].map((value) => ({
      id: value,
      name: groupBy === 'type' ? t(`dealWorkspace.options.dealType.${value}`, value) : t(`dealWorkspace.options.dealStatus.${value}`, value),
      color: (groupBy === 'type' ? TYPE_COLORS : STATUS_COLORS)[value],
    }))
  }, [deals, groupBy, t])

  return (
    <PipelineBoard
      stages={columns}
      items={deals}
      itemStageKey={groupBy === 'type' ? 'type' : 'statusValue'}
      isInteractive={false}
      columnWidth={288}
      columnBodyClassName="max-h-[calc(100vh-20rem)] overflow-y-auto"
      renderEmpty={() => <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">{t('dealWorkspace.hub.board.empty')}</div>}
      renderCard={(deal) => <DealCard deal={deal} info={infos.get(String(deal.id))} showStatus={groupBy === 'type'} />}
    />
  )
}
