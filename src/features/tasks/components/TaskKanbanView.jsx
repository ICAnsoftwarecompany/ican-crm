import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  formatTaskDateLabel,
  getTaskPriorityMeta,
  getTaskStatusMeta,
  getTaskTitle,
  getTaskTypeMeta,
} from '../utils/taskMeta'

const DEFAULT_COLUMNS = ['pending', 'in_progress', 'completed', 'cancelled']

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase()
  return DEFAULT_COLUMNS.includes(value) ? value : 'pending'
}

function KanbanCard({ task, onOpenTask }) {
  const { t, i18n } = useTranslation()
  const typeMeta = getTaskTypeMeta(task?.type, t)
  const statusMeta = getTaskStatusMeta(task?.status, t)
  const priorityMeta = getTaskPriorityMeta(task?.priority, t)
  const dueLabel = formatTaskDateLabel(task, i18n.language, t)
  const TypeIcon = typeMeta.icon

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('task-id', String(task?.id || ''))
      }}
      onClick={() => onOpenTask?.(task?.id)}
      className="cursor-grab rounded-xl border border-[#D7EEF0] bg-white p-2 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-center gap-1.5">
        <TypeIcon size={13} className="text-[#007A80]" />
        <h4 className="truncate text-xs font-black text-[#0F172A]">{getTaskTitle(task, t)}</h4>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] font-bold">
        <span className={`rounded-full px-1.5 py-0.5 ${statusMeta.tone}`}>{statusMeta.label}</span>
        <span className={`rounded-full border px-1.5 py-0.5 ${priorityMeta.className}`}>{priorityMeta.label}</span>
      </div>
      <div className="mt-1 text-[10px] font-semibold text-[#64748B]">{dueLabel}</div>
    </div>
  )
}

export function TaskKanbanView({ tasks = [], onOpenTask, onStatusChange }) {
  const { t } = useTranslation()
  const [dragOverStatus, setDragOverStatus] = useState('')

  const grouped = useMemo(() => {
    const map = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    }

    tasks.forEach((task) => {
      const status = normalizeStatus(task?.status)
      map[status].push(task)
    })

    return map
  }, [tasks])

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {DEFAULT_COLUMNS.map((status) => {
        const statusMeta = getTaskStatusMeta(status, t)
        const items = grouped[status] || []
        const isOver = dragOverStatus === status

        return (
          <section
            key={status}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOverStatus(status)
            }}
            onDragLeave={() => setDragOverStatus('')}
            onDrop={(event) => {
              event.preventDefault()
              setDragOverStatus('')
              const taskId = event.dataTransfer.getData('task-id')
              if (!taskId) return
              onStatusChange?.(taskId, status)
            }}
            className={[
              'rounded-2xl border p-2',
              isOver ? 'border-[#00C2CB] bg-[#F3FDFF]' : 'border-[#D7EEF0] bg-[#F8FEFF]',
            ].join(' ')}
          >
            <header className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-black text-[#0F172A]">{statusMeta.label}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#64748B]">{items.length}</span>
            </header>

            <div className="space-y-2">
              {items.length ? items.map((task) => (
                <KanbanCard key={task.id || `${task.title}-${task.due_date || ''}`} task={task} onOpenTask={onOpenTask} />
              )) : (
                <div className="rounded-xl border border-dashed border-[#CDEEEF] bg-white p-3 text-center text-[11px] font-semibold text-[#64748B]">
                  {t('tasks.fallback.noTasks')}
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
