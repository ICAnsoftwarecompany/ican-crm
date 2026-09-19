import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2, Clock3, MessageSquareText, Paperclip } from 'lucide-react'

import {
  formatTaskDateLabel,
  getTaskPriorityMeta,
  getTaskStatusMeta,
  getTaskTitle,
  getTaskTypeMeta,
  isTaskOverdue,
} from '../../utils/taskMeta'
import { TaskCardMenu } from './TaskCardMenu'

function getAssigneeNames(task, t) {
  const users = Array.isArray(task?.users) ? task.users : []
  const names = users
    .map((user) => user?.name || user?.username || user?.email)
    .filter(Boolean)

  if (names.length) return names.slice(0, 2)
  if (task?.assigned_to?.name) return [task.assigned_to.name]
  return [t('tasks.fallback.unassigned')]
}

function getRelatedEntity(task, t) {
  if (task?.customer?.name) return task.customer.name
  if (task?.lead?.name) return task.lead.name
  if (task?.project?.name) return task.project.name
  return task?.taskable_type || t('tasks.board.crmEntityFallback')
}

export function TaskCard({ task, onOpenTask, onQuickComplete, onEdit, onDelete }) {
  const { t, i18n } = useTranslation()
  const typeMeta = getTaskTypeMeta(task?.type, t)
  const priorityMeta = getTaskPriorityMeta(task?.priority, t)
  const statusMeta = getTaskStatusMeta(task?.status, t)
  const overdue = isTaskOverdue(task)
  const dueLabel = formatTaskDateLabel(task, i18n.language, t)
  const TypeIcon = typeMeta.icon
  const assignees = getAssigneeNames(task, t)
  const relatedEntity = getRelatedEntity(task, t)

  return (
    <article
      onClick={() => onOpenTask?.(task?.id)}
      className="cursor-pointer rounded-xl border border-[#D7EEF0] bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onQuickComplete?.(task)
          }}
          className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#007A80] transition-colors hover:border-[#00C2CB]"
          aria-label={t('tasks.board.markCompleteAriaLabel')}
          title={t('tasks.board.markCompleteTitle')}
        >
          <CheckCircle2 size={10} className="opacity-0 hover:opacity-100" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <TypeIcon size={12} className="shrink-0 text-[#007A80]" />
            <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-black ${priorityMeta.className}`}>{priorityMeta.label}</span>
          </div>

          <h4 className="mt-1 line-clamp-2 text-[12px] font-black leading-5 text-[#0F172A]">{getTaskTitle(task, t)}</h4>
        </div>

        <TaskCardMenu onOpen={() => onOpenTask?.(task?.id)} onEdit={onEdit} onQuickComplete={() => onQuickComplete?.(task)} onDelete={onDelete} />
      </div>

      <div className="mt-2 space-y-1.5 text-[10px] font-semibold text-[#475569]">
        {relatedEntity && (
          <div className="truncate">{relatedEntity}</div>
        )}

        <div className="flex items-center gap-1.5 text-[#64748B]">
          <Clock3 size={11} />
          <span className={overdue ? 'font-black text-red-600' : ''}>{dueLabel}</span>
          {overdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-black text-red-600">
              <AlertTriangle size={9} />
              {t('activities.derivedStates.overdue')}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {assignees.slice(0, 2).map((name, index) => (
              <span key={`${name}-${index}`} className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E8F9FA] px-1.5 text-[9px] font-black text-[#007A80]">
                {name.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[#64748B]">
            <span className="inline-flex items-center gap-1"><MessageSquareText size={11} />{task?.notes?.length || 0}</span>
            <span className="inline-flex items-center gap-1"><Paperclip size={11} />{task?.attachments?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${statusMeta.tone}`}>{statusMeta.label}</span>
      </div>
    </article>
  )
}
