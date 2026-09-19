import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../../../shared/components/overlays/FormDialog'

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

export function StatusChangeReasonDialog({
  open,
  loading = false,
  status,
  lead,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation()
  const defaultDates = useMemo(() => {
    const start = addMinutes(new Date(), 15)
    const end = addMinutes(start, 60)
    return {
      startAt: toDateTimeLocalValue(start),
      endAt: toDateTimeLocalValue(end),
    }
  }, [open])

  const [reason, setReason] = useState('')
  const [scheduleType, setScheduleType] = useState('none')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState('online')
  const [meetingLink, setMeetingLink] = useState('')
  const [location, setLocation] = useState('')
  const [callProvider, setCallProvider] = useState('manual')
  const [callerNumber, setCallerNumber] = useState('')
  const [calleeNumber, setCalleeNumber] = useState('')
  const [priority, setPriority] = useState('high')
  const [startAt, setStartAt] = useState(defaultDates.startAt)
  const [endAt, setEndAt] = useState(defaultDates.endAt)
  const [reminderType, setReminderType] = useState('both')
  const [reminderBefore, setReminderBefore] = useState('1')
  const [reminderUnit, setReminderUnit] = useState('minutes')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setReason('')
    setScheduleType('none')
    setTitle('')
    setDescription('')
    setMode('online')
    setMeetingLink('')
    setLocation('')
    setCallProvider('manual')
    setCallerNumber('')
    setCalleeNumber(lead?.phone || lead?.lead?.phone || '')
    setPriority('high')
    setStartAt(defaultDates.startAt)
    setEndAt(defaultDates.endAt)
    setReminderType('both')
    setReminderBefore('1')
    setReminderUnit('minutes')
    setError('')
  }, [defaultDates.endAt, defaultDates.startAt, lead?.lead?.phone, lead?.phone, open, status?.id])

  const handleStartChange = (value) => {
    setStartAt(value)
    if (!value) return
    setEndAt(toDateTimeLocalValue(addMinutes(value, 60)))
  }

  const handleSubmit = () => {
    const normalized = reason.trim()
    if (!normalized) {
      setError(t('customers.statusChange.reasonRequired'))
      return
    }

    if (scheduleType !== 'none' && (!startAt || !endAt)) {
      setError(t('customers.statusChange.chooseScheduleRange'))
      return
    }

    const schedulePayload = scheduleType === 'none' ? null : {
      title: title.trim(),
      description: description.trim(),
      type: scheduleType,
      mode,
      meeting_link: meetingLink.trim(),
      location: location.trim(),
      longitude: '',
      latitude: '',
      scope: 'participants',
      call_provider: scheduleType === 'call' ? callProvider : '',
      caller_number: scheduleType === 'call' ? callerNumber.trim() : '',
      callee_number: scheduleType === 'call' ? calleeNumber.trim() : '',
      priority,
      start_at: startAt ? startAt.replace('T', ' ') : '',
      end_at: endAt ? endAt.replace('T', ' ') : '',
      team_id: lead?.linked_by?.team_id || '',
      taskable_type: 'App\\Models\\Lead',
      taskable_id: lead?.lead?.id || lead?.lead_id || lead?.id || '',
      users: [lead?.linked_by?.id || lead?.lead?.assigned_to || lead?.agent_id].filter(Boolean),
      reminder_type: reminderType,
      reminder_before: reminderBefore,
      reminder_unit: reminderUnit,
    }

    onSubmit?.({ reason: normalized, schedulePayload })
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={t('customers.statusChange.dialogTitle')}
      description={t('customers.statusChange.dialogDescription', { status: status?.status || status?.name || '' })}
      onSubmit={handleSubmit}
      submitText={t('customers.statusChange.submitText')}
      loading={loading}
      submitDisabled={!reason.trim()}
    >
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">{t('customers.statusChange.reasonLabel')}</label>
        <textarea
          value={reason}
          onChange={(event) => {
            setReason(event.target.value)
            if (error) setError('')
          }}
          rows={4}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
          placeholder={t('customers.statusChange.reasonPlaceholder')}
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">{t('customers.statusChange.hasAppointmentLabel')}</label>
        <select
          value={scheduleType}
          onChange={(event) => setScheduleType(event.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
        >
          <option value="none">{t('customers.followUp.schedule.typeNone')}</option>
          <option value="call">{t('customers.statusChange.typeCallExisting')}</option>
          <option value="meeting">{t('customers.statusChange.typeMeetingExisting')}</option>
        </select>
      </div>

      {scheduleType !== 'none' ? (
        <div className="space-y-3 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.statusChange.titleLabel')}</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold" />
            </label>
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.table.hover.priority')}</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold">
                <option value="low">{t('customers.followUp.schedule.priorityLow')}</option>
                <option value="medium">{t('customers.followUp.schedule.priorityMedium')}</option>
                <option value="high">{t('customers.followUp.schedule.priorityHigh')}</option>
                <option value="urgent">{t('customers.followUp.schedule.priorityUrgent')}</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.followUp.schedule.startLabel')}</span>
              <input type="datetime-local" value={startAt} onChange={(event) => handleStartChange(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold" />
            </label>
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.followUp.schedule.endLabel')}</span>
              <input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold" />
            </label>
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.followUp.schedule.modeLabel')}</span>
              <select value={mode} onChange={(event) => setMode(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold">
                <option value="online">online</option>
                <option value="offline">offline</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.statusChange.meetingCallLinkLabel')}</span>
              <input value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold" />
            </label>
            <label className="space-y-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
              <span>{t('customers.followUp.schedule.locationLabel')}</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold" />
            </label>
          </div>

          {scheduleType === 'call' ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-xs font-bold text-[var(--text)]">
                <span>{t('customers.followUp.schedule.callProviderLabel')}</span>
                <select value={callProvider} onChange={(event) => setCallProvider(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold">
                  <option value="manual">manual</option>
                  <option value="cloud_call_center">cloud_call_center</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-bold text-[var(--text)]">
                <span>{t('customers.followUp.schedule.callerNumberLabel')}</span>
                <input value={callerNumber} onChange={(event) => setCallerNumber(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold" />
              </label>
              <label className="space-y-1 text-xs font-bold text-[var(--text)]">
                <span>{t('customers.followUp.schedule.calleeNumberLabel')}</span>
                <input value={calleeNumber} onChange={(event) => setCalleeNumber(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold" />
              </label>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.followUp.schedule.reminderTypeLabel')}</span>
              <select value={reminderType} onChange={(event) => setReminderType(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold">
                <option value="system">system</option>
                <option value="email">email</option>
                <option value="both">both</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.followUp.schedule.reminderBeforeLabel')}</span>
              <input type="number" min="0" value={reminderBefore} onChange={(event) => setReminderBefore(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold" />
            </label>
            <label className="space-y-1 text-xs font-bold text-[var(--text)]">
              <span>{t('customers.followUp.schedule.reminderUnitLabel')}</span>
              <select value={reminderUnit} onChange={(event) => setReminderUnit(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold">
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
            <span>{t('customers.followUp.schedule.descriptionLabel')}</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-[var(--border)] bg-white p-3 text-xs font-semibold text-[var(--text)]"
            />
          </label>
        </div>
      ) : null}

      {error ? <p className="text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </FormDialog>
  )
}
