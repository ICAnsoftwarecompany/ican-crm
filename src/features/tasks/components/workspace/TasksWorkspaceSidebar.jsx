import { CalendarClock, ChevronLeft, ChevronRight, FolderKanban, ListTodo, Plus, Sparkles } from 'lucide-react'

const SMART_VIEWS = [
  { id: 'all', label: 'All Tasks', icon: ListTodo },
  { id: 'today', label: 'Due Today', icon: CalendarClock },
  { id: 'overdue', label: 'Overdue', icon: Sparkles },
  { id: 'in_progress', label: 'In Progress', icon: FolderKanban },
]

const DEFAULT_BOARDS = [
  { id: 'main', name: 'Main Board', accent: 'bg-[#E8F9FA] text-[#007A80]' },
  { id: 'sales', name: 'Sales Team', accent: 'bg-[#EEF2FF] text-[#4F46E5]' },
  { id: 'followups', name: 'Follow-ups', accent: 'bg-[#FFF7ED] text-[#C2410C]' },
]

export function TasksWorkspaceSidebar({
  boards = DEFAULT_BOARDS,
  activeSmartView = 'all',
  activeBoardId = 'main',
  onSmartViewChange,
  onBoardChange,
  onAddBoard,
  onToggleCollapse,
  collapsed = false,
  metrics = {},
}) {
  const toggleIcon = collapsed ? ChevronRight : ChevronLeft
  const ToggleIcon = toggleIcon

  return (
    <aside className={[
      'w-full rounded-2xl border border-[#D7EEF0] bg-[#F8FEFF] p-3 shadow-sm transition-all duration-200',
      collapsed ? 'xl:w-[76px]' : 'xl:w-[280px]',
    ].join(' ')}>
      <div className={[
        'mb-4 flex items-center justify-between gap-2',
        collapsed ? 'flex-col' : '',
      ].join(' ')}>
        {!collapsed && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">Tasks</p>
            <h2 className="text-base font-black text-[#0F172A]">Workspace</h2>
          </div>
        )}

        <div className={['flex items-center gap-2', collapsed ? 'justify-center' : ''].join(' ')}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7EEF0] bg-white text-[#64748B]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ToggleIcon size={14} />
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={onAddBoard}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-[11px] font-black text-[#007A80]"
            >
              <Plus size={13} />
              Add Board
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-4">
          <section>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">Smart Views</p>
            <div className="space-y-1.5">
              {SMART_VIEWS.map(({ id, label, icon: Icon }) => {
                const active = activeSmartView === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSmartViewChange?.(id)}
                    className={[
                      'flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-left text-xs font-black transition-colors',
                      active
                        ? 'border-[#7FDDE1] bg-[#F3FDFF] text-[#007A80]'
                        : 'border-transparent bg-transparent text-[#475569] hover:border-[#D7EEF0] hover:bg-white',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} />
                      {label}
                    </span>
                    <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black text-[#64748B]">
                      {metrics?.[id === 'all' ? 'total' : id === 'today' ? 'today' : id === 'overdue' ? 'overdue' : 'inProgress'] || 0}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">My Boards</p>
            <div className="space-y-1.5">
              {boards.map((board) => {
                const active = activeBoardId === board.id
                return (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => onBoardChange?.(board.id)}
                    className={[
                      'flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-left text-xs font-black transition-colors',
                      active
                        ? 'border-[#7FDDE1] bg-[#F3FDFF] text-[#007A80]'
                        : 'border-transparent bg-transparent text-[#475569] hover:border-[#D7EEF0] hover:bg-white',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${board.accent || 'bg-[#E8F9FA] text-[#007A80]'}`} />
                      {board.name}
                    </span>
                    <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black text-[#64748B]">
                      {board.count || 0}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </aside>
  )
}
