import { useTranslation } from 'react-i18next'
import { CloseField, closeInputClass } from './CloseField'

/** Won path: what was bought (one of the lead's interests), its value, and a note. */
export function WonFields({ form, onChange, interests = [], err }) {
  const { t } = useTranslation()
  const open = interests.filter((interest) => !interest.isLost)
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <CloseField label={t('customers.leadClose.fields.interest')} hint={open.length ? null : t('customers.leadClose.noInterests')}>
          <select className={closeInputClass} value={form.interestId} onChange={(event) => onChange({ interestId: event.target.value })} disabled={!open.length}>
            <option value="">{t('customers.leadClose.chooseInterest')}</option>
            {open.map((interest) => <option key={interest.id} value={interest.id}>{interest.name}</option>)}
          </select>
        </CloseField>
        <CloseField label={t('customers.leadClose.fields.value')} error={err('wonValue')}>
          <input type="number" min="0" dir="ltr" className={closeInputClass} value={form.wonValue} onChange={(event) => onChange({ wonValue: event.target.value })} />
        </CloseField>
      </div>
      <CloseField label={t('customers.leadClose.fields.note')}>
        <textarea className={`${closeInputClass} h-20 py-2`} value={form.note} onChange={(event) => onChange({ note: event.target.value })} />
      </CloseField>
      <p className="text-xs leading-5 text-[var(--text-muted)]">{t('customers.leadClose.wonDealHint')}</p>
    </div>
  )
}
