import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TaskDrawer } from '../tasks'

export function LeadTaskTimelineActivity({ activity }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const task = activity.task
  return <div className="space-y-2 text-sm">
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]"><span>{t(`tasks.statuses.${task.status || 'pending'}`, { defaultValue: task.status || '-' })}</span><span>{t(`activities.scheduleDialog.priorityOptions.${task.priority || 'medium'}`)}</span>{task.due_date && <span dir="ltr">{String(task.due_date).slice(0, 10)} {task.due_time || ''}</span>}</div>
    {task.description && <p className="whitespace-pre-wrap break-words text-xs">{task.description}</p>}
    <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-[var(--brand-accent)] underline">{t('customers.leadTaskDisplay.openTask')}</button>
    {open && <TaskDrawer open portal containerClassName="z-[130000]" taskId={task.id} onClose={() => setOpen(false)} onDeleted={() => setOpen(false)} />}
  </div>
}
