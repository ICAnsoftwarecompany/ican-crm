import { ACTIVITY_TAB_OPTIONS, ACTIVITY_VIEW_MODES } from '../../constants/activityConstants'

export function ActivityTabs({ type, view, onTypeChange, onViewChange }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-1">
        {ACTIVITY_TAB_OPTIONS.map((item) => {
          const Icon = item.icon
          const active = type === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onTypeChange(item.value)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-black transition ${
                active ? 'bg-[#E8F9FA] text-[#007A80]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
              }`}
            >
              <Icon size={15} />
              {item.value === 'all' ? 'الكل' : item.pluralLabel}
            </button>
          )
        })}
      </div>

      <div className="flex rounded-lg bg-[var(--surface-2)] p-1">
        {[
          { value: ACTIVITY_VIEW_MODES.list, label: 'جدول' },
          { value: ACTIVITY_VIEW_MODES.calendar, label: 'تقويم' },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onViewChange(item.value)}
            className={`h-8 rounded-md px-3 text-xs font-black transition ${
              view === item.value ? 'bg-[var(--surface)] text-[#007A80] shadow-sm' : 'text-[var(--text-muted)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  )
}
