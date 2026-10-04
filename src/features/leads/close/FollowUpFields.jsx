import { useTranslation } from 'react-i18next'
import { LEAD_FOLLOW_UP_PRESETS, RETARGET_FOLLOW_UP_PRESETS } from './leadClose'
import { CloseField, closeInputClass } from './CloseField'

/** "Try again" follow-up: optional after lost, required for retarget (no "none" option). */
export function FollowUpFields({ form, onChange, err, required = false }) {
  const { t } = useTranslation()
  const presets = required ? RETARGET_FOLLOW_UP_PRESETS : LEAD_FOLLOW_UP_PRESETS
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CloseField label={t('customers.leadClose.fields.followUp')} hint={t('customers.leadClose.followUpHint')} error={err('followUp')}>
        <select className={closeInputClass} value={form.followUp} onChange={(event) => onChange({ followUp: event.target.value })}>
          {presets.map((value) => <option key={value || 'none'} value={value}>{t(`customers.leadClose.followUps.${value || 'none'}`)}</option>)}
        </select>
      </CloseField>
      {form.followUp === 'custom' && (
        <CloseField label={t('customers.leadClose.fields.followUpDate')} error={err('followUpDate')}>
          <input type="date" dir="ltr" className={closeInputClass} value={form.followUpDate} onChange={(event) => onChange({ followUpDate: event.target.value })} />
        </CloseField>
      )}
    </div>
  )
}
