import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Inbox, TriangleAlert } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { useHandoffs } from '../api/handoffsApi'
import { HANDOFF_STATUS_TONE } from './HandoffStatus'

const TABS = ['pending', 'needs_review', 'accepted', 'active', 'rejected']

/** Handoff inbox for the service team: new contracts to accept, items to review. */
export function HandoffsWorkspace({ detailPath }) {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState('pending')
  const query = useHandoffs({ status })
  const counts = query.data?.meta?.counts || {}
  const items = query.data?.data || []
  const money = (value, currency) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: currency || 'EGP', maximumFractionDigits: 0 }).format(value || 0)

  return (
    <div className="grid gap-4">
      <div role="tablist" aria-label={t('service.hub.handoffs')} className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => setStatus(key)}
            className={cn('inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm', status === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]')}
          >
            {t(`service.handoffs.statuses.${key}`)}
            {counts[key] != null && <span className="rounded-full bg-[var(--surface-2)] px-1.5 text-xs text-[var(--text-muted)]" dir="ltr">{counts[key]}</span>}
          </button>
        ))}
      </div>
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch} empty={!items.length} emptyIcon={<Inbox size={24} />} emptyTitle={t('service.handoffs.empty')}>
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((handoff) => (
            <li key={handoff.id}>
              <Link to={detailPath(handoff)} className="grid gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent">
                <span className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{handoff.contract?.contract_number}</span>
                  <span className={cn('font-medium', HANDOFF_STATUS_TONE[handoff.status])}>{t(`service.handoffs.statuses.${handoff.status}`)}</span>
                </span>
                <span className="text-sm font-semibold text-[var(--text)]">{handoff.customer?.name}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  <span dir="ltr">{money(handoff.contract?.total_value, handoff.contract?.currency)}</span> · {t('service.handoffs.createdCount', { count: handoff.created_entities.length })} · <bdi>{handoff.sales_owner?.name}</bdi> · {formatRelativeTime(handoff.created_at, i18n.language)}
                </span>
                {handoff.errors.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-sla-at-risk">
                    <TriangleAlert size={12} aria-hidden="true" />
                    {t('service.handoffs.reviewCount', { count: handoff.errors.length })}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
    </div>
  )
}
