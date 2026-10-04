import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, History, Package, Users } from 'lucide-react'
import { Avatar } from '../../../../shared/components/ui/Avatar'
import { Badge } from '../../../../shared/components/ui/Badge'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { DealStatusBadge } from '../common/DealStatusBadge'
import { DealCardMetrics } from './DealCardMetrics'
import { useQuickInfoLabels } from './DealQuickInfo'

const HEALTH_VARIANTS = { onTrack: 'success', behind: 'warning', atRisk: 'danger' }

function timingText(t, timing) {
  if (!timing) return t('dealWorkspace.hub.board.card.timing.noDates')
  if (timing.phase === 'upcoming') return t('dealWorkspace.hub.board.card.timing.upcoming', { count: timing.days })
  if (timing.phase === 'ended') return timing.days ? t('dealWorkspace.hub.board.card.timing.ended', { count: timing.days }) : t('dealWorkspace.hub.board.card.timing.endedToday')
  if (timing.days === null) return t('dealWorkspace.hub.board.card.timing.noEnd')
  return timing.days <= 1 ? t('dealWorkspace.hub.board.card.timing.endsToday') : t('dealWorkspace.hub.board.card.timing.running', { count: timing.days })
}

function FactChip({ icon: Icon, warn, title, children }) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
        warn ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
      )}
    >
      <Icon size={12} className="shrink-0" /><span className="truncate">{children}</span>
    </span>
  )
}

/**
 * A deal on the hub board (a link to its workspace): status accent, name and type, health vs period,
 * owner, time left, revenue vs target (with a marker at the elapsed time), leads breakdown, open pipeline,
 * win rate, alerts, products / team and the last action.
 */
export function DealCard({ deal, info, stats, accent, isLoading = false, showStatus = false }) {
  const { t, i18n } = useTranslation()
  const labels = useQuickInfoLabels()
  const owner = deal.owner?.name || deal.owner_name || ''
  const timing = stats.timing
  const period = deal.start_date || deal.end_date
    ? `${deal.start_date ? formatDate(deal.start_date, i18n.language) : '—'} → ${deal.end_date ? formatDate(deal.end_date, i18n.language) : '—'}`
    : ''
  const timingTone = timing?.phase === 'running' && timing.days !== null && timing.days <= 7 ? 'text-[var(--status-lost)]' : 'text-[var(--text-muted)]'

  return (
    <Link
      to={`/deals/${deal.id}`}
      className="group relative block w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-start shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-accent)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
    >
      <span aria-hidden className="absolute inset-y-0 start-0 w-1" style={{ backgroundColor: accent || 'var(--border)' }} />
      <div className="space-y-3 p-3 ps-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand-accent)]" title={deal.name}>{deal.name || `#${deal.id}`}</p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">
              {deal.type ? t(`dealWorkspace.options.dealType.${deal.type}`, deal.type) : ''}
              <span dir="ltr" className="ms-1 opacity-70">#{deal.id}</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {showStatus && <DealStatusBadge status={deal.status} className="text-[11px]" />}
            {stats.health && (
              <span title={t('dealWorkspace.hub.board.card.healthHint')}>
                <Badge variant={HEALTH_VARIANTS[stats.health]} className="px-2 text-[11px]">{t(`dealWorkspace.hub.board.card.health.${stats.health}`)}</Badge>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[var(--text)]">
            <Avatar name={owner || '?'} size="sm" className="h-6 w-6 shrink-0 text-[10px]" />
            <span className={cn('truncate', !owner && 'text-[var(--text-muted)]')}>{owner || t('dealWorkspace.quickInfo.noOwner')}</span>
          </span>
          <span className={cn('inline-flex shrink-0 items-center gap-1 font-medium', timingTone)} title={period}>
            <CalendarClock size={12} />{timingText(t, timing)}
          </span>
        </div>

        <DealCardMetrics stats={stats} isLoading={isLoading} />

        <div className="space-y-1.5 border-t border-[var(--border)] pt-2">
          <div className="flex flex-wrap gap-1">
            <FactChip icon={Package} warn={info?.productsCount === 0} title={t('dealWorkspace.quickInfo.products')}>{labels.products(info)}</FactChip>
            <FactChip icon={Users} warn={info?.teamCount === 0} title={t('dealWorkspace.quickInfo.team')}>{labels.team(info)}</FactChip>
          </div>
          <p className="flex min-w-0 items-center gap-1 text-[11px] text-[var(--text-muted)]" title={t('dealWorkspace.quickInfo.lastAction')}>
            <History size={11} className="shrink-0" /><span className="truncate">{labels.lastAction(info)}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
