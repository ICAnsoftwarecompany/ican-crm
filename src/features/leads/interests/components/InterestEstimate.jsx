import { useTranslation } from 'react-i18next'
import { useNumberFormat } from '../../../products'

/** "Expected value" of the interest: item × quantity + chosen add-ons (per billing cycle for plans). */
export function InterestEstimate({ estimate, profile }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  if (!profile) return null
  const cycle = profile.recurrence
    ? t('leads.interestDialog.facts.perCycle', { unit: t(`leads.interestDialog.cycle.${profile.recurrence.unit}`, { defaultValue: profile.recurrence.unit }) })
    : ''

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-sm">
      <span className="text-[var(--text-muted)]">
        {t('leads.interestDialog.estimate.label')}
        {estimate.extras > 0 && estimate.base !== null && (
          <>
            {' '}
            <bdi dir="ltr" className="text-xs">{`(${formatNumber(estimate.base)} + ${formatNumber(estimate.extras)})`}</bdi>
          </>
        )}
      </span>
      <span className="font-bold text-[var(--text)]">
        {estimate.total === null ? t('leads.interestDialog.estimate.unknown') : <bdi dir="ltr">{formatNumber(estimate.total)}</bdi>}
        {cycle && estimate.total !== null ? <span className="ms-1 text-xs font-normal text-[var(--text-muted)]">{cycle}</span> : null}
      </span>
    </div>
  )
}
