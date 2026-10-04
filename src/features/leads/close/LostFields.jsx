import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'
import { LEAD_FOLLOW_UP_PRESETS, LEAD_LOST_REASONS } from './leadClose'
import { CloseField, closeInputClass } from './CloseField'

/** Lost path: reason from a fixed list (reportable), note, and an optional follow-up to try again later. */
export function LostFields({ form, onChange, errors, err }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[var(--text)]">{t('customers.leadClose.fields.reason')}</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('customers.leadClose.fields.reason')}>
          {LEAD_LOST_REASONS.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={form.lostReason === key}
              onClick={() => onChange({ lostReason: key })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                form.lostReason === key
                  ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
              )}
            >
              {t(`customers.leadClose.reasons.${key}`)}
            </button>
          ))}
        </div>
        {errors.lostReason && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{err('lostReason')}</p>}
      </fieldset>

      <CloseField label={t('customers.leadClose.fields.note')} error={err('note')}>
        <textarea className={`${closeInputClass} h-20 py-2`} value={form.note} onChange={(event) => onChange({ note: event.target.value })} />
      </CloseField>

      <div className="grid gap-3 sm:grid-cols-2">
        <CloseField label={t('customers.leadClose.fields.followUp')} hint={t('customers.leadClose.followUpHint')}>
          <select className={closeInputClass} value={form.followUp} onChange={(event) => onChange({ followUp: event.target.value })}>
            {LEAD_FOLLOW_UP_PRESETS.map((value) => <option key={value || 'none'} value={value}>{t(`customers.leadClose.followUps.${value || 'none'}`)}</option>)}
          </select>
        </CloseField>
        {form.followUp === 'custom' && (
          <CloseField label={t('customers.leadClose.fields.followUpDate')} error={err('followUpDate')}>
            <input type="date" dir="ltr" className={closeInputClass} value={form.followUpDate} onChange={(event) => onChange({ followUpDate: event.target.value })} />
          </CloseField>
        )}
      </div>
    </div>
  )
}
