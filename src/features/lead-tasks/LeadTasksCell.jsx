import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListTodo, RefreshCw } from 'lucide-react'
import { AppDrawer } from '../../shared/components/overlays/AppDrawer'
import { TaskDrawer } from '../tasks'
import { leadTaskCountdown } from './leadTaskDisplay'

export function LeadTasksCell({ leadId, name, tasks, now, loading, error, onRetry }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [taskId, setTaskId] = useState(null)
  const countdown = leadTaskCountdown(tasks, now)
  if (!leadId) return <span>-</span>
  return <div className="min-w-40 space-y-1" onClick={(event) => event.stopPropagation()}>
    {loading ? <span className="text-xs text-[var(--text-muted)]">{t('common.loading')}</span>
      : error ? <button type="button" onClick={onRetry} title={t('common.retry')} className="flex items-center gap-1 text-xs text-red-600"><RefreshCw size={13} />{t('tasks.entity.loadFailed')}</button>
        : <><span className="block text-xs font-semibold">{t('customers.leadTaskDisplay.count', { count: tasks.length })}</span>
          <span className={`block text-[11px] tabular-nums ${countdown?.overdue ? 'text-red-600' : 'text-[var(--text-muted)]'}`} title={countdown?.task.title}>{countdown ? t(`customers.leadTaskDisplay.${countdown.overdue ? 'overdue' : 'remaining'}`, countdown) : t('customers.leadTaskDisplay.noDeadline')}</span></>}
    <button type="button" title={t('customers.leadTaskDisplay.open')} onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded border border-[var(--border)] px-2 py-1 text-xs text-[var(--brand-accent)]"><ListTodo size={14} />{t('customers.leadTaskDisplay.open')}</button>
    {open && <AppDrawer open portal pushPage={false} containerClassName="z-[120000]" title={`${t('customers.leadTaskDisplay.column')} - ${name || leadId}`} size="xl" drawerKey="lead-tasks-list" onClose={() => setOpen(false)}>
      {loading && <p role="status" className="text-sm">{t('common.loading')}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{t('tasks.entity.loadFailed')} <button type="button" onClick={onRetry} className="underline">{t('common.retry')}</button></p>}
      {!tasks.length && !loading && !error && <p className="text-sm text-[var(--text-muted)]">{t('tasks.entity.empty')}</p>}
      <ul className="divide-y divide-[var(--border)]">{tasks.map((task) => {
        const remaining = leadTaskCountdown([task], now)
        return <li key={task.id} className="py-3">
        <button type="button" onClick={() => setTaskId(task.id)} className="block w-full break-words text-start text-sm font-semibold text-[var(--brand-accent)]">{task.title}</button>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]"><span>{t(`tasks.statuses.${task.status || 'pending'}`, { defaultValue: task.status || '-' })}</span>{task.due_date && <span dir="ltr">{String(task.due_date).slice(0, 10)} {task.due_time || ''}</span>}</div>
        {remaining && <p className={`mt-1 text-xs tabular-nums ${remaining.overdue ? 'text-red-600' : 'text-[var(--text-muted)]'}`}>{t(`customers.leadTaskDisplay.${remaining.overdue ? 'overdue' : 'remaining'}`, remaining)}</p>}
      </li>})}</ul>
    </AppDrawer>}
    {taskId && <TaskDrawer open portal containerClassName="z-[130000]" taskId={taskId} onClose={() => setTaskId(null)} onUpdated={onRetry} onDeleted={() => { setTaskId(null); onRetry() }} />}
  </div>
}
