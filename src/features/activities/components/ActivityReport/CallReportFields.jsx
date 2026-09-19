import { useTranslation } from 'react-i18next'

export function CallReportFields({ register, inputClassName }) {
  const { t } = useTranslation()

  return (
    <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      <span>{t('activities.reportFields.callDurationLabel')}</span>
      <input {...register('duration')} type="number" min="0" className={inputClassName} placeholder={t('activities.reportFields.callDurationPlaceholder')} />
    </label>
  )
}
