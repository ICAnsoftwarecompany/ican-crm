import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { TaskDrawer, TodoItemRow, isTaskClosed, useTaskToggle } from '../../../tasks'

/** Tasks linked to the deal's leads or contracts, open first, with tick-to-complete and the task drawer. */
export function LinkedTaskList({ tasks, isLoading, error, onRetry, emptyTitle, emptyDescription }) {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState(null)
  const { toggle, pendingIds } = useTaskToggle({ onDone: onRetry })
  const [showClosed, setShowClosed] = useState(false)
  const open = tasks.filter((task) => !isTaskClosed(task))
  const closed = tasks.filter((task) => isTaskClosed(task))

  return (
    <ResourceState isLoading={isLoading} error={error} onRetry={onRetry} empty={!tasks.length} emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
      <div className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
        {open.map((task) => <TodoItemRow key={task.id} task={task} onToggle={toggle} onOpen={() => setOpenId(task.id)} isPending={pendingIds.has(task.id)} />)}
        {!open.length && <p className="p-2 text-xs text-[var(--text-muted)]">{t('dealWorkspace.tasks.noOpen')}</p>}
        {closed.length > 0 && (
          <button type="button" className="w-full px-2 py-1 text-start text-xs font-semibold text-[var(--brand-accent)]" onClick={() => setShowClosed((value) => !value)}>
            {t(showClosed ? 'dealWorkspace.tasks.hideClosed' : 'dealWorkspace.tasks.showClosed', { count: closed.length })}
          </button>
        )}
        {showClosed && closed.map((task) => <TodoItemRow key={task.id} task={task} onToggle={toggle} onOpen={() => setOpenId(task.id)} isPending={pendingIds.has(task.id)} />)}
      </div>
      <TaskDrawer open={Boolean(openId)} taskId={openId} onClose={() => setOpenId(null)} onUpdated={onRetry} onDeleted={() => { setOpenId(null); onRetry?.() }} />
    </ResourceState>
  )
}
