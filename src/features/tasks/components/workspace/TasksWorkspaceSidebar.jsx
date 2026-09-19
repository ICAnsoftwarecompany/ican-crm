import { useTranslation } from 'react-i18next'
import { CalendarClock, ChevronLeft, ChevronRight, FolderKanban, ListTodo, Plus, Sparkles } from 'lucide-react'

function getSmartViews(t) {
  return [
    { id: 'all', label: t('tasks.page.allTasks'), icon: ListTodo },
    { id: 'today', label: t('tasks.workspace.dueToday'), icon: CalendarClock },
    { id: 'overdue', label: t('activities.derivedStates.overdue'), icon: Sparkles },
    { id: 'in_progress', label: t('activities.status.in_progress'), icon: FolderKanban },
  ]
}

function getDefaultBoards(t) {
  return [
    { id: 'main', name: t('tasks.page.mainBoard'), accent: 'bg-[#E8F9FA] text-[#007A80]' },
    { id: 'sales', name: t('tasks.page.salesTeamBoard'), accent: 'bg-[#EEF2FF] text-[#4F46E5]' },
    { id: 'followups', name: t('tasks.page.followUpsBoard'), accent: 'bg-[#FFF7ED] text-[#C2410C]' },
  ]
}

export function TasksWorkspaceSidebar({
  boards,
  activeSmartView = 'all',
  activeBoardId = 'main',
  onSmartViewChange,
  onBoardChange,
  onAddBoard,
  onToggleCollapse,
  collapsed = false,
  metrics = {},
}) {
  const { t } = useTranslation()
  const smartViews = getSmartViews(t)
  const resolvedBoards = boards ?? getDefaultBoards(t)
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
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">{t('nav.tasks')}</p>
            <h2 className="text-base font-black text-[#0F172A]">{t('tasks.workspace.title')}</h2>
          </div>
        )}

        <div className={['flex items-center gap-2', collapsed ? 'justify-center' : ''].join(' ')}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7EEF0] bg-white text-[#64748B]"
            aria-label={collapsed ? t('tasks.workspace.expandSidebar') : t('tasks.workspace.collapseSidebar')}
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
              {t('tasks.workspace.addBoard')}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-4">
          <section>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">{t('tasks.workspace.smartViews')}</p>
            <div className="space-y-1.5">
              {smartViews.map(({ id, label, icon: Icon }) => {
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
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">{t('tasks.workspace.myBoards')}</p>
            <div className="space-y-1.5">
              {resolvedBoards.map((board) => {
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
