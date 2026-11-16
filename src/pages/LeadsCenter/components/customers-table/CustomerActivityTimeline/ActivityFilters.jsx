import { useMemo } from 'react'
import { ListFilter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getActivityTypeConfig } from './config/activityTypes'

// Populate the compact dropdown from actual activities so even backend-defined
// types not listed in activityTypes remain selectable.
export function ActivityFilters({ activeFilter, onFilterChange, activities = [] }) {
  const { t } = useTranslation()
  const options = useMemo(() => {
    const types = new Map()
    activities.forEach((activity) => {
      const type = String(activity?.type || 'unknown').trim().toLowerCase() || 'unknown'
      types.set(type, (types.get(type) || 0) + 1)
    })
    return [...types.entries()]
      .map(([type, count]) => {
        const config = getActivityTypeConfig(type)
        return { type, count, label: config.labelKey.endsWith('.activity') && type !== 'default' ? type.replace(/[_-]/g, ' ') : t(config.labelKey) }
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'ar'))
  }, [activities, t])

  return (
    <label className="inline-flex h-9 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700">
      <ListFilter size={15} className="shrink-0 text-[#007A80]" />
      <select
        value={activeFilter}
        onChange={(event) => onFilterChange(event.target.value)}
        aria-label={t('customers.activityTimeline.filters.all')}
        className="min-w-0 max-w-[190px] bg-transparent text-xs font-bold outline-none"
      >
        <option value="all">{t('customers.activityTimeline.filters.all')} ({activities.length})</option>
        {options.map(({ type, count, label }) => (
          <option key={type} value={type}>{label} ({count})</option>
        ))}
      </select>
    </label>
  )
}
