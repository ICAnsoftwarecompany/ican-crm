import { CalendarPlus, History, MonitorUp, Video } from 'lucide-react'

import { useLeadCallsMeetings } from '../../../../../../../../features/meetings/hooks/useMeetings'
import { QuickActionMenu } from '../../../../quick-actions/QuickActionMenu'
import { notifySoon, openExternalAction } from '../../../../quick-actions/quickActionUtils'

const MEETING_ALERT_WINDOW_MS = 24 * 60 * 60 * 1000
const ALERT_MEETING_STATUSES = new Set(['scheduled', 'in_progress'])

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function getTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function hasMeetingTimingAlert(meetings) {
  const now = Date.now()
  const alertUntil = now + MEETING_ALERT_WINDOW_MS

  return meetings.some((meeting) => {
    const status = String(meeting?.status || '').toLowerCase()
    if (!ALERT_MEETING_STATUSES.has(status)) return false
    if (status === 'in_progress') return true

    const startTime = getTime(meeting?.start_at)
    return Boolean(startTime && startTime <= alertUntil)
  })
}

export function MeetingQuickAction({ customer, onTimelineAction }) {
  const leadId = getLeadId(customer)
  const meetingsQuery = useLeadCallsMeetings(leadId, undefined, {
    enabled: Boolean(leadId),
    staleTime: 1000 * 30,
  })
  const meetings = (meetingsQuery.data || []).filter((item) => String(item?.type || '').toLowerCase() === 'meeting')
  const hasAlert = hasMeetingTimingAlert(meetings)

  return (
    <QuickActionMenu
      icon={Video}
      label="ميتينج"
      accentClassName="text-[#7C3AED]"
      alert={hasAlert}
      alertTitle={hasAlert ? 'يوجد اجتماع قريب أو متأخر لهذا العميل' : undefined}
      options={[
        {
          id: 'schedule-meeting',
          label: 'إضافة موعد اجتماع',
          icon: CalendarPlus,
          onClick: () => onTimelineAction?.('meeting', { intent: 'schedule' }),
        },
        {
          id: 'meeting-history',
          label: 'عرض سجل الاجتماعات',
          icon: History,
          onClick: () => onTimelineAction?.('meeting', { intent: 'history' }),
        },
        {
          id: 'google-meet',
          label: 'Google Meet',
          icon: MonitorUp,
          onClick: () => openExternalAction('https://meet.google.com/new', 'تعذر فتح Google Meet.'),
        },
        {
          id: 'zoom',
          label: 'Zoom',
          icon: Video,
          onClick: () => {
            notifySoon('تم اختيار Zoom')
            openExternalAction('https://zoom.us/start/videomeeting', 'تعذر فتح Zoom.')
          },
        },
      ]}
    />
  )
}
