import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { useHealthList } from '../api/healthApi'
import { BAND_TONE } from './HealthScoreCard'

/** Lowest health scores first, with the biggest reason for each. */
export function AtRiskCustomers({ limit = 8 }) {
  const { t } = useTranslation()
  const list = useHealthList({ limit })
  const counts = list.data?.meta?.counts
  return (
    <div className="grid gap-3">
      {counts && (
        <dl className="grid grid-cols-3 gap-2 text-xs">
          {['healthy', 'watch', 'at_risk'].map((band) => (
            <div key={band} className="grid rounded-md bg-[var(--surface-2)] px-3 py-2"><dt className="text-[var(--text-muted)]">{t(`service.health.bands.${band}`)}</dt><dd className={cn('text-lg font-bold', BAND_TONE[band])}>{counts[band]}</dd></div>
          ))}
        </dl>
      )}
      <ResourceState isLoading={list.isLoading} error={list.error} onRetry={list.refetch} empty={!list.data?.data?.length} emptyTitle={t('service.health.empty')}>
        <ul className="divide-y divide-[var(--border)]">
          {(list.data?.data || []).map((entry) => (
            <li key={entry.customer.id} className="flex items-center justify-between gap-3 py-2">
              <span className="grid min-w-0">
                <span className="truncate text-sm text-[var(--text)]">{entry.customer.name}</span>
                {entry.factors[0] && <span className="text-xs text-[var(--text-muted)]">{t(`service.health.factors.${entry.factors[0].key}`, { value: String(entry.factors[0].value) })}</span>}
              </span>
              <span className={cn('shrink-0 text-sm font-semibold', BAND_TONE[entry.band])}><span dir="ltr">{entry.score}</span> · {t(`service.health.bands.${entry.band}`)}</span>
            </li>
          ))}
        </ul>
      </ResourceState>
    </div>
  )
}
