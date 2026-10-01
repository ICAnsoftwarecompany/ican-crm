import { useMemo, useState } from 'react'
import {
  CalendarClock,
  CheckCircle2,
  Paperclip,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { useTaskInfo, useTaskMutations } from '../hooks/useTasks'
import {
  canTransitionTask,
  formatTaskDateLabel,
  getTaskDescription,
  getTaskPriorityMeta,
  getTaskQuickStatus,
  getTaskQuickStatusLabel,
  getTaskStatusMeta,
  getTaskTitle,
  getTaskType,
  getTaskTypeMeta,
  isTaskOverdue,
} from '../utils/taskMeta'
import { TaskForm } from './TaskForm'
import { TodoForm } from './todo/TodoForm'
import { todoToFormValues } from '../utils/todoForm'
import { TaskLinkChip } from './TaskLinkChip'
import { taskToFormValues } from '../utils/taskPayload'
import { getTaskPeriod } from '../utils/todoPeriods'

function getNotes(task) {
  if (Array.isArray(task?.notes)) return task.notes
  if (Array.isArray(task?.data?.notes)) return task.data.notes
  return []
}

function getAttachments(task) {
  if (Array.isArray(task?.attachments)) return task.attachments
  if (Array.isArray(task?.data?.attachments)) return task.data.attachments
  return []
}

export function TaskDrawer({
  open,
  taskId,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const { t, i18n } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [noteText, setNoteText] = useState('')
  const infoQuery = useTaskInfo(taskId, undefined, { enabled: open && Boolean(taskId) })
  const mutations = useTaskMutations()

  const task = useMemo(() => {
    const data = infoQuery.data
    if (!data) return null
    if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data
    return data
  }, [infoQuery.data])

  const typeMeta = getTaskTypeMeta(task?.type, t)
  const priorityMeta = getTaskPriorityMeta(task?.priority, t)
  const statusMeta = getTaskStatusMeta(task?.status, t)
  const dueLabel = formatTaskDateLabel(task, i18n.language, t)
  const overdue = isTaskOverdue(task)
  const notes = getNotes(task)
  const attachments = getAttachments(task)
  const TypeIcon = typeMeta.icon

  const handleStatusChange = async () => {
    if (!task?.id || !canTransitionTask(task)) return

    try {
      await mutations.changeStatus.mutateAsync({
        taskId: task.id,
        payload: { status: getTaskQuickStatus(task) },
      })
      toast.success(t('tasks.drawer.statusUpdated'))
      setIsEditing(false)
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.drawer.statusUpdateFailed')))
    }
  }

  const handleMarkRead = async () => {
    if (!task?.id) return

    try {
      await mutations.markAsRead.mutateAsync(task.id)
      toast.success(t('tasks.drawer.markedRead'))
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.drawer.markReadFailed')))
    }
  }

  const handleDeleteTask = async () => {
    if (!task?.id) return
    const confirmed = window.confirm(t('tasks.drawer.deleteConfirm'))
    if (!confirmed) return

    try {
      await mutations.remove.mutateAsync(task.id)
      toast.success(t('tasks.drawer.taskDeleted'))
      onDeleted?.(task.id)
      onClose?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.drawer.taskDeleteFailed')))
    }
  }

  const handleSaveEdit = async (payload) => {
    if (!task?.id) return

    try {
      await mutations.update.mutateAsync({ taskId: task.id, payload })
      toast.success(t('tasks.drawer.editsSaved'))
      setIsEditing(false)
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.drawer.editsSaveFailed')))
    }
  }

  const handleAddNote = async () => {
    const value = noteText.trim()
    if (!value || !task?.id) return

    try {
      await mutations.addNote.mutateAsync({
        taskId: task.id,
        payload: { note: value },
      })
      toast.success(t('tasks.drawer.noteAdded'))
      setNoteText('')
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.drawer.noteAddFailed')))
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!noteId || !task?.id) return

    try {
      await mutations.deleteNote.mutateAsync({ taskId: task.id, noteId })
      toast.success(t('tasks.drawer.noteDeleted'))
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.drawer.noteDeleteFailed')))
    }
  }

  const handleUploadAttachments = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length || !task?.id) return

    try {
      await mutations.addAttachments.mutateAsync({ taskId: task.id, payload: { attachments: files } })
      toast.success(t('tasks.drawer.attachmentsUploaded'))
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.drawer.attachmentsUploadFailed')))
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (!attachmentId || !task?.id) return

    try {
      await mutations.deleteAttachment.mutateAsync({ taskId: task.id, attachmentId })
      toast.success(t('tasks.drawer.attachmentDeleted'))
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.drawer.attachmentDeleteFailed')))
    }
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={task ? getTaskTitle(task, t) : t('tasks.drawer.taskDetailsTitle')}
      description={task ? typeMeta.label : '...'}
      size="xl"
    >
      {infoQuery.isLoading && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm font-semibold text-[var(--text-muted)]">
          {t('tasks.drawer.loadingTask')}
        </div>
      )}

      {!infoQuery.isLoading && !task && (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm font-semibold text-[var(--text-muted)]">
          {t('tasks.drawer.noTaskData')}
        </div>
      )}

      {!infoQuery.isLoading && task && (
        <div className="space-y-4">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand-accent)]"><TypeIcon size={16} /></span>
              <span className={`rounded-full px-2 py-1 text-[11px] font-black ${statusMeta.tone}`}>{statusMeta.label}</span>
              <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${priorityMeta.className}`}>{priorityMeta.label}</span>
              <span className={`rounded-full bg-[var(--surface)] px-2 py-1 text-[11px] font-bold ${overdue ? 'text-red-600' : 'text-[var(--text-muted)]'}`}>
                <CalendarClock size={13} className="me-1 inline" />
                {dueLabel}
              </span>
              {getTaskPeriod(task) && (
                <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                  {t(`tasks.todo.periodBadge.${getTaskPeriod(task)}`)}
                </span>
              )}
              <TaskLinkChip task={task} />
            </div>

            {getTaskDescription(task) && (
              <p className="mt-3 rounded-lg bg-[var(--surface)] p-2 text-xs font-semibold leading-6 text-[var(--text)]">{getTaskDescription(task)}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setIsEditing((v) => !v)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-black text-[var(--brand-accent)]">
                <Pencil size={13} />
                {isEditing ? t('tasks.drawer.cancelEdit') : t('actions.edit')}
              </button>
              <button type="button" onClick={handleStatusChange} disabled={!canTransitionTask(task)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-black text-[var(--brand-accent)] disabled:opacity-50">
                <CheckCircle2 size={13} />
                {getTaskQuickStatusLabel(task, t)}
              </button>
              <button type="button" onClick={handleMarkRead} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-black text-[var(--brand-accent)]">
                <UserRound size={13} />
                {t('tasks.drawer.markAsRead')}
              </button>
              <button type="button" onClick={handleDeleteTask} className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 text-[11px] font-black text-red-700">
                <Trash2 size={13} />
                {t('actions.delete')}
              </button>
            </div>
          </section>

          {isEditing && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <h3 className="mb-2 text-sm font-black text-[var(--text)]">{t('tasks.drawer.editTaskTitle')}</h3>
              {/* A To-Do is edited with the short To-Do form; any other task with the full form. */}
              {getTaskType(task) === 'todo' ? (
                <TodoForm
                  initialValues={todoToFormValues(task)}
                  onSubmit={handleSaveEdit}
                  submitLabel={t('tasks.drawer.saveChanges')}
                  isSaving={mutations.update.isPending}
                />
              ) : (
                <TaskForm
                  initialValues={taskToFormValues(task)}
                  onSubmit={handleSaveEdit}
                  submitLabel={t('tasks.drawer.saveChanges')}
                  isSaving={mutations.update.isPending}
                />
              )}
            </section>
          )}

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <h3 className="mb-2 text-sm font-black text-[var(--text)]">{t('tasks.drawer.notesTitle')}</h3>
            <div className="mb-2 flex gap-2">
              <input
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder={t('tasks.drawer.addNotePlaceholder')}
                className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-semibold"
              />
              <button type="button" onClick={handleAddNote} className="h-9 rounded-lg bg-[#007A80] px-3 text-xs font-black text-white">{t('actions.add')}</button>
            </div>

            <div className="space-y-2">
              {notes.length ? notes.map((note) => (
                <div key={note.id || `${note.note}-${note.created_at || ''}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
                  <p className="text-xs font-semibold text-[var(--text)]">{note.note || note.content || ''}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)]">
                    <span>{note.created_at || note.createdAt || ''}</span>
                    {note.id && <button type="button" onClick={() => handleDeleteNote(note.id)} className="text-red-600">{t('actions.delete')}</button>}
                  </div>
                </div>
              )) : <div className="text-xs font-semibold text-[var(--text-muted)]">{t('tasks.drawer.noNotesYet')}</div>}
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <h3 className="mb-2 text-sm font-black text-[var(--text)]">{t('tasks.drawer.attachmentsTitle')}</h3>
            <label className="mb-2 inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-black text-[var(--brand-accent)]">
              <Paperclip size={13} />
              {t('tasks.drawer.addAttachments')}
              <input type="file" multiple onChange={handleUploadAttachments} className="hidden" />
            </label>

            <div className="space-y-2">
              {attachments.length ? attachments.map((attachment) => (
                <div key={attachment.id || attachment.path || attachment.url} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
                  <a
                    href={attachment.url || attachment.path || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs font-semibold text-[var(--text)] underline"
                  >
                    {attachment.name || attachment.file_name || attachment.url || t('tasks.drawer.attachmentFallback')}
                  </a>
                  {attachment.id && (
                    <button type="button" onClick={() => handleDeleteAttachment(attachment.id)} className="text-xs font-black text-red-600">{t('actions.delete')}</button>
                  )}
                </div>
              )) : <div className="text-xs font-semibold text-[var(--text-muted)]">{t('tasks.drawer.noAttachmentsYet')}</div>}
            </div>
          </section>
        </div>
      )}
    </AppDrawer>
  )
}
