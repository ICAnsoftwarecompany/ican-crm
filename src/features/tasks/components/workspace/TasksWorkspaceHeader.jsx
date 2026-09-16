import { CalendarDays, KanbanSquare, ListTodo, Plus, Search, Table2 } from 'lucide-react'

function ViewSwitcher({ value, onChange }) {
  const options = [
    { id: 'list', label: 'List', icon: Table2 },
    { id: 'board', label: 'Board', icon: KanbanSquare },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ]

  return (
    <div className="inline-flex rounded-lg border border-[#D7EEF0] bg-white p-1">
      {options.map((option) => {
        const Icon = option.icon
        const active = value === option.id

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              'inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-black transition-colors',
              active ? 'bg-[#E8F9FA] text-[#007A80]' : 'text-[#64748B] hover:bg-[#F8FEFF]',
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
}) {
  return (
    <div className="rounded-2xl border border-[#D7EEF0] bg-[#F8FEFF] p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
            <ListTodo size={18} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-[#0F172A]">Tasks Workspace</h1>
            <p className="text-xs font-semibold text-[#64748B]">Smart views, boards, lists, and CRM-linked work</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search tasks"
              className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-white ps-8 pe-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
            />
          </label>

          <button
            type="button"
            onClick={onCreateTask}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#007A80] px-3 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#00666B]"
          >
            <Plus size={14} />
            New Task
          </button>

          <ViewSwitcher value={view} onChange={onViewChange} />
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
