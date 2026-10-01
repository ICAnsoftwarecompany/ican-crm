import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClipboardCheck, ExternalLink, Plus, X } from 'lucide-react'
import { useTodoList } from '../../hooks/useTodoList'
import { TaskDrawer } from '../TaskDrawer'
import { TodoFormDialog } from './TodoFormDialog'
import { TodoPanelView } from './TodoPanelView'

const VIEW_TO_WHEN = { today: 'today', week: 'week', month: 'month', overdue: 'today' }
const headerButtonClass = 'inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-black text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent-soft)]'

/**
 * Quick "My to-do list" side panel opened from the header (same slot as the other header panels):
 * period tabs, quick add, tick to complete, "New" opens the short To-Do form, rows open the drawer.
 */
export function TodoSidebarPanel({ open, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [view, setView] = useState('today')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [openTaskId, setOpenTaskId] = useState(null)
  const todo = useTodoList(view)
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  return (
    <>
      <aside
        className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[var(--border)] bg-[var(--surface)] shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
        style={{ transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})` }}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <header className="border-b border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                  <ClipboardCheck size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-[var(--text)]">{t('tasks.todo.panel.title')}</h2>
                  <p className="truncate text-xs font-semibold text-[var(--text-muted)]">{t('tasks.todo.panel.summary', { count: todo.counts.today || 0 })}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => setIsCreateOpen(true)} className={headerButtonClass}>
                  <Plus size={13} />
                  {t('tasks.todo.panel.newButton')}
                </button>
                <button
                  type="button"
                  onClick={() => { navigate('/todo'); onClose?.() }}
                  title={t('tasks.todo.panel.openPage')}
                  className={headerButtonClass}
                >
                  <ExternalLink size={13} />
                  {t('tasks.todo.panel.openButton')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('tasks.todo.panel.close')}
                  title={t('tasks.todo.panel.close')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {open && <TodoPanelView todo={todo} view={view} onViewChange={setView} onOpenTask={setOpenTaskId} />}
          </div>
        </div>
      </aside>

      <TodoFormDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} initialValues={{ when: VIEW_TO_WHEN[view] || 'today' }} />

      <TaskDrawer
        open={Boolean(openTaskId)}
        taskId={openTaskId}
        onClose={() => setOpenTaskId(null)}
        onUpdated={todo.refetch}
        onDeleted={() => {
          setOpenTaskId(null)
          todo.refetch()
        }}
      />
    </>
  )
}
