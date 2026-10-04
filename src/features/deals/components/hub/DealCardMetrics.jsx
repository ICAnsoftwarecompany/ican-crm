import { useTranslation } from 'react-i18next'
import { Clock3, Target, UserX } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { formatMoney } from '../../utils/dealMoney'

const compact = (value, language) => formatMoney(value, language, { notation: 'compact', maximumFractionDigits: 1 })

/** Revenue target bar with a marker at how much of the deal's period has passed. */
function TargetBar({ percent, elapsedPercent, tone }) {
  const { t } = useTranslation()
  const width = Math.max(0, Math.min(100, percent ?? 0))
  return (
    <div className="relative h-2 w-full rounded-full bg-[var(--surface-2)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={width}>
      <div className={cn('h-full rounded-full transition-[width]', tone)} style={{ width: `${width}%` }} />
      {elapsedPercent !== null && elapsedPercent !== undefined && elapsedPercent > 0 && elapsedPercent < 100 && (
        <span
          className="absolute -top-1 h-4 w-0.5 rounded-full bg-[var(--text)] opacity-60"
          style={{ insetInlineStart: `${elapsedPercent}%` }}
          title={t('dealWorkspace.hub.board.card.elapsed', { percent: elapsedPercent })}
        />
      )}
    </div>
  )
}

const BAR_TONES = { onTrack: 'bg-emerald-500', behind: 'bg-amber-500', atRisk: 'bg-red-500' }

function RevenueBlock({ stats, placeholder }) {
  const { t, i18n } = useTranslation()
  if (!stats.targetRevenue) {
    return <p className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]"><Target size={12} />{t('dealWorkspace.hub.board.card.noRevenueTarget')}</p>
  }
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-[var(--text-muted)]">{t('dealWorkspace.hub.board.card.wonRevenue')}</p>
          <p className="truncate text-sm font-bold text-[var(--text)]" dir="ltr" title={formatMoney(stats.wonRevenue ?? 0, i18n.language)}>
            {stats.wonRevenue === null ? placeholder : compact(stats.wonRevenue, i18n.language)}
            <span className="ms-1 text-xs font-medium text-[var(--text-muted)]">/ {compact(stats.targetRevenue, i18n.language)}</span>
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-[var(--text)]" dir="ltr">{stats.revenuePercent === null ? '—' : `${stats.revenuePercent}%`}</span>
      </div>
      <TargetBar percent={stats.revenuePercent} elapsedPercent={stats.timing?.elapsedPercent} tone={BAR_TONES[stats.health] || 'bg-[var(--brand-accent)]'} />
    </div>
  )
}

function LeadCell({ label, value, tone, placeholder }) {
  return (
    <div className="min-w-0 rounded-md bg-[var(--surface-2)] px-1.5 py-1 text-center">
      <p className={cn('text-sm font-bold leading-5', tone || 'text-[var(--text)]')} dir="ltr">{value ?? placeholder}</p>
      <p className="truncate text-[10px] text-[var(--text-muted)]">{label}</p>
    </div>
  )
}

/** Revenue vs target, leads breakdown, open pipeline value, win rate and alerts of one deal card. */
export function DealCardMetrics({ stats, isLoading = false }) {
  const { t, i18n } = useTranslation()
  const { leads } = stats
  // Leads not loaded: "…" while the hub is still fetching, "—" when this deal is past the quick-info limit.
  const placeholder = isLoading ? '…' : '—'
  return (
    <div className="space-y-2.5">
      <RevenueBlock stats={stats} placeholder={placeholder} />

      <div className="grid grid-cols-4 gap-1">
        <LeadCell label={t('dealWorkspace.hub.board.card.leads')} value={stats.targetLeads ? `${leads.total}/${compact(stats.targetLeads, i18n.language)}` : leads.total} />
        <LeadCell label={t('dealWorkspace.options.leadStatus.open')} value={leads.open} placeholder={placeholder} tone="text-[var(--status-new)]" />
        <LeadCell label={t('dealWorkspace.options.leadStatus.won')} value={leads.won} placeholder={placeholder} tone="text-[var(--status-won)]" />
        <LeadCell label={t('dealWorkspace.options.leadStatus.lost')} value={leads.lost} placeholder={placeholder} tone="text-[var(--status-lost)]" />
      </div>

      {stats.loaded && (stats.openValue > 0 || stats.winRate !== null) && (
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span className="min-w-0 truncate">
            {t('dealWorkspace.hub.board.card.pipeline')}: <span dir="ltr" className="font-semibold text-[var(--text)]">{compact(stats.openValue, i18n.language)}</span>
          </span>
          {stats.winRate !== null && (
            <span className="shrink-0">{t('dealWorkspace.hub.board.card.winRate')}: <span dir="ltr" className="font-semibold text-[var(--text)]">{stats.winRate}%</span></span>
          )}
        </div>
      )}

      {(stats.unassigned > 0 || stats.stale > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {stats.unassigned > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <UserX size={12} />{t('dealWorkspace.hub.board.card.unassigned', { count: stats.unassigned })}
            </span>
          )}
          {stats.stale > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              <Clock3 size={12} />{t('dealWorkspace.hub.board.card.stale', { count: stats.stale })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
