import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarClock, CalendarDays, Check, FileAudio, FileUp, MapPin, PhoneCall, Radio, Search, UsersRound, UserRound, Video } from 'lucide-react'
import { toast } from 'sonner'

import { useMeetingMutations } from '../../../meetings/hooks/useMeetings'
import { useTeams } from '../../../teams/hooks/useTeams'
import { useUsers } from '../../../users/hooks/useUsers'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'منخفضة', color: '#22C55E' },
  { value: 'medium', label: 'متوسطة', color: '#F59E0B' },
  { value: 'high', label: 'عالية', color: '#EF4444' },
  { value: 'urgent', label: 'عاجلة', color: '#7C3AED' },
]

const REMINDER_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'email', label: 'Email' },
]

const SCHEDULE_CONFIG = {
  call: {
    formId: 'call-schedule-form',
    icon: PhoneCall,
    modalTitle: 'إضافة موعد مكالمة',
    description: 'حدد بيانات المكالمة وسيتم حفظها كموعد مرتبط بالعميل أو الليد.',
    titleLabel: 'عنوان المكالمة',
    titlePlaceholder: 'مثال: متابعة العرض',
    notesLabel: 'وصف أو ملاحظات',
    notesPlaceholder: 'اكتب تفاصيل المكالمة أو سبب المتابعة...',
    defaultTitle: 'مكالمة مع',
    successMessage: 'تم إنشاء موعد المكالمة.',
    actionTitle: 'موعد مكالمة',
    saveLabel: 'حفظ موعد المكالمة',
    updateLabel: 'تحديث موعد المكالمة',
    defaultStartOffset: 15,
  },
  meeting: {
    formId: 'meeting-schedule-form',
    icon: CalendarDays,
    modalTitle: 'إضافة موعد اجتماع',
    description: 'حدد بيانات الاجتماع وسيتم حفظه كموعد مرتبط بالعميل أو الليد.',
    titleLabel: 'عنوان الاجتماع',
    titlePlaceholder: 'مثال: اجتماع متابعة العرض',
    notesLabel: 'وصف أو ملاحظات',
    notesPlaceholder: 'اكتب تفاصيل الاجتماع أو نقاط المتابعة...',
    defaultTitle: 'اجتماع مع',
    successMessage: 'تم إنشاء موعد الاجتماع.',
    actionTitle: 'موعد اجتماع',
    saveLabel: 'حفظ موعد الاجتماع',
    updateLabel: 'تحديث موعد الاجتماع',
    defaultStartOffset: 30,
  },
}

