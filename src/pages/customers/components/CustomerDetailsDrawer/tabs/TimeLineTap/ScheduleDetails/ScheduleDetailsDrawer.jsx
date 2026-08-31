import { useMemo, useState } from 'react'
import {
  CalendarDays,
  FileText,
  Loader2,
  Paperclip,
  Pencil,
  Save,
  StickyNote,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { useMeetingInfo, useMeetingMutations, useMeetingReports } from '../../../../../../../features/meetings/hooks/useMeetings'
import { useUsers } from '../../../../../../../features/users/hooks/useUsers'
import { AppDrawer } from '../../../../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../../../../shared/components/ui/Button'
import { fieldValue, formatDateTime12, formatDateTimeForApi } from '../../../customerDetailsUtils'
import {
  getAttachmentName,
  getAttachmentUrl,
  getMeetingInfoPayload,
  getParticipantUserId,
  getScheduleStatusLabel,
  getScheduleTypeLabel,
  getUserDisplayName,
  PARTICIPANT_STATUS_OPTIONS,
  SCHEDULE_STATUS_OPTIONS,
  toDateTimeLocalValue,
} from './scheduleDetailsUtils'

const inputClassName = 'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'
const textareaClassName = 'min-h-20 w-full min-w-0 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

function getLeadId(customer, schedule) {
  return schedule?.taskable_id || customer?.lead_id || customer?.lead?.id
}

function getAssignedUserId(customer, schedule) {
  const participantUser = Array.isArray(schedule?.participants)
    ? getParticipantUserId(schedule.participants[0])
    : ''

  return participantUser || customer?.linked_by?.id || customer?.lead?.assigned_to || customer?.agent_id || ''
}

function getCustomerName(customer, schedule) {
  return (
    customer?.name ||
    customer?.lead?.name ||
    schedule?.lead?.name ||
    schedule?.customer?.name ||
    ''
  )
}

function getEmptyForm(schedule, customer) {
  return {
    title: schedule?.title || '',
    description: schedule?.description || '',
    type: String(schedule?.type || 'meeting').toLowerCase(),
    mode: schedule?.mode || 'online',
    meeting_link: schedule?.meeting_link || '',
    location: schedule?.location || '',
    call_provider: schedule?.call_provider || 'manual',
    caller_number: schedule?.caller_number || '',
    callee_number: schedule?.callee_number || customer?.phone || customer?.lead?.phone || '',
    priority: schedule?.priority || 'high',
    start_at: toDateTimeLocalValue(schedule?.start_at),
    end_at: toDateTimeLocalValue(schedule?.end_at),
    reminder_type: schedule?.reminder_type || 'both',
    reminder_before: schedule?.reminder_before ?? '1',
    reminder_unit: schedule?.reminder_unit || 'minutes',
  }
}

function FormField({ label, children }) {
  return (
    <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      <span>{label}</span>
      {children}
    </label>
  )
}

function ScheduleOverviewTab({ schedule, customer, onUpdated }) {
  const mutations = useMeetingMutations()
  const [form, setForm] = useState(() => getEmptyForm(schedule, customer))

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()

    const leadId = getLeadId(customer, schedule)
    const assignedUserId = getAssignedUserId(customer, schedule)
    const payload = {
      title: form.title.trim() || `${getScheduleTypeLabel(form.type)} مع ${fieldValue(customer?.name || customer?.lead?.name, 'العميل')}`,
      description: form.description.trim(),
      type: form.type,
      mode: form.mode,
      meeting_link: form.meeting_link.trim(),
      location: form.location.trim(),
      longitude: schedule?.longitude || '',
      latitude: schedule?.latitude || '',
      scope: schedule?.scope || 'participants',
      call_provider: form.type === 'call' ? form.call_provider : '',
      caller_number: form.type === 'call' ? form.caller_number.trim() : '',
      callee_number: form.type === 'call' ? form.callee_number.trim() : '',
      priority: form.priority,
      start_at: formatDateTimeForApi(form.start_at),
      end_at: formatDateTimeForApi(form.end_at),
      team_id: schedule?.team_id || customer?.linked_by?.team_id || '',
      taskable_type: schedule?.taskable_type || 'App\\Models\\Lead',
      taskable_id: leadId,
      users: assignedUserId ? [assignedUserId] : [],
      reminder_type: form.reminder_type,
      reminder_before: form.reminder_before,
      reminder_unit: form.reminder_unit,
    }

    await mutations.update.mutateAsync({ meetingId: schedule.id, payload })
    toast.success('تم تحديث بيانات الموعد.')
    onUpdated?.()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="العنوان">
          <input value={form.title} onChange={(event) => updateForm('title', event.target.value)} className={inputClassName} />
        </FormField>

        <FormField label="الأولوية">
          <select value={form.priority} onChange={(event) => updateForm('priority', event.target.value)} className={inputClassName}>
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
            <option value="urgent">عاجلة</option>
          </select>
        </FormField>

        <FormField label="بداية الموعد">
          <input type="datetime-local" value={form.start_at} onChange={(event) => updateForm('start_at', event.target.value)} className={inputClassName} />
        </FormField>

        <FormField label="نهاية الموعد">
          <input type="datetime-local" value={form.end_at} onChange={(event) => updateForm('end_at', event.target.value)} className={inputClassName} />
        </FormField>

        <FormField label="النوع">
          <select value={form.type} onChange={(event) => updateForm('type', event.target.value)} className={inputClassName}>
            <option value="meeting">اجتماع</option>
            <option value="call">مكالمة</option>
          </select>
        </FormField>

        <FormField label="طريقة التنفيذ">
          <select value={form.mode} onChange={(event) => updateForm('mode', event.target.value)} className={inputClassName}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </FormField>

        <FormField label="الرابط">
          <input value={form.meeting_link} onChange={(event) => updateForm('meeting_link', event.target.value)} className={inputClassName} />
        </FormField>

        <FormField label="المكان">
          <input value={form.location} onChange={(event) => updateForm('location', event.target.value)} className={inputClassName} />
        </FormField>

        {form.type === 'call' && (
          <>
            <FormField label="مزود المكالمة">
              <select value={form.call_provider} onChange={(event) => updateForm('call_provider', event.target.value)} className={inputClassName}>
                <option value="manual">Manual</option>
                <option value="cloud_call_center">Cloud Call Center</option>
              </select>
            </FormField>

            <FormField label="رقم العميل">
              <input value={form.callee_number} onChange={(event) => updateForm('callee_number', event.target.value)} className={inputClassName} />
            </FormField>
          </>
        )}
      </div>

      <FormField label="الوصف">
        <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} className={textareaClassName} />
      </FormField>

      <div className="grid gap-3 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 sm:grid-cols-3">
        <FormField label="نوع التذكير">
          <select value={form.reminder_type} onChange={(event) => updateForm('reminder_type', event.target.value)} className={inputClassName}>
            <option value="system">System</option>
            <option value="email">Email</option>
            <option value="both">Both</option>
          </select>
        </FormField>
        <FormField label="قبل الموعد">
          <input type="number" min="0" value={form.reminder_before} onChange={(event) => updateForm('reminder_before', event.target.value)} className={inputClassName} />
        </FormField>
        <FormField label="الوحدة">
          <select value={form.reminder_unit} onChange={(event) => updateForm('reminder_unit', event.target.value)} className={inputClassName}>
            <option value="minutes">دقائق</option>
            <option value="hours">ساعات</option>
            <option value="days">أيام</option>
          </select>
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="ai" loading={mutations.update.isPending}>
          <Save size={15} />
          حفظ التعديلات
        </Button>
      </div>
    </form>
  )
}

