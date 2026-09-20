import { Layers3 } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { Badge } from '../../../../shared/components/ui/Badge'
import { displayValue } from '../../../../shared/utils/apiResponse'
import { formatDate, formatCurrencyValue } from '../../utils/campaignFormatters'
import { LatinValue } from './LatinValue'

export function AdSetsSection({ t, i18n, adSets, adSetsQuery, activeAdSetId, onSelect, campaign }) {
  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="mb-3 font-bold text-[var(--text)]">{t('campaigns.details.adSets')}</h3>
      <ResourceState
        isLoading={adSetsQuery.isLoading}
        error={adSetsQuery.error}
        empty={adSets.length === 0}
        emptyIcon={<Layers3 size={24} />}
        emptyTitle={t('campaigns.details.noAdSets')}
        onRetry={adSetsQuery.refetch}
      >
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {adSets.map((adSet, index) => {
            const isSelected = String(adSet.id) === String(activeAdSetId)
            const countries = adSet.targeting?.geo_locations?.countries
            const hasAgeRange = adSet.targeting?.age_min || adSet.targeting?.age_max
            return (
              <button
                type="button"
                key={adSet.id || index}
                onClick={() => onSelect(adSet.id)}
                className={`rounded-md border p-3 text-start transition-colors ${isSelected ? 'border-[#00C2CB] bg-[var(--brand-bg)]' : 'border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)]'}`}
              >
                <div className="font-bold text-[var(--text)]">{displayValue(adSet.name || adSet.adset_name, `#${adSet.id || index + 1}`)}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant={String(adSet.status).toLowerCase() === 'active' ? 'success' : 'default'}>{displayValue(adSet.status)}</Badge>
                  {adSet.effective_status && adSet.effective_status !== adSet.status && <Badge variant="default">{displayValue(adSet.effective_status)}</Badge>}
                </div>
                <dl className="mt-2 grid gap-1 text-xs text-[var(--text-muted)]">
                  {adSet.optimization_goal && <div><dt className="inline font-semibold">{t('campaigns.adSet.optimizationGoal')}: </dt><dd className="inline">{displayValue(adSet.optimization_goal)}</dd></div>}
                  {adSet.billing_event && <div><dt className="inline font-semibold">{t('campaigns.adSet.billingEvent')}: </dt><dd className="inline">{displayValue(adSet.billing_event)}</dd></div>}
                  {adSet.budget_remaining && <div><dt className="inline font-semibold">{t('campaigns.adSet.budgetRemaining')}: </dt><dd className="inline"><LatinValue>{formatCurrencyValue(adSet.budget_remaining, campaign?.account_currency, i18n.language)}</LatinValue></dd></div>}
                  {hasAgeRange && (
                    <div>
                      <dt className="inline font-semibold">{t('campaigns.adSet.targeting')}: </dt>
                      <dd className="inline">
                        <LatinValue>{t('campaigns.adSet.ageRange', { min: adSet.targeting.age_min ?? '—', max: adSet.targeting.age_max ?? '—' })}</LatinValue>
                        {countries?.length ? ` · ${countries.join(', ')}` : ''}
                      </dd>
                    </div>
                  )}
                  <div><dt className="inline font-semibold">{t('campaigns.adSet.createdOn')}: </dt><dd className="inline"><LatinValue>{formatDate(adSet.created_time, i18n.language)}</LatinValue></dd></div>
                </dl>
              </button>
            )
          })}
        </div>
      </ResourceState>
    </section>
  )
}
