import { useTranslation } from 'react-i18next'
import { CalendarClock, ChevronLeft, ChevronRight, FolderKanban, ListTodo, Plus, Sparkles } from 'lucide-react'

function getSmartViews(t) {
  return [
    { id: 'all', label: t('tasks.page.allTasks'), icon: ListTodo, metricKey: 'total' },
    { id: 'today', label: t('tasks.workspace.dueToday'), icon: CalendarClock, metricKey: 'today' },
    { id: 'overdue', label: t('activities.derivedStates.overdue'), icon: Sparkles, metricKey: 'overdue' },
    { id: 'in_progress', label: t('activities.status.in_progress'), icon: FolderKanban, metricKey: 'inProgress' },
  ]
}

function getDefaultBoards(t) {
  return [
    { id: 'main', name: t('tasks.page.mainBoard'), accent: 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' },
    { id: 'sales', name: t('tasks.page.salesTeamBoard'), accent: 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#27254f] dark:text-[#a5b4fc]' },
    { id: 'followups', name: t('tasks.page.followUpsBoard'), accent: 'bg-[#FFF7ED] text-[#C2410C] dark:bg-[#431f0d] dark:text-[#fdba74]' },
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
      'w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm transition-all duration-200',
      collapsed ? 'xl:w-[76px]' : 'xl:w-[280px]',
    ].join(' ')}>
      <div className={[
        'mb-4 flex items-center justify-between gap-2',
        collapsed ? 'flex-col' : '',
      ].join(' ')}>
        {!collapsed && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">{t('nav.tasks')}</p>
            <h2 className="text-base font-black text-[var(--text)]">{t('tasks.workspace.title')}</h2>
          </div>
        )}

        <div className={['flex items-center gap-2', collapsed ? 'justify-center' : ''].join(' ')}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
            aria-label={collapsed ? t('tasks.workspace.expandSidebar') : t('tasks.workspace.collapseSidebar')}
          >
            <ToggleIcon size={14} />
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={onAddBoard}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-black text-[var(--brand-accent)]"
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
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">{t('tasks.workspace.smartViews')}</p>
            <div className="space-y-1.5">
              {smartViews.map(({ id, label, icon: Icon, metricKey }) => {
                const active = activeSmartView === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSmartViewChange?.(id)}
                    className={[
                      'flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-start text-xs font-black transition-colors',
                      active
                        ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                        : 'border-transparent bg-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface)]',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} />
                      {label}
                    </span>
                    {metrics?.[metricKey] !== undefined && (
                      <span className="rounded-full bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-black text-[var(--text-muted)]">
                        {metrics[metricKey] || 0}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">{t('tasks.workspace.myBoards')}</p>
            <div className="space-y-1.5">
              {resolvedBoards.map((board) => {
                const active = activeBoardId === board.id
                return (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => onBoardChange?.(board.id)}
                    className={[
                      'flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-start text-xs font-black transition-colors',
                      active
                        ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                        : 'border-transparent bg-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface)]',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${board.accent || 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'}`} />
                      {board.name}
                    </span>
                    {typeof board.count === 'number' && (
                      <span className="rounded-full bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-black text-[var(--text-muted)]">
                        {board.count}
                      </span>
                    )}
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
