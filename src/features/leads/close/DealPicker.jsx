import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getDealStatusValue, isTerminalStage, resolveDealStages, useDeal, useDeals } from '../../deals'
import { CloseField, closeInputClass } from './CloseField'

/**
 * Choose an active deal to add the lead(s) to. Reports the deal's first open stage through `onStage`, so the
 * leads land on it (same as "Add existing leads" inside a deal).
 */
export function DealPicker({ value, onChange, onStage, error }) {
  const { t } = useTranslation()
  const dealsQuery = useDeals()
  const dealQuery = useDeal(value || undefined)
  const deals = useMemo(() => dealsQuery.deals.filter((deal) => ['active', 'draft', ''].includes(getDealStatusValue(deal.status) || '')), [dealsQuery.deals])
  const firstStageId = useMemo(() => {
    const deal = dealQuery.deal
    if (!deal) return ''
    const stage = resolveDealStages(deal).find((entry) => !isTerminalStage(entry))
    return stage ? String(stage.id) : ''
  }, [dealQuery.deal])

  useEffect(() => { onStage?.(firstStageId) }, [firstStageId, onStage])

  return (
    <CloseField label={t('customers.leadClose.fields.deal')} error={error} hint={dealsQuery.isLoading ? t('customers.leadClose.loadingDeals') : deals.length ? null : t('customers.leadClose.noDeals')}>
      <select className={closeInputClass} value={value} onChange={(event) => onChange(event.target.value)} disabled={!deals.length}>
        <option value="">{t('customers.leadClose.chooseDeal')}</option>
        {deals.map((deal) => <option key={deal.id} value={String(deal.id)}>{deal.name || `#${deal.id}`}</option>)}
      </select>
    </CloseField>
  )
}
