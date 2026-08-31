import { CalendarClock, History, PhoneCall } from 'lucide-react'

import { useLeadCallsMeetings } from '../../../../../../../../features/meetings/hooks/useMeetings'
import { QuickActionMenu } from '../../../../quick-actions/QuickActionMenu'
import { getCustomerPhone, normalizePhoneForUrl, openExternalAction } from '../../../../quick-actions/quickActionUtils'

const CALL_ALERT_WINDOW_MS = 24 * 60 * 60 * 1000
const ALERT_CALL_STATUSES = new Set(['scheduled', 'in_progress'])

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function getTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function hasCallTimingAlert(calls) {
  const now = Date.now()
  const alertUntil = now + CALL_ALERT_WINDOW_MS

  return calls.some((call) => {
    const status = String(call?.status || '').toLowerCase()
    if (!ALERT_CALL_STATUSES.has(status)) return false
    if (status === 'in_progress') return true

    const startTime = getTime(call?.start_at)
    return Boolean(startTime && startTime <= alertUntil)
  })
}

export function CallQuickAction({ customer, onTimelineAction }) {
  const phone = normalizePhoneForUrl(getCustomerPhone(customer))
  const leadId = getLeadId(customer)
  const callsQuery = useLeadCallsMeetings(leadId, undefined, {
    enabled: Boolean(leadId),
    staleTime: 1000 * 30,
  })
  const calls = (callsQuery.data || []).filter((item) => String(item?.type || '').toLowerCase() === 'call')
  const hasAlert = hasCallTimingAlert(calls)

  return (
    <QuickActionMenu
      icon={PhoneCall}
      label=""
      accentClassName="text-[#047857]"
      alert={hasAlert}
      alertTitle={hasAlert ? 'يوجد مكالمة قريبة أو متأخرة لهذا العميل' : undefined}
      options={[
        {
          id: 'call-now',
          label: 'مكالمة الآن',
          icon: PhoneCall,
          onClick: () => openExternalAction(phone ? `tel:${phone}` : '', 'لا يوجد رقم هاتف لهذا العميل.'),
        },
        {
          id: 'schedule-call',
          label: 'إضافة موعد مكالمة',
          icon: CalendarClock,
          onClick: () => onTimelineAction?.('call', { intent: 'schedule' }),
        },
        {
          id: 'call-history',
          label: 'عرض سجل المكالمات',
          icon: History,
          onClick: () => onTimelineAction?.('call', { intent: 'history' }),
        },
      ]}
    />
  )
}
