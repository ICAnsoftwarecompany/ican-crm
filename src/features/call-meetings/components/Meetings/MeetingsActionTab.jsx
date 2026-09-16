import { useEffect, useMemo, useState } from 'react'
import { AlarmClockCheck, CalendarDays, Clock3, Link as LinkIcon, Loader2, MapPin, Plus, UserRound, Video } from 'lucide-react'

import { useLeadCallsMeetings } from '../../../meetings/hooks/useMeetings'
import { Button } from '../../../../shared/components/ui/Button'
import { fieldValue, formatDateTime12 } from '../../utils/scheduleUiUtils'
import { MeetingFilters, getMeetingStatusLabel } from './MeetingFilters'
import { MeetingReminderBanner } from './MeetingReminderBanner'
import { ScheduleActivityDialog } from '../ScheduleActivityDialog'
import { MeetingDataDrawer } from '../MeetingDataDrawer'

const ACTIVE_MEETING_STATUSES = new Set(['scheduled', 'in_progress'])

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function toTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function isWithinDateRange(meeting, filters) {
  if (!filters.from && !filters.to) return true

  const startTime = toTime(meeting?.start_at)
  if (!startTime) return false

  if (filters.from) {
    const fromTime = new Date(`${filters.from}T00:00:00`).getTime()
    if (startTime < fromTime) return false
  }

  if (filters.to) {
    const toTimeValue = new Date(`${filters.to}T23:59:59`).getTime()
    if (startTime > toTimeValue) return false
  }

  return true
}

function getLatestActiveMeeting(meetings) {
  return meetings
    .filter((meeting) => ACTIVE_MEETING_STATUSES.has(String(meeting?.status || '').toLowerCase()))
    .filter((meeting) => toTime(meeting?.start_at))
    .sort((first, second) => toTime(second.start_at) - toTime(first.start_at))[0]
}

function getReminderWindowMs(reminderBefore, reminderUnit, defaultMs = 60 * 60 * 1000) {
  const before = Number(reminderBefore)
  if (!Number.isFinite(before) || before <= 0) return defaultMs

  const unit = String(reminderUnit || '').trim().toLowerCase()
  const map = {
    minute: 60 * 1000,
    minutes: 60 * 1000,
    min: 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
  }

  return before * (map[unit] || 60 * 1000)
}

function isAlarmActive(schedule, nowTimestamp = Date.now()) {
  const status = String(schedule?.status || '').trim().toLowerCase()
  if (status !== 'scheduled') return false

  const startAt = toTime(schedule?.start_at)
  if (!startAt) return false

  const reminderWindow = getReminderWindowMs(schedule?.reminder_before, schedule?.reminder_unit)
  return nowTimestamp >= (startAt - reminderWindow) && nowTimestamp < startAt
}

function getStatusStyle(status) {
  const normalized = String(status || '').trim().toLowerCase()

  if (normalized === 'completed') {
    return {
      card: 'border-[#86EFAC] bg-[#F0FDF4]',
      badge: 'bg-[#DCFCE7] text-[#166534]',
    }
  }

  if (normalized === 'cancelled') {
    return {
      card: 'border-[#FCA5A5] bg-[#FEF2F2]',
      badge: 'bg-[#FEE2E2] text-[#991B1B]',
    }
  }

  if (normalized === 'scheduled') {
    return {
      card: 'border-[#FDE68A] bg-[#FFFBEB]',
      badge: 'bg-[#FEF3C7] text-[#92400E]',
    }
  }

  if (normalized === 'in_progress') {
    return {
      card: 'border-[#FDBA74] bg-[#FFF7ED]',
      badge: 'bg-[#FFEDD5] text-[#9A3412]',
    }
  }

  return {
    card: 'border-[#E5F7F8] bg-white',
    badge: 'bg-[#F8FEFF] text-[var(--text-muted)]',
  }
}

