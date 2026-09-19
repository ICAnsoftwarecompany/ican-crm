import { ExternalLink, FileText } from 'lucide-react'

import { ActivityLifecycleActions } from '../ActivityStatus/ActivityLifecycleActions'
import { ActivityStatusBadge } from '../ActivityStatus/ActivityStatusBadge'
import { ActivityPriorityBadge } from '../common/ActivityPriorityBadge'
import { ActivityTypeBadge } from '../common/ActivityTypeBadge'
import { formatActivityDateTime, formatDuration } from '../../utils/activityDateHelpers'
import { getOutcomeLabel } from '../../utils/activityOutcomes'

function SmallText({ children }) {
  return <span className="block min-w-0 whitespace-normal break-words text-xs font-semibold text-[var(--text-muted)]">{children || '-'}</span>
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function parseDateTime(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getReminderWindowMs(activity) {
  const before = Number(firstValue(activity?.reminderBefore, activity?.raw?.reminder_before))
  if (!Number.isFinite(before) || before <= 0) return 0

  const unit = String(firstValue(activity?.reminderUnit, activity?.raw?.reminder_unit, '')).trim().toLowerCase()
  const map = {
    minute: 60 * 1000,
    minutes: 60 * 1000,
    min: 60 * 1000,
    mins: 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
  }

  return before * (map[unit] || 60 * 1000)
}

function formatClockParts(totalMs) {
  const absMs = Math.max(0, Math.abs(totalMs))
  const totalSeconds = Math.floor(absMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function getStatusTimingText(activity, nowTimestamp, t) {
  const status = String(activity?.status || '').trim().toLowerCase()
  const startAt = parseDateTime(firstValue(activity?.startAt, activity?.raw?.start_at))
  const actualStart = parseDateTime(firstValue(activity?.actualStartAt, activity?.raw?.actual_start_at))
  if (!startAt && !actualStart) return { text: '', late: false }

  if (status === 'in_progress' && actualStart) {
    return { text: t('activities.table.sinceLabel', { value: formatClockParts(nowTimestamp - actualStart.getTime()) }), late: false }
  }

  if (status !== 'scheduled' || !startAt) return { text: '', late: false }

  const diff = startAt.getTime() - nowTimestamp
  if (diff >= 0) {
    return { text: t('activities.table.remainingLabel', { value: formatClockParts(diff) }), late: false }
  }

  return { text: t('activities.table.overdueLabel', { value: formatClockParts(diff) }), late: true }
}

function getRelatedDisplayName(activity) {
  return firstValue(
    activity?.relatedEntity?.raw?.name,
    activity?.relatedEntity?.raw?.full_name,
    activity?.relatedEntity?.raw?.customer_name,
    activity?.relatedEntity?.raw?.lead_name,
    activity?.raw?.customer?.name,
    activity?.raw?.lead?.name,
    activity?.raw?.customer_name,
    activity?.raw?.lead_name,
    activity?.relatedEntity?.name,
    '-'
  )
}

function resolveCustomerLookupKey(activity) {
  const entityType = String(firstValue(activity?.relatedEntity?.type, activity?.raw?.taskable_type) || '').toLowerCase()
  const explicitCustomerId = firstValue(activity?.raw?.customer_id, activity?.raw?.customer?.id)
  const explicitLeadId = firstValue(activity?.raw?.lead_id, activity?.raw?.lead?.id)
  const taskableId = firstValue(activity?.raw?.taskable_id, activity?.relatedEntity?.id)

  if (entityType.includes('customer')) {
    if (explicitCustomerId !== undefined && explicitCustomerId !== null && explicitCustomerId !== '') {
      return `customer:${String(explicitCustomerId)}`
    }
    if (taskableId !== undefined && taskableId !== null && taskableId !== '') {
      return `customer:${String(taskableId)}`
    }
  }

  if (entityType.includes('lead')) {
    if (explicitLeadId !== undefined && explicitLeadId !== null && explicitLeadId !== '') {
      return `lead:${String(explicitLeadId)}`
    }
    if (taskableId !== undefined && taskableId !== null && taskableId !== '') {
      return `lead:${String(taskableId)}`
    }
  }

  if (explicitCustomerId !== undefined && explicitCustomerId !== null && explicitCustomerId !== '') {
    return `customer:${String(explicitCustomerId)}`
  }
  if (explicitLeadId !== undefined && explicitLeadId !== null && explicitLeadId !== '') {
    return `lead:${String(explicitLeadId)}`
  }
  if (taskableId !== undefined && taskableId !== null && taskableId !== '') {
    return `customer:${String(taskableId)}`
  }

  return ''
}

function getCustomerData(activity, customerDataLookup) {
  const lookupKey = resolveCustomerLookupKey(activity)
  const fromLookup = lookupKey ? customerDataLookup?.get?.(lookupKey) : null

  const fallback = {
    name: getRelatedDisplayName(activity),
    email: firstValue(activity?.raw?.customer?.email, activity?.raw?.lead?.email, activity?.relatedEntity?.email, ''),
    phone: firstValue(activity?.raw?.customer?.phone, activity?.raw?.lead?.phone, activity?.relatedEntity?.phone, ''),
    company: firstValue(activity?.raw?.customer?.company, activity?.raw?.lead?.company, activity?.relatedEntity?.company, ''),
    source: firstValue(activity?.raw?.customer?.source, activity?.raw?.lead?.source, activity?.relatedEntity?.source, ''),
    agentName: firstValue(activity?.raw?.customer?.agent?.name, activity?.raw?.agent?.name, activity?.raw?.agent_name, ''),
    statusName: firstValue(activity?.raw?.customer?.lead?.status?.status, activity?.raw?.lead?.status?.status, ''),
  }

  return {
    ...fallback,
    ...(fromLookup || {}),
  }
}

export function buildActivityColumns({
  onView,
  onEdit,
  onStart,
  onFinish,
  onCancel,
  onDelete,
  onFollowUp,
  onOpenRelated,
  customerDataLookup,
  nowTimestamp = Date.now(),
  t,
}) {
  const columns = [
    {
      id: 'type',
      header: t('activities.table.type'),
      accessor: 'type',
      sortable: true,
      customWidth: 120,
      render: (activity) => <ActivityTypeBadge type={activity.type} />,
    },
    {
      id: 'related',
      header: t('activities.table.relatedLeadCustomer'),
      accessor: 'relatedEntity.name',
      sortable: true,
      customWidth: 220,
      render: (activity) => {
        const customerData = getCustomerData(activity, customerDataLookup)
        const displayName = customerData?.name || getRelatedDisplayName(activity)
        const status = String(activity?.status || '').trim().toLowerCase()
        const actualStartAt = parseDateTime(firstValue(activity?.actualStartAt, activity?.raw?.actual_start_at))
        const elapsedText = status === 'in_progress' && actualStartAt
          ? t('activities.table.elapsedTimePrefix', { value: formatClockParts(nowTimestamp - actualStartAt.getTime()) })
          : ''

        return (
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="block whitespace-normal break-words text-sm font-black text-[var(--text)]">{displayName}</span>
              {status === 'in_progress' ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#FECACA] bg-[#FFF1F2] px-2 py-0.5 text-[10px] font-black text-[#B91C1C]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#EF4444]" />
                  {t('activities.meetingDrawer.live')}
                </span>
              ) : null}
              <SmallText>{elapsedText || customerData?.company || activity.relatedEntity?.company}</SmallText>
            </div>
            {activity.relatedEntity?.id ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenRelated?.(activity)
                }}
                className="mt-0.5 shrink-0 rounded-lg border border-[#BEEFF2] bg-[#F8FEFF] p-1 text-[#007A80] hover:bg-[#E8F9FA]"
                title={t('activities.table.openCustomerTitle')}
              >
                <ExternalLink size={14} />
              </button>
            ) : null}
          </div>
        )
      },
    },
    {
      id: 'customerEmail',
      header: t('activities.table.customerEmail'),
      accessor: 'relatedEntity.email',
      sortable: true,
      customWidth: 200,
      render: (activity) => {
        const customerData = getCustomerData(activity, customerDataLookup)
        return <span className="text-xs font-semibold text-[var(--text)]">{customerData?.email || '-'}</span>
      },
    },
    {
      id: 'customerPhone',
      header: t('customers.phone'),
      accessor: 'relatedEntity.phone',
      sortable: true,
      customWidth: 150,
      render: (activity) => {
        const customerData = getCustomerData(activity, customerDataLookup)
        return <span className="text-xs font-semibold text-[var(--text)]">{customerData?.phone || '-'}</span>
      },
    },
    {
      id: 'customerCompany',
      header: t('activities.table.customerCompany'),
      accessor: 'relatedEntity.company',
      sortable: true,
      customWidth: 170,
      render: (activity) => {
        const customerData = getCustomerData(activity, customerDataLookup)
        return <span className="text-xs font-semibold text-[var(--text)]">{customerData?.company || '-'}</span>
      },
    },
    {
      id: 'customerSource',
      header: t('activities.meetingDrawer.fields.source'),
      accessor: 'relatedEntity.source',
      sortable: true,
      customWidth: 140,
      render: (activity) => {
        const customerData = getCustomerData(activity, customerDataLookup)
        return <span className="text-xs font-semibold text-[var(--text)]">{customerData?.source || '-'}</span>
      },
    },
    {
      id: 'customerAgent',
      header: t('activities.table.customerAgent'),
      accessor: 'assignedUser.name',
      sortable: true,
      customWidth: 150,
      render: (activity) => {
        const customerData = getCustomerData(activity, customerDataLookup)
        return <span className="text-xs font-semibold text-[var(--text)]">{customerData?.agentName || '-'}</span>
      },
    },
    {
      id: 'status',
      header: t('activities.table.status'),
      accessor: 'status',
      sortable: true,
      customWidth: 185,
      render: (activity) => {
        const timing = getStatusTimingText(activity, nowTimestamp, t)

        return (
          <div className="space-y-1">
            <ActivityStatusBadge activity={activity} />
            {timing.text ? (
              <div className={`text-[11px] font-black ${timing.late ? 'text-[#B91C1C]' : 'text-[#0369A1]'}`}>
                {timing.text}
              </div>
            ) : null}
          </div>
        )
      },
    },
    {
      id: 'customerLeadStatus',
      header: t('activities.table.customerLeadStatus'),
      accessor: 'relatedEntity.status',
      sortable: true,
      customWidth: 170,
      render: (activity) => {
        const customerData = getCustomerData(activity, customerDataLookup)
        return <span className="text-xs font-semibold text-[var(--text)]">{customerData?.statusName || '-'}</span>
      },
    },
    {
      id: 'title',
      header: t('activities.table.title'),
      accessor: 'title',
      sortable: true,
      customWidth: 260,
      render: (activity) => (
        <div className="min-w-0 space-y-1">
          <span className="block whitespace-normal break-words text-sm font-black text-[var(--text)]">{activity.title}</span>
          <SmallText>{activity.description}</SmallText>
        </div>
      ),
    },
    {
      id: 'assigned',
      header: t('activities.table.assigned'),
      accessor: 'assignedUser.name',
      sortable: true,
      customWidth: 170,
      render: (activity) => (
        <div className="min-w-0">
          <span className="block whitespace-normal break-words text-sm font-black text-[var(--text)]">{activity.assignedUser?.name || '-'}</span>
          <SmallText>{activity.assignedTeam?.name}</SmallText>
        </div>
      ),
    },
    {
      id: 'startAt',
      header: t('activities.table.startAt'),
      accessor: 'startAt',
      sortable: true,
      customWidth: 170,
      render: (activity) => <span className="whitespace-normal break-words font-bold">{formatActivityDateTime(activity.startAt)}</span>,
    },
    {
      id: 'endAt',
      header: t('activities.table.endAt'),
      accessor: 'endAt',
      sortable: true,
      customWidth: 170,
      render: (activity) => (
        <div className="min-w-0 space-y-1">
          <span className="block whitespace-normal break-words font-bold">{formatActivityDateTime(activity.endAt)}</span>
          <SmallText>{formatDuration(activity.startAt, activity.endAt, t)}</SmallText>
        </div>
      ),
    },
    {
      id: 'priority',
      header: t('activities.scheduleDialog.priorityLabel'),
      accessor: 'priority',
      sortable: true,
      customWidth: 125,
      render: (activity) => <ActivityPriorityBadge priority={activity.priority} />,
    },
    {
      id: 'outcome',
      header: t('activities.meetingDrawer.fields.outcome'),
      accessor: 'outcome',
      sortable: true,
      customWidth: 150,
      render: (activity) => <span className="whitespace-normal break-words font-bold">{getOutcomeLabel(activity.outcome, activity.type, t)}</span>,
    },
    {
      id: 'nextAction',
      header: t('activities.meetingDrawer.fields.nextAction'),
      accessor: 'nextAction',
      sortable: true,
      customWidth: 150,
      render: (activity) => <span className="whitespace-normal break-words font-bold">{activity.nextAction || '-'}</span>,
    },
    {
      id: 'report',
      header: t('activities.table.report'),
      accessor: 'hasReport',
      sortable: true,
      customWidth: 120,
      render: (activity) => (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black ${activity.hasReport ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
          <FileText size={13} />
          {activity.hasReport ? t('activities.table.reportPresent') : t('activities.table.reportMissing')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('activities.table.actions'),
      accessor: 'id',
      customWidth: 260,
      enableFilter: false,
      sortable: false,
      render: (activity) => (
        <ActivityLifecycleActions
          activity={activity}
          onView={() => onView?.(activity)}
          onEdit={() => onEdit?.(activity)}
          onStart={() => onStart?.(activity)}
          onFinish={() => onFinish?.(activity)}
          onCancel={() => onCancel?.(activity)}
          onDelete={() => onDelete?.(activity)}
          onFollowUp={() => onFollowUp?.(activity)}
          compact
        />
      ),
    },
  ]

  const statusIndex = columns.findIndex((column) => column.id === 'status')
  if (statusIndex > -1) {
    const [statusColumn] = columns.splice(statusIndex, 1)
    columns.splice(1, 0, statusColumn)
  }

  return columns
}
