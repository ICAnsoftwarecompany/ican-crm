import { useEffect, useState } from 'react'
import { CalendarDays, PhoneCall, RefreshCw } from 'lucide-react'

import { useLeadLog } from '../../../../../../features/leads/hooks/useLeads'
import { CallsActionTab } from './CallsTap/CallsActionTab'
import { MeetingsActionTab } from './MeetingTap/MeetingsActionTab'
import { StatusActionTab } from './StatusActionTab'

const TIMELINE_ACTION_TABS = [
  { id: 'status', label: 'الحالات', icon: RefreshCw },
  { id: 'call', label: 'المكالمات', icon: PhoneCall },
  { id: 'meeting', label: 'الاجتماعات', icon: CalendarDays },
]

function TimelineActionTabs({ activeTab, onChange, layoutMode = 'compact' }) {
  const isCompact = layoutMode === 'compact'

  return (
    <div className={`grid grid-cols-3 gap-1 rounded-lg bg-[#F8FEFF] p-1 ${!isCompact ? 'min-h-12' : ''}`}>
      {TIMELINE_ACTION_TABS.map((tab) => {
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[#007A80] shadow-sm ring-1 ring-[#BEEFF2]'
                : 'text-[var(--text-muted)] hover:bg-white/70 hover:text-[var(--text)]'
            } ${!isCompact ? 'text-xs' : ''}`}
          >
            <Icon size={13} className="shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function ActiveTimelineAction({
  activeTab,
  customer,
  statuses,
  currentStatus,
  actionRequest,
  leadLogs,
  isLeadLogsLoading,
  leadLogsError,
  onActionChanged,
  layoutMode,
}) {
  if (activeTab === 'call') {
    return <CallsActionTab customer={customer} onChanged={onActionChanged} actionRequest={actionRequest} layoutMode={layoutMode} />
  }

  if (activeTab === 'meeting') {
    return <MeetingsActionTab customer={customer} onChanged={onActionChanged} actionRequest={actionRequest} layoutMode={layoutMode} />
  }

  return (
    <StatusActionTab
      customer={customer}
      statuses={statuses}
      currentStatus={currentStatus}
      logs={leadLogs}
      isLoading={isLeadLogsLoading}
      error={leadLogsError}
      onChanged={onActionChanged}
      layoutMode={layoutMode}
    />
  )
}

export function TimelineTab({
  customer,
  statuses = [],
  currentStatus,
  actionRequest,
  onActionChanged,
  layoutMode = 'compact',
}) {
  const [activeActionTab, setActiveActionTab] = useState('status')
  const leadId = getLeadId(customer)
  const leadLogQuery = useLeadLog(leadId, undefined, {
    enabled: Boolean(leadId),
  })

  useEffect(() => {
    if (!actionRequest?.actionId) return
    setActiveActionTab(actionRequest.actionId)
  }, [actionRequest])

  return (
    <div className="min-w-0 py-4">
      <div className={`rounded-xl border border-[#E5F7F8] bg-white/80 shadow-sm ${layoutMode === 'wide' ? 'p-4' : 'p-2'}`}>
        <TimelineActionTabs activeTab={activeActionTab} onChange={setActiveActionTab} layoutMode={layoutMode} />
        <div className={layoutMode === 'wide' ? 'mt-4' : 'mt-2'}>
          <ActiveTimelineAction
            activeTab={activeActionTab}
            customer={customer}
            statuses={statuses}
            currentStatus={currentStatus}
            actionRequest={actionRequest}
            leadLogs={leadLogQuery.data || []}
            isLeadLogsLoading={leadLogQuery.isLoading}
            leadLogsError={leadLogQuery.error}
            onActionChanged={onActionChanged}
            layoutMode={layoutMode}
          />
        </div>
      </div>
    </div>
  )
}
