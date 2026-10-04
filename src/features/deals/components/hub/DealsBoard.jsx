import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { PipelineBoard } from '../../../../shared/components/pipeline-board'
import { DEAL_STATUSES, DEAL_TYPES } from '../../constants/dealOptions'
import { buildDealCardStats, sortDealsForBoard, summarizeDealColumn } from '../../utils/dealBoardStats'
import { formatMoney } from '../../utils/dealMoney'
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

function ColumnSummary({ summary }) {
  const { t, i18n } = useTranslation()
  const money = (value) => formatMoney(value, i18n.language, { notation: 'compact', maximumFractionDigits: 1 })
  if (!summary.count) return null
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
      {summary.targetRevenue > 0 && (
        <span>{t('dealWorkspace.hub.board.column.target')}: <span dir="ltr" className="font-semibold text-[var(--text)]">{money(summary.targetRevenue)}</span></span>
      )}
      {summary.wonRevenue !== null && (
        <span>{t('dealWorkspace.hub.board.column.won')}: <span dir="ltr" className="font-semibold text-[var(--status-won)]">{money(summary.wonRevenue)}</span></span>
      )}
      {summary.attention > 0 && (
        <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
          <AlertTriangle size={11} />{t('dealWorkspace.hub.board.column.attention', { count: summary.attention })}
        </span>
      )}
    </div>
  )
}

/**
 * Every deal as a board (read-only): one column per status, or per type, each with its totals (revenue
 * targets, won revenue, deals needing attention). A card opens the deal's workspace.
 * Status changes stay in the deal's settings (the update endpoint takes the whole deal, not a status move).
 */
export function DealsBoard({ deals, infos, leadsByDeal, isLoading = false, groupBy = 'status', sort = 'newest' }) {
  const { t } = useTranslation()
  const stageKey = groupBy === 'type' ? 'type' : 'statusValue'

  const statsById = useMemo(() => {
    const now = new Date()
    return new Map(deals.map((deal) => [String(deal.id), buildDealCardStats({ deal, leads: leadsByDeal?.get(String(deal.id)) ?? null, now })]))
  }, [deals, leadsByDeal])
  const sorted = useMemo(() => sortDealsForBoard(deals, statsById, sort), [deals, sort, statsById])

  const columns = useMemo(() => {
    const values = groupBy === 'type' ? DEAL_TYPES : DEAL_STATUSES
    const known = new Set(values)
    const extra = [...new Set(deals.map((deal) => deal[stageKey]).filter((value) => value && !known.has(value)))]
    return [...values, ...extra].map((value) => {
      const summary = summarizeDealColumn(deals.filter((deal) => deal[stageKey] === value).map((deal) => statsById.get(String(deal.id))))
      return {
        id: value,
        name: groupBy === 'type' ? t(`dealWorkspace.options.dealType.${value}`, value) : t(`dealWorkspace.options.dealStatus.${value}`, value),
        color: (groupBy === 'type' ? TYPE_COLORS : STATUS_COLORS)[value],
        headerSummary: summary.count ? <ColumnSummary summary={summary} /> : null,
      }
    })
  }, [deals, groupBy, stageKey, statsById, t])

  return (
    <PipelineBoard
      stages={columns}
      items={sorted}
      itemStageKey={stageKey}
      isInteractive={false}
      wrapColumns
      minColumnWidth={250}
      renderEmpty={() => <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">{t('dealWorkspace.hub.board.empty')}</div>}
      renderCard={(deal) => (
        <DealCard
          deal={deal}
          info={infos.get(String(deal.id))}
          stats={statsById.get(String(deal.id))}
          accent={STATUS_COLORS[deal.statusValue]}
          isLoading={isLoading}
          showStatus={groupBy === 'type'}
        />
      )}
    />
  )
}
