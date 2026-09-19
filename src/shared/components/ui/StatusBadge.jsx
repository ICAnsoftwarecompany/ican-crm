import { useTranslation } from 'react-i18next'

const STATUS_STYLES = {
  new:       'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
  contacted: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  qualified: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:border-violet-800',
  won:       'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
  lost:      'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
  active:    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
  inactive:  'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]',
}

export function StatusBadge({ statusKey }) {
  const { t } = useTranslation()
  const className = STATUS_STYLES[statusKey] || STATUS_STYLES.new

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border font-arabic ${className}`}
    >
      {t(`status.${statusKey}`, statusKey)}
    </span>
  )
}
