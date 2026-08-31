import { CalendarClock, CheckCircle2, ClipboardList, Loader2 } from 'lucide-react'

import { EmptyPanel } from '../../CustomerDetailsTabPrimitives'
import { formatDateTime12 } from '../../customerDetailsUtils'
import {
  getTaskDescription,
  getTaskDueDateTime,
  getTaskPriorityMeta,
  getTaskStatusLabel,
  getTaskTitle,
  getTaskTypeLabel,
} from './taskUtils'

function TaskCard({ task }) {
  const priority = getTaskPriorityMeta(task?.priority)
  const dueDateTime = getTaskDueDateTime(task)
  const isCompleted = String(task?.status || '').toLowerCase() === 'completed'

  return (
    <article className="min-w-0 rounded-2xl border border-[#E5F7F8] bg-white p-3 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4 className="min-w-0 break-words text-sm font-black text-[var(--text)]">
              {getTaskTitle(task)}
            </h4>
            {isCompleted && <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}
          </div>
          {getTaskDescription(task) && (
            <p className="mt-1 break-words text-xs leading-5 text-[var(--text-muted)]">
              {getTaskDescription(task)}
            </p>
          )}
        </div>

        <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${priority.className}`}>
          {priority.label}
        </span>
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1 text-[11px] font-bold text-[#007A80]">
          <ClipboardList size={13} />
          {getTaskTypeLabel(task?.type)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
          {getTaskStatusLabel(task?.status)}
        </span>
        {dueDateTime && (
          <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
            <CalendarClock size={13} className="shrink-0 text-[#007A80]" />
            <span className="min-w-0 truncate">{formatDateTime12(dueDateTime)}</span>
          </span>
        )}
      </div>
    </article>
  )
}

export function TaskList({ tasks = [], isLoading, isError, onRetry, layoutMode = 'compact' }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E5F7F8] bg-white p-5 text-center text-sm font-bold text-[var(--text-muted)]">
        <Loader2 size={18} className="mx-auto mb-2 animate-spin text-[#007A80]" />
        جاري تحميل المهام...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
        تعذر تحميل المهام.
        {onRetry && (
          <button type="button" onClick={onRetry} className="ms-2 underline">
            إعادة المحاولة
          </button>
        )}
      </div>
    )
  }

  if (!tasks.length) {
    return <EmptyPanel title="Tasks" description="لا توجد مهام مرتبطة بهذا العميل حالياً." />
  }

  return (
    <div className={layoutMode === 'wide' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
      {tasks.map((task, index) => (
        <TaskCard key={task.id || `${task.title}-${index}`} task={task} />
      ))}
    </div>
  )
}
