import { useTranslation } from 'react-i18next'

export function ActivityDateFilter({ filters, onChange, inputClassName }) {
  const { t } = useTranslation()

  return (
    <>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>{t('activities.filters.fromDate')}</span>
        <input
          type="date"
          value={filters.date_from}
          onChange={(event) => onChange({ date_from: event.target.value })}
          className={inputClassName}
        />
      </label>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>{t('activities.filters.toDate')}</span>
        <input
          type="date"
          value={filters.date_to}
          onChange={(event) => onChange({ date_to: event.target.value })}
          className={inputClassName}
        />
      </label>
    </>
  )
}
