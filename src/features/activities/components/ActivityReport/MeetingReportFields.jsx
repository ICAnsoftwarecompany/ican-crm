import { useTranslation } from 'react-i18next'

export function MeetingReportFields({ register, inputClassName }) {
  const { t } = useTranslation()

  return (
    <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      <span>{t('activities.reportFields.attendeesCountLabel')}</span>
      <input {...register('attendees_count')} type="number" min="0" className={inputClassName} placeholder={t('activities.reportFields.attendeesCountPlaceholder')} />
    </label>
  )
}
