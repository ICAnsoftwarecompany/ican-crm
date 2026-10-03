import { useTranslation } from 'react-i18next'
import { INSTALLMENT_FREQUENCIES } from '../../constants/dealOptions'
import { formatMoney } from '../../utils/dealMoney'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'

/** Installment terms of the won form + a preview of the schedule (estimate; the backend generates the real one). */
export function InstallmentFields({ form, setField, errors = {}, preview = [] }) {
  const { t, i18n } = useTranslation()
  const err = (key) => (errors[key] ? t(`dealWorkspace.closing.won.errors.${errors[key]}`) : null)
  const noInterest = form.payment_type === 'installment_no_interest'

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldLabel label={t('dealWorkspace.closing.won.installments')} error={err('number_of_installments')}>
          <input type="number" min="1" className={dealInputClass} value={form.number_of_installments} onChange={(event) => setField('number_of_installments', event.target.value)} />
        </FieldLabel>
        <FieldLabel label={t('dealWorkspace.closing.won.frequency')} error={err('frequency')}>
          <select className={dealInputClass} value={form.frequency} onChange={(event) => setField('frequency', event.target.value)}>
            {INSTALLMENT_FREQUENCIES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.frequency.${value}`)}</option>)}
          </select>
        </FieldLabel>
        <FieldLabel label={t('dealWorkspace.closing.won.interestRate')} hint={noInterest ? t('dealWorkspace.closing.won.noInterestHint') : null}>
          <input type="number" min="0" step="0.01" className={dealInputClass} disabled={noInterest} value={noInterest ? 0 : form.interest_rate} onChange={(event) => setField('interest_rate', event.target.value)} />
        </FieldLabel>
        <FieldLabel label={t('dealWorkspace.closing.won.firstDueDate')} error={err('first_due_date')}>
          <input type="date" dir="ltr" className={dealInputClass} value={form.first_due_date} onChange={(event) => setField('first_due_date', event.target.value)} />
        </FieldLabel>
      </div>

      {preview.length > 0 && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <h4 className="mb-2 text-xs font-bold text-[var(--text)]">{t('dealWorkspace.closing.won.previewTitle')}</h4>
          <ol className="max-h-40 space-y-1 overflow-y-auto text-xs text-[var(--text-muted)]">
            {preview.map((row) => (
              <li key={row.number} className="flex items-center justify-between gap-2">
                <span>{t('dealWorkspace.closing.won.installmentN', { number: row.number })} · <span dir="ltr">{row.dueDate}</span></span>
                <span dir="ltr" className="font-semibold text-[var(--text)]">{formatMoney(row.amount, i18n.language)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[11px] text-[var(--text-muted)]">{t('dealWorkspace.closing.won.previewNote')}</p>
        </section>
      )}
    </div>
  )
}
