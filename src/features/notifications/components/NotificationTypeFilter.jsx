import { ChevronDown, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { notificationTypeOptions } from '../utils/notificationRegistry'

export function NotificationTypeFilter({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <label className="relative flex h-8 min-w-0 max-w-48 items-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] focus-within:border-[var(--brand-accent)]">
      <Filter size={13} className="pointer-events-none absolute start-2" />
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-full min-w-0 flex-1 appearance-none bg-transparent ps-7 pe-6 text-xs font-semibold text-[var(--text)] outline-none" aria-label={t('notifications.filters.type')}>
        <option value="all">{t('notifications.filters.allTypes')}</option>
        {notificationTypeOptions.map((option) => <option key={option.value} value={option.value}>{t(option.labelKey)}</option>)}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute end-2" />
    </label>
  )
}
