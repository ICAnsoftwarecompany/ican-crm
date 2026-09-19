import { useTranslation } from 'react-i18next'
import { FormField, inputClassName } from './ActivityFormFields'

export function ReminderFields({ register }) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-3 rounded-lg border border-[#E5F7F8] bg-[#F8FEFF] p-3 sm:grid-cols-2">
      <FormField label={t('activities.form.reminderBeforeLabel')}>
        <input {...register('reminder_before')} type="number" min="0" className={inputClassName} />
      </FormField>
      <FormField label={t('activities.form.reminderUnitLabel')}>
        <select {...register('reminder_unit')} className={inputClassName}>
          <option value="minutes">{t('activities.scheduleDialog.minutesOption')}</option>
          <option value="hours">{t('activities.scheduleDialog.hoursOption')}</option>
          <option value="days">{t('activities.scheduleDialog.daysOption')}</option>
        </select>
      </FormField>
    </div>
  )
}