function MeetingCard({ meeting, onOpenDetails }) {
  const creatorName = meeting?.creator?.name || meeting?.creator?.username
  const participants = Array.isArray(meeting?.participants) ? meeting.participants : []
  const hasMeetingLink = Boolean(meeting?.meeting_link)
  const hasLocation = Boolean(meeting?.location)
  const statusStyle = getStatusStyle(meeting?.status)
  const showAlarm = isAlarmActive(meeting)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails?.(meeting)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onOpenDetails?.(meeting)
      }}
      className={`rounded-xl border p-3 text-start shadow-sm transition hover:border-[#00C2CB] hover:shadow-md ${statusStyle.card}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
          <CalendarDays size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4 className="min-w-0 truncate text-sm font-black text-[var(--text)]">
              {fieldValue(meeting?.title, 'اجتماع بدون عنوان')}
            </h4>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle.badge}`}>
              {getMeetingStatusLabel(meeting?.status)}
            </span>
            {showAlarm ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-black text-[#B91C1C]">
                <AlarmClockCheck size={11} />
                Alarm
              </span>
            ) : null}
            {meeting?.priority && (
              <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#92400E]">
                {meeting.priority}
              </span>
            )}
          </div>

          {meeting?.description && (
            <p className="mt-1 break-words text-xs font-semibold text-[var(--text-muted)]">
              {meeting.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
            {meeting?.start_at && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                <Clock3 size={12} />
                يبدأ: {formatDateTime12(meeting.start_at)}
              </span>
            )}
            {meeting?.end_at && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                <Clock3 size={12} />
                ينتهي: {formatDateTime12(meeting.end_at)}
              </span>
            )}
            {meeting?.mode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                <Video size={12} />
                {meeting.mode}
              </span>
            )}
            {creatorName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                <UserRound size={12} />
                {creatorName}
              </span>
            )}
          </div>

          {(hasMeetingLink || hasLocation) && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              {hasMeetingLink && (
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#E8F9FA] px-2 py-1 text-[#007A80] hover:underline"
                >
                  <LinkIcon size={12} />
                  <span className="truncate">رابط الاجتماع</span>
                </a>
              )}
              {hasLocation && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1 text-[var(--text-muted)]">
                  <MapPin size={12} />
                  <span className="truncate">{meeting.location}</span>
                </span>
              )}
            </div>
          )}

          {participants.length > 0 && (
            <div className="mt-2 text-[11px] font-semibold text-[var(--text-muted)]">
              المشاركون: {participants.map((participant) => (
                participant?.user?.name || participant?.user?.username || `#${participant?.user_id}`
              )).filter(Boolean).join('، ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MeetingsActionTab({ customer, onChanged, actionRequest, layoutMode = 'compact' }) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    status: '',
  })
  const leadId = getLeadId(customer)
  const meetingsQuery = useLeadCallsMeetings(leadId, undefined, {
    enabled: Boolean(leadId),
  })

  const meetings = useMemo(() => (
    (meetingsQuery.data || [])
      .filter((item) => String(item?.type || '').toLowerCase() === 'meeting')
      .sort((first, second) => toTime(second?.start_at) - toTime(first?.start_at))
  ), [meetingsQuery.data])

  const filteredMeetings = useMemo(() => (
    meetings.filter((meeting) => {
      const status = String(meeting?.status || '').toLowerCase()
      const matchesStatus = filters.status ? status === filters.status : true

      return matchesStatus && isWithinDateRange(meeting, filters)
    })
  ), [filters, meetings])

  const latestActiveMeeting = useMemo(() => getLatestActiveMeeting(meetings), [meetings])
  const hasActiveFilters = Boolean(filters.from || filters.to || filters.status)

  useEffect(() => {
    if (actionRequest?.actionId !== 'meeting') return
    if (actionRequest?.intent !== 'schedule') return
    setIsScheduleDialogOpen(true)
  }, [actionRequest])

  const updateFilters = (nextFilters) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }))
  }

  const resetFilters = () => {
    setFilters({
      from: '',
      to: '',
      status: '',
    })
  }

  const handleCreated = (result, payload) => {
    meetingsQuery.refetch()
    onChanged?.({
      customer,
      actionType: 'activity',
      activityType: 'meeting',
      activityTitle: payload?.title || result?.data?.title || 'موعد اجتماع',
    })
  }

  const handleDetailsChanged = () => {
    meetingsQuery.refetch()
    onChanged?.({
      customer,
      actionType: 'activity',
      activityType: 'meeting',
      activityTitle: 'تحديث بيانات الاجتماع',
    })
  }

  if (!leadId) {
    return (
      <div className="rounded-lg border border-[#E5F7F8] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">
        لا يوجد Lead مرتبط بهذا العميل.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MeetingFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <Button
          type="button"
          size="sm"
          variant="ai"
          onClick={() => setIsScheduleDialogOpen(true)}
          className="shrink-0 justify-center gap-2"
        >
          <Plus size={14} />
          إضافة موعد اجتماع
        </Button>
      </div>

      <MeetingReminderBanner meeting={latestActiveMeeting} />

      <div className="space-y-2 border-t border-[#E5F7F8] pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-black text-[var(--text)]">الاجتماعات المسجلة</h3>
          <span className="rounded-full bg-[#F8FEFF] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
            {hasActiveFilters ? `${filteredMeetings.length} / ${meetings.length}` : meetings.length}
          </span>
        </div>

        {meetingsQuery.isLoading && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E5F7F8] bg-white p-4 text-xs font-bold text-[#007A80]">
            <Loader2 size={15} className="animate-spin" />
            جاري تحميل الاجتماعات...
          </div>
        )}

        {meetingsQuery.isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-700">
            تعذر تحميل الاجتماعات.
          </div>
        )}

        {!meetingsQuery.isLoading && !meetingsQuery.isError && filteredMeetings.length === 0 && (
          <div className="rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-4 text-center text-xs font-semibold text-[var(--text-muted)]">
            لا توجد اجتماعات مطابقة للفلاتر الحالية.
          </div>
        )}

        {!meetingsQuery.isLoading && !meetingsQuery.isError && filteredMeetings.length > 0 && (
          <div className={layoutMode === 'wide' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {filteredMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} onOpenDetails={setSelectedMeeting} />
            ))}
          </div>
        )}
      </div>

      <ScheduleActivityDialog
        type="meeting"
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        customer={customer}
        relatedType="customer"
        presentation="drawer"
        avoidCustomerDetailsDrawer
        onCreated={handleCreated}
      />
      <MeetingDataDrawer
        open={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        schedule={selectedMeeting}
        customer={customer}
        onChanged={handleDetailsChanged}
      />
    </div>
  )
}
