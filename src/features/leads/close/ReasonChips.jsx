import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'
import { useReasonLabel } from './useLeadClose'

/** Reasons of the status as chips (single choice). Hidden when the status has none. */
export function ReasonChips({ reasons = [], value, onChange, required, error }) {
  const { t } = useTranslation()
  const label = useReasonLabel()
  if (!reasons.length) return null
  const legend = `${t('customers.leadClose.fields.reason')}${required ? '' : ` (${t('customers.leadClose.optional')})`}`
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-[var(--text)]">{legend}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('customers.leadClose.fields.reason')}>
        {reasons.map((reason) => (
          <button
            key={reason.key}
            type="button"
            role="radio"
            aria-checked={value === reason.key}
            onClick={() => onChange(value === reason.key && !required ? '' : reason.key)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              value === reason.key
                ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
            )}
          >
            {label(reason)}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </fieldset>
  )
}
