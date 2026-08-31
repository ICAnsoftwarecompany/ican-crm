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
  getTaskTypeMeta,
  isTaskOverdue,
} from '../utils/taskMeta'
import { TaskForm } from './TaskForm'

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

  const typeMeta = getTaskTypeMeta(task?.type)
  const priorityMeta = getTaskPriorityMeta(task?.priority)
  const statusMeta = getTaskStatusMeta(task?.status)
  const dueLabel = formatTaskDateLabel(task)
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
      toast.success('تم تحديث حالة المهمة')
      setIsEditing(false)
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تحديث الحالة'))
    }
  }

  const handleMarkRead = async () => {
    if (!task?.id) return

    try {
      await mutations.markAsRead.mutateAsync(task.id)
      toast.success('تم تعليم المهمة كمقروءة')
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تعليم المهمة كمقروءة'))
    }
  }

  const handleDeleteTask = async () => {
    if (!task?.id) return
    const confirmed = window.confirm('حذف المهمة؟ لا يمكن التراجع عن هذا الإجراء.')
    if (!confirmed) return

    try {
      await mutations.remove.mutateAsync(task.id)
      toast.success('تم حذف المهمة')
      onDeleted?.(task.id)
      onClose?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر حذف المهمة'))
    }
  }

  const handleSaveEdit = async (payload) => {
    if (!task?.id) return

    try {
      await mutations.update.mutateAsync({ taskId: task.id, payload })
      toast.success('تم حفظ التعديلات')
      setIsEditing(false)
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر حفظ التعديلات'))
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
      toast.success('تمت إضافة الملاحظة')
      setNoteText('')
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر إضافة الملاحظة'))
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!noteId || !task?.id) return

    try {
      await mutations.deleteNote.mutateAsync({ taskId: task.id, noteId })
      toast.success('تم حذف الملاحظة')
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر حذف الملاحظة'))
    }
  }

  const handleUploadAttachments = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length || !task?.id) return

    try {
      await mutations.addAttachments.mutateAsync({ taskId: task.id, payload: { attachments: files } })
      toast.success('تم رفع المرفقات')
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر رفع المرفقات'))
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (!attachmentId || !task?.id) return

    try {
      await mutations.deleteAttachment.mutateAsync({ taskId: task.id, attachmentId })
      toast.success('تم حذف المرفق')
      infoQuery.refetch()
      onUpdated?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر حذف المرفق'))
    }
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={task ? getTaskTitle(task) : 'تفاصيل المهمة'}
      description={task ? typeMeta.label : '...'}
      size="xl"
    >
      {infoQuery.isLoading && (
        <div className="rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3 text-sm font-semibold text-[#64748B]">
          جاري تحميل بيانات المهمة...
        </div>
      )}

      {!infoQuery.isLoading && !task && (
        <div className="rounded-xl border border-dashed border-[#D7EEF0] bg-[#F8FEFF] p-3 text-sm font-semibold text-[#64748B]">
          لا توجد بيانات لهذه المهمة.
        </div>
      )}

      {!infoQuery.isLoading && task && (
        <div className="space-y-4">
          <section className="rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#007A80]"><TypeIcon size={16} /></span>
              <span className={`rounded-full px-2 py-1 text-[11px] font-black ${statusMeta.tone}`}>{statusMeta.label}</span>
              <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${priorityMeta.className}`}>{priorityMeta.label}</span>
              <span className={`rounded-full bg-white px-2 py-1 text-[11px] font-bold ${overdue ? 'text-red-600' : 'text-[#64748B]'}`}>
                <CalendarClock size={13} className="me-1 inline" />
                {dueLabel}
              </span>
            </div>

            {getTaskDescription(task) && (
              <p className="mt-3 rounded-lg bg-white p-2 text-xs font-semibold leading-6 text-[#334155]">{getTaskDescription(task)}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setIsEditing((v) => !v)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-[11px] font-black text-[#007A80]">
                <Pencil size={13} />
                {isEditing ? 'إلغاء التعديل' : 'تعديل'}
              </button>
              <button type="button" onClick={handleStatusChange} disabled={!canTransitionTask(task)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-[11px] font-black text-[#007A80] disabled:opacity-50">
                <CheckCircle2 size={13} />
                {getTaskQuickStatusLabel(task)}
              </button>
              <button type="button" onClick={handleMarkRead} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-[11px] font-black text-[#007A80]">
                <UserRound size={13} />
                تعليم كمقروءة
              </button>
              <button type="button" onClick={handleDeleteTask} className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 text-[11px] font-black text-red-700">
                <Trash2 size={13} />
                حذف
              </button>
            </div>
          </section>

          {isEditing && (
            <section className="rounded-xl border border-[#D7EEF0] bg-white p-3">
              <h3 className="mb-2 text-sm font-black text-[#0F172A]">تعديل المهمة</h3>
              <TaskForm
                initialValues={{
                  title: task.title || '',
                  description: task.description || '',
                  type: task.type || 'todo',
                  priority: task.priority || 'medium',
                  visibility: task.visibility || 'shared',
                  due_date: task.due_date || '',
                  due_time: task.due_time || '',
                  reminder_type: task.reminder_type || 'system',
                  reminder_before: String(task.reminder_before || '30'),
                  reminder_unit: task.reminder_unit || 'minutes',
                  taskable_type: task.taskable_type || 'App\\Models\\Lead',
                  taskable_id: task.taskable_id || '',
                  users: (task.users || []).map((item) => Number(item?.id || item)).filter(Number.isFinite),
                  teams: (task.teams || []).map((item) => Number(item?.id || item)).filter(Number.isFinite),
                }}
                onSubmit={handleSaveEdit}
                submitLabel="حفظ التعديلات"
                isSaving={mutations.update.isPending}
              />
            </section>
          )}

          <section className="rounded-xl border border-[#D7EEF0] bg-white p-3">
            <h3 className="mb-2 text-sm font-black text-[#0F172A]">الملاحظات</h3>
            <div className="mb-2 flex gap-2">
              <input
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="أضف ملاحظة"
                className="h-9 flex-1 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-xs font-semibold"
              />
              <button type="button" onClick={handleAddNote} className="h-9 rounded-lg bg-[#007A80] px-3 text-xs font-black text-white">إضافة</button>
            </div>

            <div className="space-y-2">
              {notes.length ? notes.map((note) => (
                <div key={note.id || `${note.note}-${note.created_at || ''}`} className="rounded-lg border border-[#E5EEF0] bg-[#F8FEFF] p-2">
                  <p className="text-xs font-semibold text-[#334155]">{note.note || note.content || ''}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-[#64748B]">
                    <span>{note.created_at || note.createdAt || ''}</span>
                    {note.id && <button type="button" onClick={() => handleDeleteNote(note.id)} className="text-red-600">حذف</button>}
                  </div>
                </div>
              )) : <div className="text-xs font-semibold text-[#64748B]">لا توجد ملاحظات بعد.</div>}
            </div>
          </section>

          <section className="rounded-xl border border-[#D7EEF0] bg-white p-3">
            <h3 className="mb-2 text-sm font-black text-[#0F172A]">المرفقات</h3>
            <label className="mb-2 inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-xs font-black text-[#007A80]">
              <Paperclip size={13} />
              إضافة مرفقات
              <input type="file" multiple onChange={handleUploadAttachments} className="hidden" />
            </label>

            <div className="space-y-2">
              {attachments.length ? attachments.map((attachment) => (
                <div key={attachment.id || attachment.path || attachment.url} className="flex items-center justify-between rounded-lg border border-[#E5EEF0] bg-[#F8FEFF] p-2">
                  <a
                    href={attachment.url || attachment.path || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs font-semibold text-[#0F172A] underline"
                  >
                    {attachment.name || attachment.file_name || attachment.url || 'Attachment'}
                  </a>
                  {attachment.id && (
                    <button type="button" onClick={() => handleDeleteAttachment(attachment.id)} className="text-xs font-black text-red-600">حذف</button>
                  )}
                </div>
              )) : <div className="text-xs font-semibold text-[#64748B]">لا توجد مرفقات.</div>}
            </div>
          </section>
        </div>
      )}
    </AppDrawer>
  )
}
