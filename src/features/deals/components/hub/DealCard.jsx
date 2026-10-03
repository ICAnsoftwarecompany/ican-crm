import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarRange, UserRound } from 'lucide-react'
import { formatMoney, progressPercent } from '../../utils/dealMoney'
import { DealStatusBadge } from '../common/DealStatusBadge'
import { ProgressBar } from '../common/ProgressBar'
import { DealQuickInfo } from './DealQuickInfo'

/** A deal on the hub board (a link to its workspace): name, type, owner, period, leads progress, revenue target and quick info. */
export function DealCard({ deal, info, showStatus = false }) {
  const { t, i18n } = useTranslation()
  return (
    <Link
      to={`/deals/${deal.id}`}
      className="block w-full space-y-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-start shadow-sm transition-colors hover:border-[var(--brand-accent)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--text)]">{deal.name || `#${deal.id}`}</p>
          {deal.type && <p className="text-xs text-[var(--text-muted)]">{t(`dealWorkspace.options.dealType.${deal.type}`, deal.type)}</p>}
        </div>
        {showStatus && <DealStatusBadge status={deal.status} />}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1"><UserRound size={12} />{deal.owner?.name || deal.owner_name || t('dealWorkspace.quickInfo.noOwner')}</span>
        {(deal.start_date || deal.end_date) && (
          <span className="inline-flex items-center gap-1" dir="ltr"><CalendarRange size={12} />{String(deal.start_date || '—').slice(0, 10)} → {String(deal.end_date || '—').slice(0, 10)}</span>
        )}
      </div>
      <ProgressBar value={progressPercent(deal.leadsCount, deal.target_leads)} label={<span dir="ltr">{deal.leadsCount} / {deal.target_leads ?? '—'}</span>} />
      {deal.target_revenue != null && (
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.fields.revenue')}: <span dir="ltr" className="font-semibold text-[var(--text)]">{formatMoney(deal.target_revenue, i18n.language)}</span></p>
      )}
      <DealQuickInfo info={info} layout="stack" />
    </Link>
  )
}
