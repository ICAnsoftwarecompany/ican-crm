import { useTranslation } from 'react-i18next'
import { CalendarDays, KanbanSquare, ListTodo, Plus, Search, Table2 } from 'lucide-react'

function ViewSwitcher({ value, onChange }) {
  const { t } = useTranslation()
  const options = [
    { id: 'list', label: t('tasks.workspace.listView'), icon: Table2 },
    { id: 'board', label: t('tasks.workspace.boardView'), icon: KanbanSquare },
    { id: 'calendar', label: t('tasks.workspace.calendarView'), icon: CalendarDays },
  ]

  return (
    <div className="inline-flex shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
      {options.map((option) => {
        const Icon = option.icon
        const active = value === option.id

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              'inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-md px-2 text-xs font-black transition-colors',
              active ? 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
            ].join(' ')}
          >
            <Icon size={13} />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function TasksWorkspaceHeader({
  search,
  onSearchChange,
  view,
  onViewChange,
  onCreateTask,
  showFilters,
  filtersContent,
  extraActions,
}) {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-sm">
      {/* Wraps instead of squeezing: the title keeps ≥220px, actions drop to the next line (fixed 2026-10-02). */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
            <ListTodo size={18} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-[var(--text)]">{t('tasks.workspace.headerTitle')}</h1>
            <p className="truncate text-xs font-semibold text-[var(--text-muted)]">{t('tasks.workspace.headerSubtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block min-w-[200px] flex-1 sm:max-w-xs">
            <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={t('tasks.board.searchTasksPlaceholder')}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-8 pe-3 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
            />
          </label>

          <button
            type="button"
            onClick={onCreateTask}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#007A80] px-3 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#00666B]"
          >
            <Plus size={14} />
            {t('tasks.page.newTask')}
          </button>

          <ViewSwitcher value={view} onChange={onViewChange} />
          {extraActions && <span className="shrink-0 whitespace-nowrap">{extraActions}</span>}
        </div>
      </div>

      {showFilters && (
        <div className="mt-3">
          {filtersContent}
        </div>
      )}
    </div>
  )
}