function ScheduleActions({ schedule, onUpdated, onDeleted }) {
  const mutations = useMeetingMutations()
  const [status, setStatus] = useState(schedule?.status || 'scheduled')

  const changeStatus = async () => {
    await mutations.changeStatus.mutateAsync({ meetingId: schedule.id, payload: { status } })
    toast.success('تم تغيير حالة الموعد.')
    onUpdated?.()
  }

  const remove = async () => {
    if (!window.confirm('هل تريد حذف هذا الموعد؟')) return
    await mutations.remove.mutateAsync(schedule.id)
    toast.success('تم حذف الموعد.')
    onDeleted?.()
  }

  return (
    <div className="grid gap-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 sm:grid-cols-[1fr_auto_auto]">
      <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClassName}>
        {SCHEDULE_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <Button type="button" variant="ai" onClick={changeStatus} loading={mutations.changeStatus.isPending}>
        تغيير الحالة
      </Button>
      <Button type="button" variant="danger" onClick={remove} loading={mutations.remove.isPending}>
        <Trash2 size={14} />
        حذف
      </Button>
    </div>
  )
}

function ScheduleReportsTab({ schedule }) {
  const mutations = useMeetingMutations()
  const reportsQuery = useMeetingReports(schedule?.id, undefined, { enabled: Boolean(schedule?.id) })
  const [form, setForm] = useState({ outcome: '', next_action: '', notes: '', rating: '3' })
  const reports = reportsQuery.data || schedule?.reports || []

  const submit = async (event) => {
    event.preventDefault()
    await mutations.createReport.mutateAsync({ meetingId: schedule.id, payload: form })
    setForm({ outcome: '', next_action: '', notes: '', rating: '3' })
    reportsQuery.refetch()
    toast.success('تم إضافة التقرير.')
  }

  const remove = async (reportId) => {
    await mutations.deleteReport.mutateAsync({ meetingId: schedule.id, reportId })
    reportsQuery.refetch()
    toast.success('تم حذف التقرير.')
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="space-y-3 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={form.outcome} onChange={(event) => setForm((current) => ({ ...current, outcome: event.target.value }))} placeholder="النتيجة" className={inputClassName} />
          <input value={form.next_action} onChange={(event) => setForm((current) => ({ ...current, next_action: event.target.value }))} placeholder="الإجراء التالي" className={inputClassName} />
          <select value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))} className={inputClassName}>
            {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
          </select>
        </div>
        <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="ملاحظات التقرير" className={textareaClassName} />
        <Button type="submit" variant="ai" loading={mutations.createReport.isPending}>
          <FileText size={15} />
          إضافة تقرير
        </Button>
      </form>

      {reports.length === 0 && <EmptyState text="لا توجد تقارير بعد." />}
      {reports.map((report) => (
        <div key={report.id} className="rounded-xl border border-[#E5F7F8] bg-white p-3 text-xs font-semibold text-[var(--text)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <p className="font-black">النتيجة: {fieldValue(report.outcome)}</p>
              <p>الإجراء التالي: {fieldValue(report.next_action)}</p>
              <p>التقييم: {fieldValue(report.rating)}</p>
              <p className="break-words text-[var(--text-muted)]">{fieldValue(report.notes || report.note)}</p>
            </div>
            {report.id && (
              <button type="button" onClick={() => remove(report.id)} className="rounded-lg p-1 text-red-600 hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ScheduleNotesTab({ schedule, onUpdated }) {
  const mutations = useMeetingMutations()
  const [note, setNote] = useState('')
  const notes = schedule?.notes || []

  const submit = async (event) => {
    event.preventDefault()
    if (!note.trim()) return
    await mutations.addNote.mutateAsync({ meetingId: schedule.id, payload: { note: note.trim() } })
    setNote('')
    toast.success('تم إضافة الملاحظة.')
    onUpdated?.()
  }

  const remove = async (noteId) => {
    await mutations.deleteNote.mutateAsync({ meetingId: schedule.id, noteId })
    toast.success('تم حذف الملاحظة.')
    onUpdated?.()
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="space-y-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3">
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="اكتب ملاحظة..." className={textareaClassName} />
        <Button type="submit" variant="ai" loading={mutations.addNote.isPending}>
          <StickyNote size={15} />
          إضافة ملاحظة
        </Button>
      </form>

      {notes.length === 0 && <EmptyState text="لا توجد ملاحظات بعد." />}
      {notes.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-2 rounded-xl border border-[#E5F7F8] bg-white p-3 text-xs font-semibold text-[var(--text)]">
          <p className="min-w-0 break-words">{fieldValue(item.note || item.body || item.text)}</p>
          {item.id && (
            <button type="button" onClick={() => remove(item.id)} className="rounded-lg p-1 text-red-600 hover:bg-red-50">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function ScheduleAttachmentsTab({ schedule, onUpdated }) {
  const mutations = useMeetingMutations()
  const [files, setFiles] = useState([])
  const attachments = schedule?.attachments || []

  const submit = async (event) => {
    event.preventDefault()
    if (!files.length) return
    await mutations.uploadAttachments.mutateAsync({ meetingId: schedule.id, payload: { attachments: Array.from(files) } })
    setFiles([])
    toast.success('تم رفع المرفقات.')
    onUpdated?.()
  }

  const remove = async (attachmentId) => {
    await mutations.deleteAttachment.mutateAsync({ meetingId: schedule.id, attachmentId })
    toast.success('تم حذف المرفق.')
    onUpdated?.()
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="space-y-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3">
        <input type="file" multiple onChange={(event) => setFiles(event.target.files || [])} className={inputClassName} />
        <Button type="submit" variant="ai" loading={mutations.uploadAttachments.isPending}>
          <Paperclip size={15} />
          رفع مرفقات
        </Button>
      </form>

      {attachments.length === 0 && <EmptyState text="لا توجد مرفقات بعد." />}
      {attachments.map((attachment) => {
        const url = getAttachmentUrl(attachment)
        return (
          <div key={attachment.id || getAttachmentName(attachment)} className="flex items-center justify-between gap-2 rounded-xl border border-[#E5F7F8] bg-white p-3 text-xs font-semibold text-[var(--text)]">
            {url ? (
              <a href={url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-[#007A80] hover:underline">
                {getAttachmentName(attachment)}
              </a>
            ) : (
              <span className="min-w-0 truncate">{getAttachmentName(attachment)}</span>
            )}
            {attachment.id && (
              <button type="button" onClick={() => remove(attachment.id)} className="rounded-lg p-1 text-red-600 hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ScheduleParticipantsTab({ schedule, onUpdated }) {
  const mutations = useMeetingMutations()
  const usersQuery = useUsers()
  const [selectedUserId, setSelectedUserId] = useState('')
  const participants = schedule?.participants || []
  const users = usersQuery.data || []
  const attachedIds = new Set(participants.map(getParticipantUserId).filter(Boolean).map(String))

  const attach = async () => {
    if (!selectedUserId) return
    await mutations.assignParticipants.mutateAsync({ meetingId: schedule.id, payload: { users: [Number(selectedUserId)] } })
    setSelectedUserId('')
    toast.success('تم إضافة المشارك.')
    onUpdated?.()
  }

  const remove = async (userId) => {
    await mutations.removeParticipant.mutateAsync({ meetingId: schedule.id, userId })
    toast.success('تم حذف المشارك.')
    onUpdated?.()
  }

  const changeStatus = async (userId, status) => {
    await mutations.changeParticipantStatus.mutateAsync({ meetingId: schedule.id, userId, payload: { status } })
    toast.success('تم تغيير حالة المشارك.')
    onUpdated?.()
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 sm:grid-cols-[1fr_auto]">
        <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className={inputClassName}>
          <option value="">اختر مستخدم لإضافته</option>
          {users.filter((user) => !attachedIds.has(String(user.id))).map((user) => (
            <option key={user.id} value={user.id}>{getUserDisplayName(user)}</option>
          ))}
        </select>
        <Button type="button" variant="ai" onClick={attach} loading={mutations.assignParticipants.isPending}>
          <UsersRound size={15} />
          إضافة
        </Button>
      </div>

      {participants.length === 0 && <EmptyState text="لا يوجد مشاركون بعد." />}
      {participants.map((participant) => {
        const userId = getParticipantUserId(participant)
        return (
          <div key={participant.id || userId} className="grid gap-2 rounded-xl border border-[#E5F7F8] bg-white p-3 text-xs font-semibold text-[var(--text)] sm:grid-cols-[1fr_150px_auto]">
            <div className="min-w-0">
              <p className="truncate font-black">{getUserDisplayName(participant.user || participant)}</p>
              <p className="truncate text-[var(--text-muted)]">{fieldValue(participant.role, 'participant')}</p>
            </div>
            <select value={participant.status || ''} onChange={(event) => changeStatus(userId, event.target.value)} className={inputClassName}>
              <option value="">غير محدد</option>
              {PARTICIPANT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {userId && (
              <button type="button" onClick={() => remove(userId)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-4 text-center text-xs font-semibold text-[var(--text-muted)]">
      {text}
    </div>
  )
}

export function ScheduleDetailsDrawer({ open, onClose, schedule, customer, onChanged }) {
  const [activeTab, setActiveTab] = useState('overview')
  const infoQuery = useMeetingInfo(schedule?.id, undefined, {
    enabled: Boolean(open && schedule?.id),
  })
  const currentSchedule = getMeetingInfoPayload(infoQuery.data, schedule)
  const scheduleTypeLabel = getScheduleTypeLabel(currentSchedule?.type || schedule?.type)
  const customerName = getCustomerName(customer, currentSchedule)
  const tabs = useMemo(() => [
    { id: 'overview', label: 'البيانات', icon: Pencil },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'notes', label: 'الملاحظات', icon: StickyNote },
    { id: 'attachments', label: 'المرفقات', icon: Paperclip },
    { id: 'participants', label: 'المشاركون', icon: UsersRound },
  ], [])

  const refresh = () => {
    infoQuery.refetch()
    onChanged?.()
  }

  const closeAfterDelete = () => {
    onChanged?.()
    onClose?.()
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      size="xl"
      closeOnBackdrop={false}
      title={`تفاصيل ${scheduleTypeLabel}`}
      description={fieldValue(currentSchedule?.title || schedule?.title, 'بدون عنوان')}
      className="z-[150]"
    >
      {infoQuery.isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-4 text-xs font-bold text-[#007A80]">
          <Loader2 size={15} className="animate-spin" />
          جاري تحميل التفاصيل...
        </div>
      )}

      {!infoQuery.isLoading && currentSchedule && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#BEEFF2] bg-[#F8FEFF] p-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#007A80]">{scheduleTypeLabel}</span>
            {customerName && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--text)]">
                العميل: {customerName}
              </span>
            )}
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
              {getScheduleStatusLabel(currentSchedule.status)}
            </span>
              {currentSchedule.start_at && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                  {formatDateTime12(currentSchedule.start_at)}
                </span>
              )}
            </div>
          </div>

          <ScheduleActions schedule={currentSchedule} onUpdated={refresh} onDeleted={closeAfterDelete} />

          <div className="flex overflow-x-auto rounded-xl bg-[#F8FEFF] p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-w-max items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-white text-[#007A80] shadow-sm ring-1 ring-[#BEEFF2]'
                      : 'text-[var(--text-muted)] hover:bg-white/70 hover:text-[var(--text)]'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'overview' && <ScheduleOverviewTab schedule={currentSchedule} customer={customer} onUpdated={refresh} />}
          {activeTab === 'reports' && <ScheduleReportsTab schedule={currentSchedule} />}
          {activeTab === 'notes' && <ScheduleNotesTab schedule={currentSchedule} onUpdated={refresh} />}
          {activeTab === 'attachments' && <ScheduleAttachmentsTab schedule={currentSchedule} onUpdated={refresh} />}
          {activeTab === 'participants' && <ScheduleParticipantsTab schedule={currentSchedule} onUpdated={refresh} />}
        </div>
      )}
    </AppDrawer>
  )
}