function fieldValue(value, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

function pickFirst(...values) {
  return values.find((value) => value !== null && value !== undefined && value !== '') || ''
}

function getEntityId(item) {
  return item?.id || item?.user_id || item?.team_id || ''
}

function getUserLabel(user) {
  return user?.name || user?.username || user?.email || `User #${getEntityId(user)}`
}

function getTeamLabel(team) {
  return team?.name || team?.team_name || team?.title || `Team #${getEntityId(team)}`
}

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function getCustomerId(customer) {
  return customer?.customer_id || customer?.id
}

function getCustomerPhone(customer) {
  return customer?.phone || customer?.lead?.phone || ''
}

function getCustomerName(customer) {
  return customer?.name || customer?.lead?.name || customer?.email || customer?.phone
}

function getLeadPageId(customer, fallback) {
  return customer?.id || customer?.customer_id || customer?.lead?.id || customer?.lead_id || fallback
}

function getAssignedUserId(customer) {
  return customer?.linked_by?.id || customer?.lead?.assigned_to || customer?.agent_id || ''
}

function getTeamId(customer) {
  return customer?.linked_by?.team_id || customer?.team_id || customer?.lead?.team_id || ''
}

function resolveTaskableType({ relatedType, taskableType }) {
  if (taskableType) return taskableType
  return relatedType === 'customer' ? 'App\\Models\\Customer' : 'App\\Models\\Lead'
}

function resolveTaskableId({ customer, leadId, taskableId, relatedType }) {
  if (taskableId) return taskableId

  if (relatedType === 'customer') {
    return getCustomerId(customer) || getLeadId(customer) || leadId
  }

  return leadId || getLeadId(customer) || getCustomerId(customer)
}

function toDateTimeLocalValue(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toEditableDateTime(value, fallback) {
  if (!value) return fallback
  return toDateTimeLocalValue(value) || fallback
}

function formatDateTimeForApi(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function addMinutes(value, minutes) {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return new Date()
  date.setMinutes(date.getMinutes() + minutes)
  return date
}

function normalizeId(value) {
  return String(value ?? '').trim()
}

function parseReminderChannels(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'both') return ['system', 'email']
  if (normalized === 'system' || normalized === 'email') return [normalized]
  return []
}

function buildReminderType(channels) {
  const unique = Array.from(new Set(channels.filter(Boolean)))
  if (unique.includes('system') && unique.includes('email')) return 'both'
  return unique[0] || ''
}

function extractMeetingId(result) {
  return result?.data?.meeting?.id || result?.data?.id || result?.meeting?.id || result?.id || null
}

function FormField({ label, children }) {
  return (
    <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="space-y-3 rounded-xl border border-[#E5F7F8] bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black text-[var(--text)]">
        {Icon ? <Icon size={15} className="text-[#007A80]" /> : null}
        {title}
      </div>
      {children}
    </section>
  )
}

const inputClassName = 'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'
const textareaClassName = 'min-h-20 w-full min-w-0 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

export function ScheduleActivityDialog({
  type = 'meeting',
  isOpen,
  onClose,
  customer,
  activity,
  leadId,
  taskableId,
  taskableType,
  relatedType = 'lead',
  assignedUserId,
  teamId,
  defaultPhone,
  defaultTitle,
  presentation = 'modal',
  avoidCustomerDetailsDrawer = false,
  allowEntityBinding = false,
  onCreated,
  onUpdated,
  onSaved,
}) {
  const navigate = useNavigate()
  const usersQuery = useUsers()
  const teamsQuery = useTeams()
  const isEdit = Boolean(activity?.id)
  const scheduleType = String(activity?.type || type || '').toLowerCase() === 'call' ? 'call' : 'meeting'
  const config = SCHEDULE_CONFIG[scheduleType]
  const Icon = config.icon
  const resolvedTaskableId = resolveTaskableId({ customer, leadId, taskableId, relatedType })
  const resolvedTaskableType = resolveTaskableType({ relatedType, taskableType })
  const resolvedAssignedUserId = assignedUserId || getAssignedUserId(customer)
  const resolvedTeamId = teamId || getTeamId(customer)
  const customerPhone = defaultPhone || getCustomerPhone(customer)
  const mutations = useMeetingMutations()
  const isPending = mutations.create.isPending || mutations.update.isPending
  const defaultDates = useMemo(() => {
    const start = addMinutes(new Date(), config.defaultStartOffset)
    const end = addMinutes(start, 60)
    return { startAt: toDateTimeLocalValue(start), endAt: toDateTimeLocalValue(end) }
  }, [config.defaultStartOffset, isOpen])

  const users = usersQuery.data || []
  const teams = teamsQuery.data || []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState('online')
  const [meetingLink, setMeetingLink] = useState('')
  const [location, setLocation] = useState('')
  const [callProvider, setCallProvider] = useState('manual')
  const [callerNumber, setCallerNumber] = useState('')
  const [calleeNumber, setCalleeNumber] = useState('')
  const [priority, setPriority] = useState('high')
  const [scope, setScope] = useState('participants')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attachmentMode, setAttachmentMode] = useState('files')
  const [userSearchText, setUserSearchText] = useState('')
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false)
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [startAt, setStartAt] = useState(defaultDates.startAt)
  const [endAt, setEndAt] = useState(defaultDates.endAt)
  const [reminderChannels, setReminderChannels] = useState(['system', 'email'])
  const [reminderBefore, setReminderBefore] = useState('1')
  const [reminderUnit, setReminderUnit] = useState('minutes')
  const [openPreMeetingReport, setOpenPreMeetingReport] = useState(false)
  const [manualRelatedType, setManualRelatedType] = useState(relatedType === 'customer' ? 'customer' : 'lead')
  const [manualTaskableId, setManualTaskableId] = useState('')

  const mediaRecorderRef = useRef(null)
  const audioStreamRef = useRef(null)
  const voiceChunksRef = useRef([])
  const recordingTimerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const initialUserIds = Array.isArray(activity?.users)
      ? activity.users.map((user) => normalizeId(getEntityId(user))).filter(Boolean)
      : []
    const assigned = normalizeId(resolvedAssignedUserId)

    setTitle(pickFirst(defaultTitle, activity?.title))
    setDescription(pickFirst(activity?.description, activity?.notes, activity?.note))
    setMode(pickFirst(activity?.mode, 'online'))
    setMeetingLink(pickFirst(activity?.meeting_link, activity?.meeting_url, activity?.url))
    setLocation(pickFirst(activity?.location))
    setCallProvider(pickFirst(activity?.call_provider, 'manual'))
    setCallerNumber(pickFirst(activity?.caller_number))
    setCalleeNumber(pickFirst(activity?.callee_number, activity?.phone_number, scheduleType === 'call' ? customerPhone : ''))
    setPriority(pickFirst(activity?.priority, 'high'))
    setScope(pickFirst(activity?.scope, 'participants'))
    setSelectedUserIds(initialUserIds.length ? initialUserIds : (assigned ? [assigned] : []))
    setSelectedTeamId(normalizeId(pickFirst(activity?.team_id, resolvedTeamId)))
    setAttachments([])
    setAttachmentMode('files')
    setUserSearchText('')
    setIsParticipantsDialogOpen(false)
    setIsVoiceRecording(false)
    setRecordingSeconds(0)
    setStartAt(toEditableDateTime(activity?.start_at, defaultDates.startAt))
    setEndAt(toEditableDateTime(activity?.end_at, defaultDates.endAt))
    setReminderChannels(parseReminderChannels(pickFirst(activity?.reminder_type, 'both')))
    setReminderBefore(String(pickFirst(activity?.reminder_before, '1')))
    setReminderUnit(pickFirst(activity?.reminder_unit, 'minutes'))
    setOpenPreMeetingReport(false)
    setManualRelatedType(relatedType === 'customer' ? 'customer' : 'lead')
    setManualTaskableId('')
  }, [activity, customerPhone, defaultDates, defaultTitle, isOpen, resolvedAssignedUserId, resolvedTeamId, scheduleType])

  const effectiveTaskableId = resolvedTaskableId || (allowEntityBinding ? manualTaskableId.trim() : '')
  const effectiveRelatedType = resolvedTaskableId
    ? relatedType
    : (allowEntityBinding ? manualRelatedType : relatedType)
  const effectiveTaskableType = resolvedTaskableId
    ? resolvedTaskableType
    : resolveTaskableType({ relatedType: effectiveRelatedType, taskableType: '' })

  useEffect(() => () => {
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    audioStreamRef.current?.getTracks?.().forEach((track) => track.stop())
  }, [])

  const filteredUsers = useMemo(() => {
    const query = userSearchText.trim().toLowerCase()
    if (!query) return users

    return users.filter((user) => {
      const label = getUserLabel(user).toLowerCase()
      const email = String(user?.email || '').toLowerCase()
      return label.includes(query) || email.includes(query)
    })
  }, [userSearchText, users])

  const selectedUsersPreview = useMemo(() => {
    const selectedIds = new Set(selectedUserIds.map((id) => normalizeId(id)))
    return users.filter((user) => selectedIds.has(normalizeId(getEntityId(user))))
  }, [selectedUserIds, users])

  const addFilesToAttachments = (nextFiles = []) => {
    if (!nextFiles.length) return

    setAttachments((current) => {
      const byKey = new Map()
      current.forEach((file) => byKey.set(`${file.name}-${file.size}-${file.type}`, file))
      nextFiles.forEach((file) => byKey.set(`${file.name}-${file.size}-${file.type}`, file))
      return [...byKey.values()]
    })
  }

  const handleVoiceRecordingStop = () => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    audioStreamRef.current?.getTracks?.().forEach((track) => track.stop())
    audioStreamRef.current = null
    setIsVoiceRecording(false)
    setRecordingSeconds(0)
  }

  const startVoiceRecording = async () => {
    if (isVoiceRecording || typeof window === 'undefined') return

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toast.error('المتصفح لا يدعم تسجيل الرسالة الصوتية هنا.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : ''

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      voiceChunksRef.current = []
      mediaRecorderRef.current = recorder
      audioStreamRef.current = stream

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          voiceChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(voiceChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const extension = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('wav') ? 'wav' : 'webm'
        const fileName = `voice-note-${Date.now()}.${extension}`
        const file = new File([blob], fileName, { type: blob.type || 'audio/webm' })
        addFilesToAttachments([file])
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setIsVoiceRecording(true)
      setRecordingSeconds(0)
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((value) => value + 1)
      }, 1000)
    } catch (error) {
      console.error('[ScheduleActivityDialog] voice recording failed', error)
      toast.error('تعذر الوصول إلى الميكروفون. تأكد من السماح بالإذن.')
    }
  }

  const handleStartChange = (value) => {
    setStartAt(value)
    if (!value) return
    setEndAt(toDateTimeLocalValue(addMinutes(value, 60)))
  }

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((current) => {
      const normalizedUserId = normalizeId(userId)
      if (!normalizedUserId) return current
      return current.includes(normalizedUserId)
        ? current.filter((item) => item !== normalizedUserId)
        : [...current, normalizedUserId]
    })
  }

  const toggleReminderChannel = (channel) => {
    setReminderChannels((current) => (
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel]
    ))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!effectiveTaskableId) {
      toast.error('لا يوجد Lead أو Customer مرتبط بهذا الموعد.')
      return
    }
    if (!startAt || !endAt) {
      toast.error(`اختر بداية ونهاية ${config.actionTitle}.`)
      return
    }
    if (scope === 'participants' && selectedUserIds.length === 0) {
      toast.error('اختر مشارك واحد على الأقل.')
      return
    }
    if (scope === 'team' && !selectedTeamId) {
      toast.error('اختر الفريق المسؤول.')
      return
    }

    const payload = {
      title: title.trim() || `${config.defaultTitle} ${fieldValue(getCustomerName(customer), 'العميل')}`,
      description: description.trim(),
      type: scheduleType,
      mode,
      meeting_link: mode === 'online' ? meetingLink.trim() : '',
      location: mode === 'offline' ? location.trim() : '',
      longitude: '',
      latitude: '',
      scope,
      priority,
      start_at: formatDateTimeForApi(startAt),
      end_at: formatDateTimeForApi(endAt),
      team_id: scope === 'team' ? selectedTeamId : '',
      taskable_type: effectiveTaskableType,
      taskable_id: effectiveTaskableId,
      users: scope === 'participants' ? selectedUserIds : [],
      reminder_type: buildReminderType(reminderChannels),
      reminder_before: reminderChannels.length ? reminderBefore : '',
      reminder_unit: reminderChannels.length ? reminderUnit : '',
      attachments,
    }

    if (scheduleType === 'call') {
      payload.call_provider = callProvider
      payload.caller_number = callerNumber.trim()
      payload.callee_number = calleeNumber.trim()
    }

    const result = isEdit
      ? await mutations.update.mutateAsync({ meetingId: activity.id, payload })
      : await mutations.create.mutateAsync(payload)

    const createdMeetingId = extractMeetingId(result)
    toast.success(isEdit ? 'تم تحديث الموعد.' : config.successMessage)
    onSaved?.(result, payload)
    if (isEdit) onUpdated?.(result, payload)
    else onCreated?.(result, payload)
    onClose?.()

    if (openPreMeetingReport && scheduleType === 'meeting' && createdMeetingId) {
      const leadPageId = getLeadPageId(customer, effectiveTaskableId)
      navigate(`/lead/${leadPageId}?tab=meetings&preMeetingReport=1&meetingId=${createdMeetingId}`)
    } else if (openPreMeetingReport && scheduleType === 'meeting') {
      toast.error('تم حفظ الاجتماع لكن لم يتم استلام رقم الاجتماع لفتح تقرير قبل الاجتماع.')
    }
  }

  const titleText = isEdit ? `تعديل ${config.actionTitle}` : config.modalTitle
  const saveLabel = isEdit ? config.updateLabel : config.saveLabel
  const customerDisplayName = fieldValue(getCustomerName(customer), 'العميل')
  const customerDisplayPhone = getCustomerPhone(customer)
  const actions = (
    <>
      <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
      <Button type="submit" form={config.formId} variant="ai" loading={isPending} className="min-w-32">
        <Icon size={15} />
        {saveLabel}
      </Button>
    </>
  )

  const form = (
    <form id={config.formId} className="space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
            <UserRound size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-[var(--text-muted)]">العميل</div>
            <div className="truncate text-sm font-black text-[var(--text)]">{customerDisplayName}</div>
          </div>
          {customerDisplayPhone ? (
            <div className="max-w-[42%] truncate rounded-full border border-[#BEEFF2] bg-white px-3 py-1 text-[11px] font-bold text-[#007A80]">
              {customerDisplayPhone}
            </div>
          ) : null}
        </div>
      </div>

      {allowEntityBinding && !resolvedTaskableId ? (
        <Section title="ربط الموعد" icon={MapPin}>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="نوع الكيان">
              <select value={manualRelatedType} onChange={(event) => setManualRelatedType(event.target.value)} className={inputClassName}>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
              </select>
            </FormField>
            <FormField label="رقم الكيان">
              <input
                type="text"
                value={manualTaskableId}
                onChange={(event) => setManualTaskableId(event.target.value)}
                placeholder="اكتب ID"
                className={inputClassName}
              />
            </FormField>
          </div>
        </Section>
      ) : null}

      <Section title="بيانات الموعد" icon={CalendarClock}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label={config.titleLabel}>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={config.titlePlaceholder} className={inputClassName} />
          </FormField>
          <div className="space-y-2">
            <div className="text-xs font-bold text-[var(--text)]">الأولوية</div>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`rounded-xl border px-2 py-2 text-center transition ${priority === option.value ? 'border-[#00C2CB] bg-[#F8FEFF] shadow-sm' : 'border-[var(--border)] bg-white hover:border-[#BEEFF2]'}`}
                >
                  <span className="mx-auto mb-1 block h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />
                  <span className="block text-[10px] font-black text-[var(--text)]">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <FormField label="بداية الموعد">
            <input type="datetime-local" value={startAt} onChange={(event) => handleStartChange(event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="نهاية الموعد">
            <input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} className={inputClassName} />
          </FormField>
        </div>
      </Section>

      <Section title={scheduleType === 'call' ? 'إعدادات المكالمة' : 'طريقة الاجتماع'} icon={scheduleType === 'call' ? PhoneCall : Video}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label={scheduleType === 'call' ? 'طريقة المكالمة' : 'طريقة الاجتماع'}>
            <select value={mode} onChange={(event) => setMode(event.target.value)} className={inputClassName}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </FormField>
          {scheduleType === 'call' ? (
            <FormField label="مزود المكالمة">
              <select value={callProvider} onChange={(event) => setCallProvider(event.target.value)} className={inputClassName}>
                <option value="manual">Manual</option>
                <option value="cloud_call_center">Cloud Call Center</option>
              </select>
            </FormField>
          ) : null}
          {scheduleType === 'call' ? (
            <>
              <FormField label="رقم المتصل">
                <input value={callerNumber} onChange={(event) => setCallerNumber(event.target.value)} placeholder="اختياري" className={inputClassName} />
              </FormField>
              <FormField label="رقم العميل">
                <input value={calleeNumber} onChange={(event) => setCalleeNumber(event.target.value)} placeholder="رقم العميل" className={inputClassName} />
              </FormField>
            </>
          ) : null}
          {mode === 'online' ? (
            <FormField label={scheduleType === 'call' ? 'رابط المكالمة' : 'رابط الاجتماع'}>
              <input value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} placeholder="https://..." className={inputClassName} />
            </FormField>
          ) : (
            <FormField label={scheduleType === 'call' ? 'عنوان المكالمة الحضورية' : 'عنوان الاجتماع'}>
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="اكتب العنوان" className={inputClassName} />
            </FormField>
          )}
        </div>
      </Section>

      <Section title="المشاركون والنطاق" icon={UsersRound}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="النطاق">
            <select value={scope} onChange={(event) => setScope(event.target.value)} className={inputClassName}>
              <option value="participants">Participants</option>
              <option value="team">Team</option>
            </select>
          </FormField>
          {scope === 'team' ? (
            <FormField label="الفريق">
              <select value={selectedTeamId} onChange={(event) => setSelectedTeamId(event.target.value)} className={inputClassName}>
                <option value="">اختر الفريق</option>
                {teams.map((team) => <option key={getEntityId(team)} value={getEntityId(team)}>{getTeamLabel(team)}</option>)}
              </select>
            </FormField>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-[var(--text)]">المستخدمون المشاركون</div>
                <button
                  type="button"
                  onClick={() => setIsParticipantsDialogOpen(true)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-[#F8FEFF] px-2 text-[11px] font-black text-[#007A80]"
                >
                  <UsersRound size={12} />
                  اختيار المستخدمين
                </button>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-white p-2">
                <div className="text-[11px] font-semibold text-[var(--text-muted)]">
                  عدد المشاركين: <span className="font-black text-[var(--text)]">{selectedUserIds.length}</span>
                </div>
                {selectedUsersPreview.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedUsersPreview.slice(0, 5).map((user) => (
                      <span key={normalizeId(getEntityId(user))} className="rounded-full border border-[#BEEFF2] bg-[#F8FEFF] px-2 py-0.5 text-[10px] font-bold text-[#007A80]">
                        {getUserLabel(user)}
                      </span>
                    ))}
                    {selectedUsersPreview.length > 5 ? (
                      <span className="rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#475569]">
                        +{selectedUsersPreview.length - 5}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg border border-dashed border-[#E5F7F8] bg-[#F8FEFF] p-2 text-[11px] font-semibold text-[var(--text-muted)]">
                    لم يتم اختيار مشاركين بعد.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Section>

      <FormField label={config.notesLabel}>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder={config.notesPlaceholder} className={textareaClassName} />
      </FormField>

      <Section title="التذكير" icon={Bell}>
        <div className="flex flex-wrap gap-2">
          {REMINDER_OPTIONS.map((option) => {
            const checked = reminderChannels.includes(option.value)
            return (
              <button key={option.value} type="button" onClick={() => setReminderChannels((current) => checked ? current.filter((item) => item !== option.value) : [...current, option.value])} className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black transition ${checked ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]' : 'border-[var(--border)] bg-white text-[var(--text-muted)]'}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? 'border-[#00AEB8] bg-[#00AEB8] text-white' : 'border-[var(--border)] bg-white'}`}>
                  {checked ? <Check size={12} /> : null}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
        {reminderChannels.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="الوحدة">
              <select value={reminderUnit} onChange={(event) => setReminderUnit(event.target.value)} className={inputClassName}>
                <option value="minutes">دقائق</option>
                <option value="hours">ساعات</option>
                <option value="days">أيام</option>
              </select>
            </FormField>
            <FormField label="العدد">
              <input type="number" min="0" value={reminderBefore} onChange={(event) => setReminderBefore(event.target.value)} className={inputClassName} />
            </FormField>
          </div>
        ) : null}
      </Section>

      <Section title="المرفقات" icon={FileUp}>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAttachmentMode('files')} className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black ${attachmentMode === 'files' ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]' : 'border-[var(--border)] bg-white text-[var(--text-muted)]'}`}>
            <FileUp size={14} />
            ملفات
          </button>
          <button type="button" onClick={() => setAttachmentMode('voice_note')} className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black ${attachmentMode === 'voice_note' ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]' : 'border-[var(--border)] bg-white text-[var(--text-muted)]'}`}>
            <FileAudio size={14} />
            Voice note
          </button>
        </div>

        {attachmentMode === 'voice_note' ? (
          <div className="space-y-3 rounded-xl border border-dashed border-[#BEEFF2] bg-[#F8FEFF] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-black text-[var(--text)]">
                {isVoiceRecording ? `جارٍ التسجيل (${recordingSeconds}ث)` : 'تسجيل نص صوتي'}
              </div>
              <button
                type="button"
                onClick={isVoiceRecording ? handleVoiceRecordingStop : startVoiceRecording}
                className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-[11px] font-black ${isVoiceRecording ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#E8F9FA] text-[#007A80]'}`}
              >
                {isVoiceRecording ? 'إيقاف التسجيل' : 'تسجيل'}
              </button>
            </div>
          </div>
        ) : (
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(event) => addFilesToAttachments(Array.from(event.target.files || []))}
            className="block w-full rounded-lg border border-dashed border-[#BEEFF2] bg-[#F8FEFF] p-3 text-xs font-bold text-[var(--text-muted)]"
          />
        )}

        {attachments.length ? (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => <span key={`${file.name}-${file.size}-${file.type || 'unknown'}`} className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">{file.name}</span>)}
          </div>
        ) : null}
      </Section>

      {scheduleType === 'meeting' ? (
        <Section title="قبل الاجتماع" icon={Radio}>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#E5F7F8] bg-[#F8FEFF] p-3">
            <span className="text-xs font-black text-[var(--text)]">فتح تقرير قبل الاجتماع بعد الحفظ</span>
            <input type="checkbox" checked={openPreMeetingReport} onChange={(event) => setOpenPreMeetingReport(event.target.checked)} className="h-4 w-4 accent-[#00AEB8]" />
          </label>
        </Section>
      ) : null}

      <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F9FA] px-3 py-1 text-[11px] font-bold text-[#007A80]">
        <MapPin size={13} />
        سيتم ربط الموعد برقم {fieldValue(effectiveTaskableId)}
      </div>
    </form>
  )

  const participantsDialog = scope === 'participants' ? (
    <AppModal
      isOpen={isParticipantsDialogOpen}
      onClose={() => setIsParticipantsDialogOpen(false)}
      title="اختيار المستخدمين المشاركين"
      description="ابحث وحدد المستخدمين المشاركين في هذا الموعد"
      size="md"
      className="max-w-xl"
      closeOnBackdrop={false}
      footer={(
        <Button type="button" variant="ai" onClick={() => setIsParticipantsDialogOpen(false)}>
          تم
        </Button>
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[#F8FEFF] px-2 py-1.5">
          <Search size={13} className="text-[#007A80]" />
          <input
            value={userSearchText}
            onChange={(event) => setUserSearchText(event.target.value)}
            placeholder="بحث عن مستخدم..."
            className="w-full bg-transparent text-xs font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {filteredUsers.length ? filteredUsers.map((user) => {
            const userId = normalizeId(getEntityId(user))
            const checked = selectedUserIds.includes(userId)
            return (
              <label key={userId} className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[#F8FEFF] px-2 py-1.5 transition hover:border-[#BEEFF2]">
                <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-[var(--text)]">{getUserLabel(user)}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleUserSelection(userId)}
                  className="h-4 w-4 accent-[#00AEB8]"
                />
              </label>
            )
          }) : (
            <div className="rounded-lg border border-dashed border-[#E5F7F8] bg-[#F8FEFF] p-2 text-[11px] font-semibold text-[var(--text-muted)]">
              لا يوجد مستخدم مطابق للبحث.
            </div>
          )}
        </div>
      </div>
    </AppModal>
  ) : null

  if (presentation === 'drawer') {
    return (
      <>
        <AppDrawer open={isOpen} onClose={onClose} title={titleText} description={config.description} size="xl" drawerKey={`schedule-${scheduleType}`} className="border-s border-[#BEEFF2] shadow-2xl" containerClassName="z-[130000]" closeOnBackdrop={false} inlineEndOffset={avoidCustomerDetailsDrawer ? 'var(--customer-details-drawer-offset, 0px)' : undefined} pushPage={false} portal topOffset="calc(var(--layout-header-height, 48px) - 1px)">
          <div className="min-h-full pb-20">{form}</div>
          <div className="sticky -bottom-4 -mx-4 mt-4 flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:justify-end">{actions}</div>
        </AppDrawer>
        {participantsDialog}
      </>
    )
  }

  return (
    <>
      <AppModal isOpen={isOpen} onClose={onClose} title={titleText} description={config.description} size="lg" className="max-w-2xl" closeOnBackdrop={false} footer={actions}>
        {form}
      </AppModal>
      {participantsDialog}
    </>
  )
}
