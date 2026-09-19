import { CalendarClock, History, PhoneCall } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useLeadCallsMeetings } from '../../../meetings/hooks/useMeetings'
import { QuickActionMenu } from '../../../../pages/customers/components/CustomerDetailsDrawer/quick-actions/QuickActionMenu'
import { getCustomerPhone, normalizePhoneForUrl, openExternalAction } from '../../utils/scheduleUiUtils'

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
  const { t } = useTranslation()
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
      alertTitle={hasAlert ? t('callMeetings.quickAction.upcomingOrOverdueCall') : undefined}
      options={[
        {
          id: 'call-now',
          label: t('callMeetings.quickAction.callNow'),
          icon: PhoneCall,
          onClick: () => openExternalAction(phone ? `tel:${phone}` : '', t('callMeetings.quickAction.noPhoneNumber')),
        },
        {
          id: 'schedule-call',
          label: t('callMeetings.actionTab.addCallAppointment'),
          icon: CalendarClock,
          onClick: () => onTimelineAction?.('call', { intent: 'schedule' }),
        },
        {
          id: 'call-history',
          label: t('callMeetings.quickAction.viewCallHistory'),
          icon: History,
          onClick: () => onTimelineAction?.('call', { intent: 'history' }),
        },
      ]}
    />
  )
}
