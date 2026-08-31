import { useEffect, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'

import { useMeetingMutations } from '../../../../../../../features/meetings/hooks/useMeetings'
import { AppModal } from '../../../../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../../../../shared/components/ui/Button'
import { fieldValue, formatDateTimeForApi } from '../../../customerDetailsUtils'

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function getAssignedUserId(customer) {
  return customer?.linked_by?.id || customer?.lead?.assigned_to || customer?.agent_id || ''
}

function toDateTimeLocalValue(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part) => String(part).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function addMinutes(value, minutes) {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return new Date()
  date.setMinutes(date.getMinutes() + minutes)
  return date
}

function FormField({ label, children }) {
  return (
    <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      <span>{label}</span>
      {children}
    </label>
  )
}

const inputClassName = 'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'
const textareaClassName = 'min-h-20 w-full min-w-0 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

export function MeetingScheduleDialog({ isOpen, onClose, customer, leadId: leadIdProp, onCreated }) {
  const leadId = leadIdProp || getLeadId(customer)
  const assignedUserId = getAssignedUserId(customer)
  const mutations = useMeetingMutations()
  const defaultDates = useMemo(() => {
    const start = addMinutes(new Date(), 30)
    const end = addMinutes(start, 60)

    return {
      startAt: toDateTimeLocalValue(start),
      endAt: toDateTimeLocalValue(end),
    }
  }, [isOpen])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState('online')
  const [meetingLink, setMeetingLink] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState('high')
  const [startAt, setStartAt] = useState(defaultDates.startAt)
  const [endAt, setEndAt] = useState(defaultDates.endAt)
  const [reminderType, setReminderType] = useState('both')
  const [reminderBefore, setReminderBefore] = useState('1')
  const [reminderUnit, setReminderUnit] = useState('minutes')

  useEffect(() => {
    if (!isOpen) return

    setTitle('')
    setDescription('')
    setMode('online')
    setMeetingLink('')
    setLocation('')
    setPriority('high')
    setStartAt(defaultDates.startAt)
    setEndAt(defaultDates.endAt)
    setReminderType('both')
    setReminderBefore('1')
    setReminderUnit('minutes')
  }, [defaultDates, isOpen])

  const handleStartChange = (value) => {
    setStartAt(value)
    if (!value) return
    setEndAt(toDateTimeLocalValue(addMinutes(value, 60)))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!leadId) {
      toast.error('لا يوجد Lead مرتبط بهذا العميل.')
      return
    }

    if (!startAt || !endAt) {
      toast.error('اختر بداية ونهاية موعد الاجتماع.')
      return
    }

    const payload = {
      title: title.trim() || `اجتماع مع ${fieldValue(customer?.name || customer?.lead?.name, 'العميل')}`,
      description: description.trim(),
      type: 'meeting',
      mode,
      meeting_link: meetingLink.trim(),
      location: location.trim(),
      longitude: '',
      latitude: '',
      scope: 'participants',
      priority,
      start_at: formatDateTimeForApi(startAt),
      end_at: formatDateTimeForApi(endAt),
      team_id: customer?.linked_by?.team_id || '',
      taskable_type: 'App\\Models\\Lead',
      taskable_id: leadId,
      users: assignedUserId ? [assignedUserId] : [],
      reminder_type: reminderType,
      reminder_before: reminderBefore,
      reminder_unit: reminderUnit,
    }

    const result = await mutations.create.mutateAsync(payload)
    toast.success('تم إنشاء موعد الاجتماع.')
    onCreated?.(result, payload)
    onClose?.()
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة موعد اجتماع"
      description="حدد بيانات الاجتماع وسيتم حفظه كموعد مرتبط بالعميل الحالي."
      size="lg"
      className="max-w-2xl"
      footer={(
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            type="submit"
            form="meeting-schedule-form"
            variant="ai"
            loading={mutations.create.isPending}
            className="min-w-32"
          >
            <CalendarDays size={15} />
            حفظ الموعد
          </Button>
        </>
      )}
    >
      <form id="meeting-schedule-form" className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="عنوان الاجتماع">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: اجتماع متابعة العرض"
              className={inputClassName}
            />
          </FormField>

          <FormField label="أولوية الاجتماع">
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className={inputClassName}>
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </FormField>

          <FormField label="بداية الموعد">
            <input
              type="datetime-local"
              value={startAt}
              onChange={(event) => handleStartChange(event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="نهاية الموعد">
            <input
              type="datetime-local"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="طريقة الاجتماع">
            <select value={mode} onChange={(event) => setMode(event.target.value)} className={inputClassName}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </FormField>

          <FormField label="رابط الاجتماع">
            <input
              value={meetingLink}
              onChange={(event) => setMeetingLink(event.target.value)}
              placeholder="اختياري"
              className={inputClassName}
            />
          </FormField>

          <FormField label="المكان">
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="اختياري"
              className={inputClassName}
            />
          </FormField>
        </div>

        <FormField label="وصف أو ملاحظات">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="اكتب تفاصيل الاجتماع أو نقاط المتابعة..."
            className={textareaClassName}
          />
        </FormField>

        <div className="grid gap-3 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 sm:grid-cols-3">
          <FormField label="نوع التذكير">
            <select value={reminderType} onChange={(event) => setReminderType(event.target.value)} className={inputClassName}>
              <option value="system">System</option>
              <option value="email">Email</option>
              <option value="both">Both</option>
            </select>
          </FormField>

          <FormField label="قبل الموعد">
            <input
              type="number"
              min="0"
              value={reminderBefore}
              onChange={(event) => setReminderBefore(event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="الوحدة">
            <select value={reminderUnit} onChange={(event) => setReminderUnit(event.target.value)} className={inputClassName}>
              <option value="minutes">دقائق</option>
              <option value="hours">ساعات</option>
              <option value="days">أيام</option>
            </select>
          </FormField>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F9FA] px-3 py-1 text-[11px] font-bold text-[#007A80]">
          <CalendarDays size={13} />
          سيتم ربط الموعد بالـ Lead رقم {fieldValue(leadId)}
        </div>
      </form>
    </AppModal>
  )
}
