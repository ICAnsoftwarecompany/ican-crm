import { useTranslation } from 'react-i18next'
import { getActivityPriorities, getActivityStatuses } from '../../constants/activityConstants'

export function ActivityAdvancedFilters({ filters, onChange, inputClassName }) {
  const { t } = useTranslation()
  const statuses = getActivityStatuses(t)
  const priorities = getActivityPriorities(t)

  return (
    <>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>{t('activities.table.status')}</span>
        <select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          className={inputClassName}
        >
          <option value="all">{t('activities.form.allStatuses')}</option>
          {Object.values(statuses).map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </label>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>{t('activities.scheduleDialog.priorityLabel')}</span>
        <select
          value={filters.priority}
          onChange={(event) => onChange({ priority: event.target.value })}
          className={inputClassName}
        >
          <option value="all">{t('activities.form.allPriorities')}</option>
          {Object.values(priorities).map((priority) => (
            <option key={priority.value} value={priority.value}>{priority.label}</option>
          ))}
        </select>
      </label>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>{t('activities.form.userLabel')}</span>
        <input
          value={filters.assigned_to}
          onChange={(event) => onChange({ assigned_to: event.target.value })}
          placeholder={t('activities.form.assignedUserPlaceholder')}
          className={inputClassName}
        />
      </label>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>{t('activities.scheduleDialog.teamLabel')}</span>
        <input
          value={filters.team_id}
          onChange={(event) => onChange({ team_id: event.target.value })}
          placeholder={t('activities.form.teamPlaceholder')}
          className={inputClassName}
        />
      </label>
    </>
  )
}
