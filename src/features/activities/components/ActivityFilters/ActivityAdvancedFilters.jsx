import { ACTIVITY_PRIORITIES, ACTIVITY_STATUSES } from '../../constants/activityConstants'

export function ActivityAdvancedFilters({ filters, onChange, inputClassName }) {
  return (
    <>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>الحالة</span>
        <select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          className={inputClassName}
        >
          <option value="all">كل الحالات</option>
          {Object.values(ACTIVITY_STATUSES).map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </label>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>الأولوية</span>
        <select
          value={filters.priority}
          onChange={(event) => onChange({ priority: event.target.value })}
          className={inputClassName}
        >
          <option value="all">كل الأولويات</option>
          {Object.values(ACTIVITY_PRIORITIES).map((priority) => (
            <option key={priority.value} value={priority.value}>{priority.label}</option>
          ))}
        </select>
      </label>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>المستخدم</span>
        <input
          value={filters.assigned_to}
          onChange={(event) => onChange({ assigned_to: event.target.value })}
          placeholder="ID المستخدم"
          className={inputClassName}
        />
      </label>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>الفريق</span>
        <input
          value={filters.team_id}
          onChange={(event) => onChange({ team_id: event.target.value })}
          placeholder="ID الفريق"
          className={inputClassName}
        />
      </label>
    </>
  )
}
