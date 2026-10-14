import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClipboardCheck, Plus } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { ModulePageHeader } from '../../shared/components/module-pages'
import { TaskDrawer, TodoFormDialog, TodoPanelView, useTodoList } from '../../features/tasks'

// The tab decides what "New To-Do" starts with.
const VIEW_TO_WHEN = { today: 'today', week: 'week', month: 'month', overdue: 'today' }

/**
 * /todo — the signed-in user's To-Do list (personal to-dos, separate from /tasks since 2026-10-02):
 * Today / This week / This month / Overdue, quick add, the short To-Do form, the task drawer via `?taskId=`.
 */
export function TodoPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState('today')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const todo = useTodoList(view)
  const taskId = searchParams.get('taskId') || ''

  const setTaskId = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('taskId', String(id))
    else next.delete('taskId')
    setSearchParams(next)
  }

  const newButton = (
    <button
      type="button"
      onClick={() => setIsCreateOpen(true)}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#007A80] px-3 text-xs font-black text-white transition-colors hover:bg-[#00656A]"
    >
      <Plus size={14} />
      {t('tasks.todo.form.createTitle')}
    </button>
  )

  usePageHeader({ title: t('nav.todo'), icon: ClipboardCheck })

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <ModulePageHeader icon={ClipboardCheck} title={t('tasks.todo.title')} description={t('tasks.todo.subtitle')} actions={newButton} />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <TodoPanelView todo={todo} view={view} onViewChange={setView} onOpenTask={setTaskId} />
      </div>

      <TodoFormDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialValues={{ when: VIEW_TO_WHEN[view] || 'today' }}
      />

      <TaskDrawer
        open={Boolean(taskId)}
        taskId={taskId}
        onClose={() => setTaskId('')}
        onUpdated={todo.refetch}
        onDeleted={() => {
          setTaskId('')
          todo.refetch()
        }}
      />
    </div>
  )
}

export default TodoPage
