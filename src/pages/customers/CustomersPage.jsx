import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArchiveRestore, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from '../../shared/components/data-table'
import { useLocalStorage } from '../../shared/components/data-table/hooks/useLocalStorage'
import { NewCustomerDialog } from '../../features/customers/components/NewCustomerDialog'
import { useCustomerMutations, useCustomers, useDeletedCustomers } from '../../features/customers/hooks/useCustomers'
import { CustomersPageHeader } from './components/CustomersPageHeader'
import { CustomerDetailsDrawer } from './components/CustomerDetailsDrawer/CustomerDetailsDrawer'
import { LeadStatusTabs } from './components/StatusTaps/LeadStatusTabs'
import { TableSettingsDrawer } from './components/TableSettingsDrawer'
import { useCustomersTableColumns } from './components/CustomersTableColumns'
import { CustomersBulkActions } from './components/CustomersBulkActions'
import { enrichCustomerMarketingRow } from './components/customers-table'
import { filterCustomersByStatusId } from './utils/customerStatus'
import { useCustomersTableRealtime } from '../../realtime'
import { useMessengerConversations } from '../../features/conversations/hooks/useConversations'
import { getMessengerConversationId } from '../../features/conversations/utils/messengerConversations'
import { useGmailConversations } from '../../features/conversations/hooks/useGmailConversations'
import { getGmailConversationId } from '../../features/conversations/utils/gmailConversations'
import { useLeadLogs } from '../../features/leads/hooks/useLeads'
import { definitionsApi } from '../../features/definitions/api/definitionsApi'
import { requestOpenMessengerSidebar } from '../../features/conversations/constants/messengerSidebarEvents'
import { extractLeadStatuses } from './utils/customerStatus'
import { FollowUpNoteDialog } from './components/follow-up-note'
import { MeetingDataDrawer, ScheduleActivityDialog } from '../../features/call-meetings'
import { buildAfterMeetingReportUrl, buildScheduleStatusPayload } from '../../features/call-meetings/utils/scheduleUiUtils'
import { useMeetingMutations } from '../../features/meetings/hooks/useMeetings'

const ACTIVITY_RANGE_VALUES = [1, 7, 15, 30]

function getActivityRangeOptions(t) {
  return ACTIVITY_RANGE_VALUES.map((value) => ({
    value,
    label: value === 1
      ? (t ? t('customers.table.range.today') : 'Today')
      : (t ? t('activities.duration.day', { count: value }) : `${value} days`),
  }))
}

function parseBackendLocalDateParts(value) {
  if (!value) return null

  const normalized = String(value)
    .trim()
    .replace('T', ' ')
    .replace(/(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/, '')

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return null

  const [, year, month, day, hour, minute, second = '0'] = match
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  }
}

function parseBackendLocalTimestamp(value) {
  const parts = parseBackendLocalDateParts(value)
  if (!parts) return Number.NaN

  const time = new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  ).getTime()

  return Number.isNaN(time) ? Number.NaN : time
}

function formatBackendTime12(value, t) {
  const parts = parseBackendLocalDateParts(value)
  if (!parts) return '-'

  const hour12 = parts.hour % 12 || 12
  const period = parts.hour >= 12 ? (t ? t('common.pm') : 'PM') : (t ? t('common.am') : 'AM')
  const minutes = String(parts.minute).padStart(2, '0')
  return `${hour12}:${minutes} ${period}`
}

function getTodayActivitiesByType(rows = [], type = 'meeting', nowTimestamp = Date.now()) {
  const now = new Date(nowTimestamp)
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  const normalizedType = String(type || '').trim().toLowerCase()
  const list = []

  rows.forEach((row) => {
    const lead = row?.lead || {}
    const customerId = row?.id || row?.customer_id || lead?.id || row?.lead_id || ''
    const customerName = lead?.name || row?.name || row?.email || row?.phone || 'عميل'

    const meetings = Array.isArray(lead?.meetings) ? lead.meetings : []
    const activitiesFromMeetings = meetings.filter((activity) => normalizeActivityType(activity?.type) === normalizedType)

    const fallbackCandidates = [
      row?.last_meeting,
      lead?.last_meeting,
      row?.last_call,
      lead?.last_call,
    ].filter((activity) => activity && typeof activity === 'object' && normalizeActivityType(activity?.type) === normalizedType)

    const candidates = activitiesFromMeetings.length ? activitiesFromMeetings : fallbackCandidates

    candidates.forEach((activity, index) => {
      const parts = parseBackendLocalDateParts(activity?.start_at)
      if (!parts) return

      const activityKey = `${parts.year}-${parts.month}-${parts.day}`
      if (activityKey !== todayKey) return

      const startTimestamp = parseBackendLocalTimestamp(activity?.start_at)
      if (Number.isNaN(startTimestamp)) return

      list.push({
        id: `${normalizedType}-${customerId}-${activity?.id || index}-${activity?.start_at || ''}`,
        activityId: resolveActivityId(activity),
        type: normalizeActivityType(activity?.type) || normalizedType,
        customerName,
        title: activity?.title || activity?.description || '-',
        startAt: activity?.start_at,
        startTimestamp,
        status: String(activity?.status || '').trim().toLowerCase(),
      })
    })
  })

  list.sort((first, second) => {
    const firstUpcoming = first.startTimestamp >= nowTimestamp
    const secondUpcoming = second.startTimestamp >= nowTimestamp

    if (firstUpcoming !== secondUpcoming) return firstUpcoming ? -1 : 1
    if (firstUpcoming && secondUpcoming) return first.startTimestamp - second.startTimestamp
    return second.startTimestamp - first.startTimestamp
  })

  return list
}

function getActivitiesByTypeInRange(rows = [], type = 'meeting', nowTimestamp = Date.now(), rangeDays = 1) {
  const normalizedRangeDays = Math.max(1, Number(rangeDays) || 1)
  const now = new Date(nowTimestamp)
  const rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const rangeEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  rangeEndDate.setDate(rangeEndDate.getDate() + normalizedRangeDays)
  const rangeEnd = rangeEndDate.getTime()
  const normalizedType = String(type || '').trim().toLowerCase()
  const list = []

  rows.forEach((row) => {
    const lead = row?.lead || {}
    const customerId = row?.id || row?.customer_id || lead?.id || row?.lead_id || ''
    const customerName = lead?.name || row?.name || row?.email || row?.phone || 'عميل'

    const meetings = Array.isArray(lead?.meetings) ? lead.meetings : []
    const activitiesFromMeetings = meetings.filter((activity) => normalizeActivityType(activity?.type) === normalizedType)

    const fallbackCandidates = [
      row?.last_meeting,
      lead?.last_meeting,
      row?.last_call,
      lead?.last_call,
    ].filter((activity) => activity && typeof activity === 'object' && normalizeActivityType(activity?.type) === normalizedType)

    const candidates = activitiesFromMeetings.length ? activitiesFromMeetings : fallbackCandidates

    candidates.forEach((activity, index) => {
      const startTimestamp = parseBackendLocalTimestamp(activity?.start_at)
      if (Number.isNaN(startTimestamp)) return
      if (startTimestamp < rangeStart || startTimestamp >= rangeEnd) return

      list.push({
        id: `${normalizedType}-${customerId}-${activity?.id || index}-${activity?.start_at || ''}`,
        activityId: resolveActivityId(activity),
        type: normalizeActivityType(activity?.type) || normalizedType,
        customerName,
        title: activity?.title || activity?.description || '-',
        startAt: activity?.start_at,
        startTimestamp,
        status: String(activity?.status || '').trim().toLowerCase(),
      })
    })
  })

  list.sort((first, second) => {
    const firstUpcoming = first.startTimestamp >= nowTimestamp
    const secondUpcoming = second.startTimestamp >= nowTimestamp

    if (firstUpcoming !== secondUpcoming) return firstUpcoming ? -1 : 1
    if (firstUpcoming && secondUpcoming) return first.startTimestamp - second.startTimestamp
    return second.startTimestamp - first.startTimestamp
  })

  return list
}

function getActivityRangeLabel(rangeDays, t) {
  const option = getActivityRangeOptions(t).find((item) => Number(item.value) === Number(rangeDays))
  return option?.label || (t ? t('activities.duration.day', { count: rangeDays }) : `${rangeDays} days`)
}

function formatBackendDateShort(value) {
  const parts = parseBackendLocalDateParts(value)
  if (!parts) return ''

  return `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${parts.year}`
}

function getActivityStatusLabel(status = '', t) {
  if (status === 'scheduled') return t ? t('activities.status.scheduled') : 'Scheduled'
  if (status === 'in_progress') return t ? t('activities.status.in_progress') : 'In Progress'
  if (status === 'completed') return t ? t('activities.status.completed') : 'Completed'
  if (status === 'cancelled') return t ? t('activities.status.cancelled') : 'Cancelled'
  return status || '-'
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

const FRESH_LEAD_TYPE = 'fresh lead'

function getCustomerLeadType(customer = {}) {
  return normalizeText(customer?.lead_type ?? customer?.lead?.lead_type)
}

function isFreshLeadCustomer(customer = {}) {
  return getCustomerLeadType(customer) === FRESH_LEAD_TYPE
}

function normalizePhone(value) {
  return String(value || '').replace(/\D+/g, '')
}

function addLookup(map, key, value) {
  if (!key) return
  if (!map.has(key)) map.set(key, value)
}

function buildMessengerLookup(conversations = []) {
  const map = new Map()

  conversations.forEach((conversation) => {
    const payload = {
      conversationId: String(getMessengerConversationId(conversation) || ''),
      unreadCount: Number(conversation?.unread_count || 0),
    }
    if (!payload.conversationId) return

    const customerIdCandidates = [
      conversation?.customer_id,
      conversation?.customer?.id,
      conversation?.data?.customer_id,
    ]
    const leadIdCandidates = [
      conversation?.lead_id,
      conversation?.lead?.id,
      conversation?.customer?.lead_id,
      conversation?.data?.lead_id,
    ]
    const phoneCandidates = [
      conversation?.phone,
      conversation?.contact?.phone,
      conversation?.customer?.phone,
    ]
    const emailCandidates = [
      conversation?.email,
      conversation?.contact?.email,
      conversation?.customer?.email,
    ]

    customerIdCandidates.forEach((id) => addLookup(map, `customer:${String(id || '')}`, payload))
    leadIdCandidates.forEach((id) => addLookup(map, `lead:${String(id || '')}`, payload))
    phoneCandidates.forEach((phone) => addLookup(map, `phone:${normalizePhone(phone)}`, payload))
    emailCandidates.forEach((email) => addLookup(map, `email:${normalizeText(email)}`, payload))
  })

  return map
}

function buildGmailLookup(conversations = []) {
  const map = new Map()

  conversations.forEach((conversation) => {
    const payload = {
      conversationId: String(getGmailConversationId(conversation) || ''),
      unreadCount: Number(conversation?.unread_count || 0),
    }
    if (!payload.conversationId) return

    const customerIdCandidates = [
      conversation?.customer_id,
      conversation?.customer?.id,
      conversation?.data?.customer_id,
    ]
    const leadIdCandidates = [
      conversation?.lead_id,
      conversation?.lead?.id,
      conversation?.customer?.lead_id,
      conversation?.data?.lead_id,
    ]
    const emailCandidates = [
      conversation?.participant_email,
      conversation?.from_address,
      conversation?.to_email,
      conversation?.customer?.email,
    ]

    customerIdCandidates.forEach((id) => addLookup(map, `customer:${String(id || '')}`, payload))
    leadIdCandidates.forEach((id) => addLookup(map, `lead:${String(id || '')}`, payload))
    emailCandidates.forEach((email) => addLookup(map, `email:${normalizeText(email)}`, payload))
  })

  return map
}

function extractLeadLogsPayload(response) {
  const payload = response?.data ?? response
  if (!payload) return {}
  if (Array.isArray(payload)) {
    return payload.reduce((acc, item) => {
      const leadId = item?.lead_id || item?.lead?.id
      if (leadId) {
        acc[String(leadId)] = {
          lead_id: leadId,
          logs: Array.isArray(item?.logs) ? item.logs : [item],
        }
      }
      return acc
    }, {})
  }
  return typeof payload === 'object' ? payload : {}
}

function getLeadNoteText(activity = {}) {
  const note = activity?.data?.note ?? activity?.note ?? activity?.description
  return note === null || note === undefined ? '' : String(note).trim()
}

function buildLatestLeadNotesMap(logsPayload = {}) {
  const map = new Map()
  const groups = extractLeadLogsPayload(logsPayload)

  Object.values(groups).forEach((group) => {
    const leadId = group?.lead_id
    if (!leadId) return

    const activities = []
    const logs = Array.isArray(group?.logs) ? group.logs : []

    logs.forEach((log) => {
      const logActivities = Array.isArray(log?.activities) ? log.activities : []
      logActivities.forEach((activity) => {
        if (normalizeActivityType(activity?.type) !== 'note-to-lead') return
        const note = getLeadNoteText(activity)
        if (!note) return

        activities.push({
          ...activity,
          note,
          user: activity?.user || log?.user || null,
          _sortAt: parseTimestamp(activity?.activity_at || activity?.created_at || log?.created_at),
        })
      })
    })

    activities.sort((first, second) => {
      const firstTime = Number.isNaN(first._sortAt) ? 0 : first._sortAt
      const secondTime = Number.isNaN(second._sortAt) ? 0 : second._sortAt
      return secondTime - firstTime
    })

    if (activities[0]) {
      map.set(String(leadId), activities[0])
    }
  })

  return map
}

function buildCustomerAttributeColumns(rows = []) {
  const keys = []
  const seen = new Set()

  rows.forEach((row) => {
    const attributes = Array.isArray(row?.attributes) ? row.attributes : []
    attributes.forEach((attribute) => {
      const key = String(attribute?.key || '').trim()
      if (!key || seen.has(key)) return

      seen.add(key)
      keys.push(key)
    })
  })

  return keys.map((key, index) => ({
    key,
    id: `attribute_${index}_${key.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '') || 'field'}`,
    accessor: `__attribute_${index}`,
  }))
}

function attachCustomerAttributeColumns(row, attributeColumns = []) {
  const values = row?.__attributeValues || {}
  const nextRow = { ...row }

  attributeColumns.forEach((attribute) => {
    nextRow[attribute.accessor] = values[attribute.key] || ''
  })

  return nextRow
}

function getCustomerRowKey(row) {
  return String(row?.id || row?.customer_id || row?.lead?.id || row?.lead_id || '')
}

function isSameCustomerRow(first, second) {
  if (!first || !second) return false

  const firstKeys = [
    first?.id,
    first?.customer_id,
    first?.lead?.id,
    first?.lead_id,
    first?.lead?.lead_id,
  ].filter((value) => value !== null && value !== undefined && value !== '')

  const secondKeys = new Set([
    second?.id,
    second?.customer_id,
    second?.lead?.id,
    second?.lead_id,
    second?.lead?.lead_id,
  ].filter((value) => value !== null && value !== undefined && value !== '').map((value) => String(value)))

  return firstKeys.some((value) => secondKeys.has(String(value)))
}

function normalizeActivityType(value = '') {
  return String(value || '').trim().toLowerCase()
}

function resolveActivityId(activity) {
  const candidate = [
    activity?.id,
    activity?.meeting_id,
    activity?.schedule_id,
    activity?.activity_id,
  ].find((value) => value !== null && value !== undefined && value !== '')

  return candidate ?? null
}

function normalizePriority(value = '') {
  return String(value || '').trim().toLowerCase()
}

function normalizeStatus(value = '') {
  return String(value || '').trim().toLowerCase()
}

function parseCreatedTimestamp(activity) {
  const createdAt = parseTimestamp(activity?.created_at)
  if (!Number.isNaN(createdAt)) return createdAt
  return parseTimestamp(activity?.start_at)
}

function resolveActivityByType(row, expectedType) {
  const lead = row?.lead || {}
  const meetings = Array.isArray(lead?.meetings) ? lead.meetings : []

  const fromMeetings = meetings
    .filter((activity) => normalizeActivityType(activity?.type) === expectedType)
    .sort((first, second) => {
      const firstTime = parseCreatedTimestamp(first)
      const secondTime = parseCreatedTimestamp(second)
      return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
    })[0]

  if (fromMeetings) return fromMeetings

  const candidates = [
    row?.last_meeting,
    lead?.last_meeting,
    row?.last_call,
    lead?.last_call,
  ].filter((item) => item && typeof item === 'object')

  return candidates.find((activity) => normalizeActivityType(activity?.type) === expectedType) || null
}

function enrichCustomerRowWithActivityMeta(row) {
  const meeting = resolveActivityByType(row, 'meeting')
  const call = resolveActivityByType(row, 'call')

  return enrichCustomerMarketingRow({
    ...row,
    __meetingFilterStatus: normalizeStatus(meeting?.status),
    __meetingSortAt: meeting?.start_at || '',
    __callFilterStatus: normalizeStatus(call?.status),
    __callSortAt: call?.start_at || '',
  })
}

function parseTimestamp(value) {
  if (!value) return Number.NaN
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? Number.NaN : time
}

function getReminderDurationMs(activity) {
  const before = Number(activity?.reminder_before)
  if (!Number.isFinite(before) || before <= 0) return null

  const unit = String(activity?.reminder_unit || '').trim().toLowerCase()
  const unitDurations = {
    second: 1000,
    seconds: 1000,
    minute: 60 * 1000,
    minutes: 60 * 1000,
    min: 60 * 1000,
    mins: 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  }

  const unitDuration = unitDurations[unit]
  return unitDuration ? before * unitDuration : null
}

function getPriorityRowClass(priority = '', urgent = false) {
  if (priority === 'urgent') {
    return `bg-[#FECACA] hover:!bg-[#FCA5A5] ${urgent ? 'crm-row-shake-alert' : ''}`
  }

  if (priority === 'high') {
    return 'bg-[#FEE2E2] hover:!bg-[#FECACA]'
  }

  if (priority === 'medium') {
    return 'bg-[#FFF1F2] hover:!bg-[#FFE4E6]'
  }

  if (priority === 'low') {
    return 'bg-[#FFF7F7] hover:!bg-[#FFEFF0]'
  }

  return ''
}

function getUpcomingActivityAlertClass(row, nowTimestamp) {
  const now = nowTimestamp
  const lead = row?.lead || {}
  const meetings = Array.isArray(lead?.meetings) ? lead.meetings : []

  const candidates = [
    {
      type: 'meeting',
      defaultWindowMs: 60 * 60 * 1000,
      data: meetings.filter((item) => normalizeActivityType(item?.type) === 'meeting'),
      fallback: resolveActivityByType(row, 'meeting'),
    },
    {
      type: 'call',
      defaultWindowMs: 30 * 60 * 1000,
      data: meetings.filter((item) => normalizeActivityType(item?.type) === 'call'),
      fallback: resolveActivityByType(row, 'call'),
    },
  ]

  const activeAlerts = candidates.flatMap((entry) => {
    const sourceList = entry.data.length ? entry.data : (entry.fallback ? [entry.fallback] : [])

    return sourceList.flatMap((activity) => {
      if (!activity) return []

      const status = normalizeStatus(activity?.status)
      const startAt = parseBackendLocalTimestamp(activity?.start_at)
      const endAt = parseBackendLocalTimestamp(activity?.end_at)

      // Keep row red when the activity exceeded its time.
      const isOverdueScheduled = status === 'scheduled' && !Number.isNaN(startAt) && now >= startAt
      const isOverdueInProgress = status === 'in_progress' && !Number.isNaN(endAt) && now >= endAt
      if (isOverdueScheduled || isOverdueInProgress) {
        return [{ priority: 'urgent', rank: 10, startAt: Number.isNaN(startAt) ? now : startAt }]
      }

      if (status !== 'scheduled') return []
      if (Number.isNaN(startAt)) return []

      const alertWindowMs = getReminderDurationMs(activity) || entry.defaultWindowMs
      const alertStart = startAt - alertWindowMs
      const isBeforeStartInWindow = now >= alertStart && now < startAt
      if (!isBeforeStartInWindow) return []

      const priority = normalizePriority(activity?.priority)
      const rank = priority === 'urgent' ? 4 : priority === 'high' ? 3 : priority === 'medium' ? 2 : priority === 'low' ? 1 : 0

      return [{ priority, rank, startAt }]
    })
  })

  if (!activeAlerts.length) return ''

  activeAlerts.sort((first, second) => {
    if (second.rank !== first.rank) return second.rank - first.rank
    return first.startAt - second.startAt
  })

  if (activeAlerts[0].rank >= 10) {
    return 'bg-[#FEE2E2] hover:!bg-[#FECACA]'
  }

  return getPriorityRowClass(activeAlerts[0].priority, true)
}

export function CustomersPage({ defaultShowTrash = false }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showTrash] = useState(defaultShowTrash)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailsInitialTab, setDetailsInitialTab] = useState('timeline')
  const [isTableSettingsOpen, setIsTableSettingsOpen] = useState(false)
  const [selectedLeadStatusId, setSelectedLeadStatusId] = useLocalStorage('customers-active-lead-status-tab', null)
  const [selectedLeadTypeTab, setSelectedLeadTypeTab] = useLocalStorage('customers-active-lead-type-tab', null)
  const [leadStatusTabs, setLeadStatusTabs] = useState([])
  const [flashRowKeys, setFlashRowKeys] = useState({})
  const [freshLeadHasAlert, setFreshLeadHasAlert] = useState(false)
  const [freshLeadMinutePulse, setFreshLeadMinutePulse] = useState(false)
  const [nowTimestamp, setNowTimestamp] = useState(Date.now())
  const [activeActivityDrawerType, setActiveActivityDrawerType] = useState(null)
  const [activeActivityStatusFilter, setActiveActivityStatusFilter] = useState('all')
  const [selectedActivityItem, setSelectedActivityItem] = useState(null)
  const [activityRangeDays, setActivityRangeDays] = useLocalStorage('customers-activity-drawer-range-days', 1)
  const [leadNoteDialogRow, setLeadNoteDialogRow] = useState(null)
  const [scheduleDialog, setScheduleDialog] = useState(null)
  const customersQuery = useCustomers()
  const deletedQuery = useDeletedCustomers(showTrash)
  const mutations = useCustomerMutations()
  const meetingMutations = useMeetingMutations()
  const messengerConversationsQuery = useMessengerConversations({ per_page: 100 })
  const gmailConversationsQuery = useGmailConversations({ per_page: 100 }, { enabled: !showTrash })
  const leadLogsQuery = useLeadLogs(undefined, {
    enabled: !showTrash,
    select: (response) => response,
  })
  const leadStatusesQuery = useQuery({
    queryKey: ['customers', 'lead-note-dialog', 'statuses'],
    queryFn: () => definitionsApi.getStatuses(),
    select: extractLeadStatuses,
    enabled: !showTrash,
    staleTime: 1000 * 60,
  })
  const previousFreshLeadCountRef = useRef(null)
  const freshLeadAlertTimeoutRef = useRef(null)
  const freshLeadMinutePulseTimeoutRef = useRef(null)
  const previousUnreadByConversationRef = useRef(new Map())
  const flashTimeoutsRef = useRef(new Map())

  useCustomersTableRealtime({
    enabled: !showTrash,
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTimestamp(Date.now())
    }, 60000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const sourceRows = showTrash
    ? deletedQuery.data || []
    : customersQuery.data?.pages.flatMap((page) => page.data) || []
  const attributeColumns = useMemo(() => buildCustomerAttributeColumns(sourceRows), [sourceRows])
  const normalizedRows = useMemo(
    () => sourceRows
      .map(enrichCustomerRowWithActivityMeta)
      .map((row) => attachCustomerAttributeColumns(row, attributeColumns)),
    [attributeColumns, sourceRows]
  )
  const freshLeadRows = useMemo(
    () => normalizedRows.filter(isFreshLeadCustomer),
    [normalizedRows]
  )
  const freshLeadActive = selectedLeadTypeTab === FRESH_LEAD_TYPE
  const baseFilteredRows = freshLeadActive ? freshLeadRows : normalizedRows
  const filteredRows = freshLeadActive
    ? baseFilteredRows
    : filterCustomersByStatusId(baseFilteredRows, selectedLeadStatusId)
  const activityRangeValue = Math.max(1, Number(activityRangeDays) || 1)
  const todayMeetings = useMemo(
    () => getActivitiesByTypeInRange(filteredRows, 'meeting', nowTimestamp, activityRangeValue),
    [activityRangeValue, filteredRows, nowTimestamp]
  )
  const todayCalls = useMemo(
    () => getActivitiesByTypeInRange(filteredRows, 'call', nowTimestamp, activityRangeValue),
    [activityRangeValue, filteredRows, nowTimestamp]
  )
  const isLoading = showTrash ? deletedQuery.isLoading : customersQuery.isLoading
  const error = showTrash ? deletedQuery.error : customersQuery.error
  const refetch = () => (showTrash ? deletedQuery.refetch() : customersQuery.refetch())

  useEffect(() => {
    if (showTrash || isLoading) return undefined

    const currentCount = freshLeadRows.length
    const previousCount = previousFreshLeadCountRef.current

    if (previousCount === null) {
      previousFreshLeadCountRef.current = currentCount
      return undefined
    }

    if (currentCount > previousCount) {
      setFreshLeadHasAlert(true)

      if (freshLeadAlertTimeoutRef.current) {
        window.clearTimeout(freshLeadAlertTimeoutRef.current)
      }

      freshLeadAlertTimeoutRef.current = window.setTimeout(() => {
        setFreshLeadHasAlert(false)
        freshLeadAlertTimeoutRef.current = null
      }, 8000)
    }

    previousFreshLeadCountRef.current = currentCount
    return undefined
  }, [freshLeadRows.length, isLoading, showTrash])

  useEffect(() => {
    if (showTrash || isLoading || freshLeadRows.length === 0) {
      setFreshLeadMinutePulse(false)
      return undefined
    }

    const triggerPulse = () => {
      setFreshLeadMinutePulse(true)

      if (freshLeadMinutePulseTimeoutRef.current) {
        window.clearTimeout(freshLeadMinutePulseTimeoutRef.current)
      }

      freshLeadMinutePulseTimeoutRef.current = window.setTimeout(() => {
        setFreshLeadMinutePulse(false)
        freshLeadMinutePulseTimeoutRef.current = null
      }, 4200)
    }

    triggerPulse()
    const intervalId = window.setInterval(triggerPulse, 60000)

    return () => {
      window.clearInterval(intervalId)
      if (freshLeadMinutePulseTimeoutRef.current) {
        window.clearTimeout(freshLeadMinutePulseTimeoutRef.current)
        freshLeadMinutePulseTimeoutRef.current = null
      }
    }
  }, [freshLeadRows.length, isLoading, showTrash])

  const messengerLookup = useMemo(() => buildMessengerLookup(messengerConversationsQuery.data || []), [messengerConversationsQuery.data])
  const gmailLookup = useMemo(() => buildGmailLookup(gmailConversationsQuery.data || []), [gmailConversationsQuery.data])
  const latestLeadNotes = useMemo(
    () => buildLatestLeadNotesMap(leadLogsQuery.data || {}),
    [leadLogsQuery.data]
  )
  const statusById = useMemo(
    () => new Map((leadStatusesQuery.data || []).map((status) => [String(status?.id ?? ''), status])),
    [leadStatusesQuery.data]
  )

  const resolveMessengerChannel = useCallback((customer) => {
    const lead = customer?.lead || {}
    const keys = [
      `customer:${String(customer?.customer_id || customer?.id || '')}`,
      `lead:${String(lead?.id || customer?.lead_id || '')}`,
      `phone:${normalizePhone(lead?.phone || customer?.phone || '')}`,
      `email:${normalizeText(lead?.email || customer?.email || '')}`,
    ]

    for (const key of keys) {
      if (!key.endsWith(':') && messengerLookup.has(key)) {
        return messengerLookup.get(key)
      }
    }

    return { conversationId: '', unreadCount: 0 }
  }, [messengerLookup])

  const handleOpenMessengerFromChannel = useCallback((payload = {}) => {
    requestOpenMessengerSidebar(payload)
  }, [])

  const resolveGmailChannel = useCallback((customer) => {
    const lead = customer?.lead || {}
    const keys = [
      `customer:${String(customer?.customer_id || customer?.id || '')}`,
      `lead:${String(lead?.id || customer?.lead_id || '')}`,
      `email:${normalizeText(lead?.email || customer?.email || '')}`,
    ]

    for (const key of keys) {
      if (!key.endsWith(':') && gmailLookup.has(key)) {
        return gmailLookup.get(key)
      }
    }

    return { conversationId: '', unreadCount: 0 }
  }, [gmailLookup])

  const handleOpenGmailFromChannel = useCallback((payload = {}) => {
    const conversationId = String(payload.conversationId || '')
    const query = conversationId
      ? `?channel=gmail&gmailConversation=${encodeURIComponent(conversationId)}`
      : '?channel=gmail'
    navigate(`/conversations${query}`)
  }, [navigate])

  const handleOpenLeadNoteDialog = useCallback((row) => {
    setLeadNoteDialogRow(row)
  }, [])

  const handleCloseLeadNoteDialog = useCallback(() => {
    setLeadNoteDialogRow(null)
  }, [])

  const handleLeadNoteSaved = useCallback(async () => {
    setLeadNoteDialogRow(null)
    await Promise.allSettled([leadLogsQuery.refetch(), refetch()])
  }, [leadLogsQuery, refetch])

  const handleOpenScheduledActivityDialog = useCallback((row, type) => {
    setScheduleDialog({ row, type })
  }, [])

  const handleCloseScheduledActivityDialog = useCallback(() => {
    setScheduleDialog(null)
  }, [])

  const handleScheduledActivityCreated = useCallback(async () => {
    setScheduleDialog(null)
    await refetch()
  }, [refetch])

  const handleChangeScheduledActivityStatus = useCallback(async (status, activity) => {
    const meetingId = activity?.id
    if (!meetingId || !status) return

    try {
      await meetingMutations.changeStatus.mutateAsync({
        meetingId,
        payload: buildScheduleStatusPayload(status),
      })

      if (status === 'in_progress') {
        toast.success(t('customers.page.toasts.activityStarted'))
      } else if (status === 'cancelled') {
        toast.success(t('customers.page.toasts.activityCancelled'))
      } else if (status === 'completed') {
        toast.success(t('customers.page.toasts.activityFinished'))
      } else {
        toast.success(t('customers.page.toasts.activityStatusUpdated'))
      }

      if (status === 'completed') {
        const afterReportUrl = buildAfterMeetingReportUrl(activity)
        if (afterReportUrl) {
          navigate(afterReportUrl)
          return
        }
      }

      await refetch()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || t('customers.page.toasts.activityStatusUpdateFailed'))
    }
  }, [meetingMutations.changeStatus, navigate, refetch, t])

  useEffect(() => {
    if (showTrash) return undefined

    const conversations = messengerConversationsQuery.data || []
    const unreadByConversation = new Map()
    const triggeredConversationIds = new Set()

    conversations.forEach((conversation) => {
      const conversationId = String(getMessengerConversationId(conversation) || '')
      if (!conversationId) return

      const unreadCount = Number(conversation?.unread_count || 0)
      unreadByConversation.set(conversationId, unreadCount)

      const previousUnread = Number(previousUnreadByConversationRef.current.get(conversationId) || 0)
      if (unreadCount > previousUnread && unreadCount > 0) {
        triggeredConversationIds.add(conversationId)
      }
    })

    previousUnreadByConversationRef.current = unreadByConversation

    if (!triggeredConversationIds.size) return undefined

    const keysToFlash = sourceRows
      .filter((row) => triggeredConversationIds.has(String(resolveMessengerChannel(row)?.conversationId || '')))
      .map((row) => getCustomerRowKey(row))
      .filter(Boolean)

    if (!keysToFlash.length) return undefined

    setFlashRowKeys((current) => {
      const next = { ...current }
      keysToFlash.forEach((rowKey) => {
        next[rowKey] = true

        const existingTimeout = flashTimeoutsRef.current.get(rowKey)
        if (existingTimeout) {
          window.clearTimeout(existingTimeout)
        }

        const timeoutId = window.setTimeout(() => {
          setFlashRowKeys((value) => {
            const updated = { ...value }
            delete updated[rowKey]
            return updated
          })
          flashTimeoutsRef.current.delete(rowKey)
        }, 4000)

        flashTimeoutsRef.current.set(rowKey, timeoutId)
      })
      return next
    })

    return undefined
  }, [messengerConversationsQuery.data, resolveMessengerChannel, showTrash, sourceRows])

  useEffect(() => () => {
    if (freshLeadAlertTimeoutRef.current) {
      window.clearTimeout(freshLeadAlertTimeoutRef.current)
      freshLeadAlertTimeoutRef.current = null
    }

    if (freshLeadMinutePulseTimeoutRef.current) {
      window.clearTimeout(freshLeadMinutePulseTimeoutRef.current)
      freshLeadMinutePulseTimeoutRef.current = null
    }

    flashTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId)
    })
    flashTimeoutsRef.current.clear()
  }, [])

  const getRowClassName = useCallback((row) => {
    if (showTrash) return ''

    const classes = []
    if (
      (isDetailsOpen && isSameCustomerRow(row, selectedCustomer))
      || (scheduleDialog?.row && isSameCustomerRow(row, scheduleDialog.row))
    ) {
      classes.push('customers-active-drawer-row')
    }

    const scheduleAlertClass = getUpcomingActivityAlertClass(row, nowTimestamp)
    if (scheduleAlertClass) classes.push(scheduleAlertClass)

    const rowKey = getCustomerRowKey(row)
    if (flashRowKeys[rowKey]) classes.push('bg-[#FFF5F5] hover:!bg-[#FFECEC]')
    if (freshLeadMinutePulse && isFreshLeadCustomer(row)) classes.push('customers-fresh-lead-minute-alert')

    if (!scheduleAlertClass && !flashRowKeys[rowKey] && classes.includes('customers-active-drawer-row')) {
      classes.push('bg-[#E8F9FA] hover:!bg-[#DDF6F8]')
    }

    return classes.join(' ')
  }, [flashRowKeys, freshLeadMinutePulse, isDetailsOpen, nowTimestamp, scheduleDialog, selectedCustomer, showTrash])

  const activeActivityList = (activeActivityDrawerType === 'meeting' ? todayMeetings : todayCalls)
    .filter((item) => {
      if (activeActivityStatusFilter === 'all') return true
      return String(item?.status || '').trim().toLowerCase() === activeActivityStatusFilter
    })

  const activityStatusOptions = [
    { value: 'all', label: t('customers.page.allStatuses') },
    { value: 'scheduled', label: t('activities.status.scheduled') },
    { value: 'in_progress', label: t('activities.status.in_progress') },
    { value: 'completed', label: t('activities.status.completed') },
    { value: 'cancelled', label: t('activities.status.cancelled') },
  ]

  const handleToggleActivityDrawer = useCallback((type) => {
    setSelectedActivityItem(null)
    setActiveActivityStatusFilter('all')
    setActiveActivityDrawerType((current) => (current === type ? null : type))
  }, [])

  const openCustomerDetails = (customer, options = {}) => {
    setSelectedCustomer(customer)
    setDetailsInitialTab(options.initialTab || 'timeline')
    setIsDetailsOpen(true)
  }

  const getCustomerLeadPageId = (customer) => (
    customer?.id ?? customer?.lead_id ?? customer?.lead?.id
  )

  const handleRowDoubleClick = (customer, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      const leadPageId = getCustomerLeadPageId(customer)
      if (leadPageId === null || leadPageId === undefined || leadPageId === '') return

      navigate(`/lead/${leadPageId}`)
      return
    }

    openCustomerDetails(customer)
  }

  const handleLeadStatusTabChange = useCallback((status) => {
    setSelectedLeadTypeTab(null)
    setSelectedLeadStatusId(status?.id ?? null)
  }, [setSelectedLeadStatusId, setSelectedLeadTypeTab])

  const handleFreshLeadTabClick = useCallback(() => {
    setSelectedLeadTypeTab((current) => (current === FRESH_LEAD_TYPE ? null : FRESH_LEAD_TYPE))
    setSelectedLeadStatusId(null)
    setFreshLeadHasAlert(false)

    if (freshLeadAlertTimeoutRef.current) {
      window.clearTimeout(freshLeadAlertTimeoutRef.current)
      freshLeadAlertTimeoutRef.current = null
    }
  }, [setSelectedLeadStatusId, setSelectedLeadTypeTab])

  const handlePageDoubleClick = (event) => {
    if (!isDetailsOpen || event.button !== 0) return
    if (event.target?.closest?.('[role="dialog"]')) return

    setIsDetailsOpen(false)
  }

  useEffect(() => {
    if (showTrash) return undefined

    const handleStatusTabsShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return

      const tag = (event.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target?.isContentEditable) {
        return
      }

      const tabs = [null, ...leadStatusTabs]
      if (tabs.length <= 1) return

      event.preventDefault()

      const currentIndex = Math.max(
        0,
        tabs.findIndex((status) => String(status?.id ?? '') === String(selectedLeadStatusId ?? ''))
      )
      const direction = event.key === 'ArrowRight' ? -1 : 1
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
      const nextStatus = tabs[nextIndex]

      setSelectedLeadTypeTab(null)
      setSelectedLeadStatusId(nextStatus?.id ?? null)
    }

    document.addEventListener('keydown', handleStatusTabsShortcut)

    return () => {
      document.removeEventListener('keydown', handleStatusTabsShortcut)
    }
  }, [leadStatusTabs, selectedLeadStatusId, setSelectedLeadStatusId, setSelectedLeadTypeTab, showTrash])

  const handleCustomerStatusChanged = ({ customer, newStatus, actionType, activityType, activityTitle }) => {
    const customerName = customer?.name || customer?.email || customer?.phone || t('customers.table.theCustomer')

    if (actionType === 'note') {
      toast.success(t('customers.page.toasts.followUpAdded'), {
        description: t('customers.page.toasts.followUpAddedDesc', { name: customerName }),
        duration: 3200,
      })
      leadLogsQuery.refetch()
      refetch()
      return
    }

    if (actionType === 'activity') {
      const activityLabel = activityType === 'meeting' ? t('activities.type.meeting') : t('activities.type.call')

      toast.info(t('customers.page.toasts.activitySaved', { activity: activityLabel }), {
        description: t('customers.page.toasts.activitySavedDesc', { activity: activityTitle || activityLabel, name: customerName }),
        duration: 3400,
      })

      refetch()
      return
    }

    const statusName = newStatus?.status || newStatus?.name || t('customers.page.toasts.newStatusFallback')
    toast.info(t('customers.page.toasts.statusUpdated'), {
      description: t('customers.page.toasts.statusUpdatedDesc', { name: customerName, status: statusName }),
      duration: 3800,
    })

    refetch()
  }

  const handleDelete = async (customer) => {
    if (!window.confirm(t('customers.page.confirm.deleteCustomer', { name: customer.name || t('customers.page.confirm.thisCustomer') }))) return

    try {
      await mutations.remove.mutateAsync({ ids: [customer.id] })
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleRestore = async (customer) => {
    try {
      await mutations.restore.mutateAsync({ ids: [customer.id] })
    } catch (error) {
      console.error('Restore error:', error)
    }
  }

  const handleForceDelete = async (customer) => {
    if (!window.confirm(t('customers.page.confirm.deleteCustomerPermanent', { name: customer.name || t('customers.page.confirm.thisCustomer') }))) return

    try {
      await mutations.forceDelete.mutateAsync({ ids: [customer.id] })
    } catch (error) {
      console.error('Permanent delete error:', error)
    }
  }

  const getSelectedCustomerIds = (selectedRows) => {
    return selectedRows
      .map((customer) => customer.id)
      .filter((id) => id !== null && id !== undefined)
  }

  const handleBulkDelete = async (selectedRows, clearSelection) => {
    const ids = getSelectedCustomerIds(selectedRows)
    if (!ids.length) return
    if (!window.confirm(t('customers.page.confirm.deleteSelected', { count: ids.length }))) return

    try {
      await mutations.remove.mutateAsync({ ids })
      clearSelection?.()
    } catch (error) {
      console.error('Bulk delete error:', error)
    }
  }

  const handleBulkRestore = async (selectedRows, clearSelection) => {
    const ids = getSelectedCustomerIds(selectedRows)
    if (!ids.length) return

    try {
      await mutations.restore.mutateAsync({ ids })
      clearSelection?.()
    } catch (error) {
      console.error('Bulk restore error:', error)
    }
  }

  const handleBulkForceDelete = async (selectedRows, clearSelection) => {
    const ids = getSelectedCustomerIds(selectedRows)
    if (!ids.length) return
    if (!window.confirm(t('customers.page.confirm.deleteSelectedPermanent', { count: ids.length }))) return

    try {
      await mutations.forceDelete.mutateAsync({ ids })
      clearSelection?.()
    } catch (error) {
      console.error('Bulk permanent delete error:', error)
    }
  }

  const getSelectionContextActions = ({ selectedCount, selectedRows, clearSelection }) => {
    if (!selectedCount) return []

    if (showTrash) {
      return [
        {
          id: 'restore-selected-customers',
          label: t('customers.page.actions.restoreSelected', { count: selectedCount }),
          icon: ArchiveRestore,
          onClick: () => handleBulkRestore(selectedRows, clearSelection),
          disabled: mutations.restore.isPending,
        },
        {
          id: 'force-delete-selected-customers',
          label: t('customers.page.actions.deletePermanent', { count: selectedCount }),
          icon: Trash2,
          variant: 'danger',
          onClick: () => handleBulkForceDelete(selectedRows, clearSelection),
          disabled: mutations.forceDelete.isPending,
        },
      ]
    }

    return [
      {
        id: 'delete-selected-customers',
        label: t('customers.page.actions.deleteSelected', { count: selectedCount }),
        icon: Trash2,
        variant: 'danger',
        onClick: () => handleBulkDelete(selectedRows, clearSelection),
        disabled: mutations.remove.isPending,
      },
    ]
  }

  const getRowContextActions = useCallback(({ row }) => {
    if (!row || showTrash) return []

    const customerName = row?.lead?.name || row?.name || row?.email || row?.phone || `#${row?.id || row?.customer_id || ''}`

    return [
      {
        id: 'customers-page-table-customization',
        label: t('customers.page.actions.customizeTable'),
        section: t('customers.page.actions.additionalSettingsSection'),
        tab: 'format',
        onClick: () => setIsTableSettingsOpen(true),
      },
      {
        id: 'customers-row-add-meeting',
        label: t('customers.page.actions.addMeeting'),
        section: t('customers.page.actions.customerActionsSection'),
        tab: 'actions',
        onClick: () => handleOpenScheduledActivityDialog(row, 'meeting'),
      },
      {
        id: 'customers-row-add-call',
        label: t('customers.page.actions.addCall'),
        section: t('customers.page.actions.customerActionsSection'),
        tab: 'actions',
        onClick: () => handleOpenScheduledActivityDialog(row, 'call'),
      },
      {
        id: 'customers-row-add-follow-up',
        label: t('customers.page.actions.addFollowUp'),
        section: t('customers.page.actions.customerActionsSection'),
        tab: 'actions',
        onClick: () => handleOpenLeadNoteDialog(row),
      },
      {
        id: 'customers-row-toggle-selection',
        label: t('customers.page.actions.selectCustomer', { name: customerName }),
        section: t('customers.page.actions.customerActionsSection'),
        tab: 'actions',
        onClick: (_targetRow, context) => {
          context?.toggleSelection?.()
        },
      },
    ]
  }, [handleOpenLeadNoteDialog, handleOpenScheduledActivityDialog, setIsTableSettingsOpen, showTrash, t])

  const { columns, serialColumnRender } = useCustomersTableColumns({
    t,
    showTrash,
    mutations,
    attributeColumns,
    latestLeadNotes,
    resolveMessengerChannel,
    resolveGmailChannel,
    onOpenMessenger: handleOpenMessengerFromChannel,
    onOpenGmail: handleOpenGmailFromChannel,
    onOpenDetails: openCustomerDetails,
    onAddLeadNote: handleOpenLeadNoteDialog,
    onAddScheduledActivity: handleOpenScheduledActivityDialog,
    onChangeScheduledActivityStatus: handleChangeScheduledActivityStatus,
    customerRows: normalizedRows,
    onDelete: handleDelete,
    onRestore: handleRestore,
    onForceDelete: handleForceDelete,
  })
  return (
    <div className="space-y-4 overflow-x-auto" onDoubleClickCapture={handlePageDoubleClick}>
      <style>{`
        .customers-active-drawer-row > td {
          background-color: #E8F9FA !important;
          box-shadow: inset 0 1px 0 #67DCE2, inset 0 -1px 0 #67DCE2;
        }

        .customers-active-drawer-row > td:first-child {
          box-shadow:
            inset 0 1px 0 #67DCE2,
            inset 0 -1px 0 #67DCE2,
            inset 4px 0 0 #00AEB8;
        }

        @keyframes customers-fresh-lead-minute-pulse {
          0%, 100% {
            background-color: inherit;
            box-shadow: inset 0 0 0 rgba(34, 197, 94, 0);
          }
          25%, 65% {
            background-color: #F0FDF4;
            box-shadow: inset 0 0 0 9999px rgba(34, 197, 94, 0.08), inset 0 0 0 1px #86EFAC;
          }
        }

        .customers-fresh-lead-minute-alert > td {
          animation: customers-fresh-lead-minute-pulse 4.2s ease-in-out both;
        }

        .customers-fresh-lead-minute-alert > td:first-child {
          box-shadow: inset 4px 0 0 #22C55E;
        }
      `}</style>
      <CustomersPageHeader
        title={showTrash ? t('customers.page.deletedRecordsTitle') : t('customers.title')}
        onAdd={!showTrash ? () => setIsDialogOpen(true) : undefined}
        onImport={!showTrash ? () => navigate('/LeadsCenter/import-export') : undefined}
        onExport={() => navigate('/LeadsCenter/import-export')}
        onTrash={() => navigate(showTrash ? '/LeadsCenter' : '/LeadsCenter/trash')}
        trashActive={showTrash}
        onTableSettings={() => setIsTableSettingsOpen(true)}
      />

      {/*
      <PageToolbar title={t('customers.title')} description="إدارة العملاء، البحث، الحذف المؤقت، والاسترجاع.">
        <div className="flex gap-2">
          {!showTrash && (
            <Button variant="primary" onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={16} />
              {t('customers.newCustomer')}
            </Button>
          )}
          <Button
            variant={showTrash ? 'primary' : 'outline'}
            onClick={() => setShowTrash((value) => !value)}
            className="gap-2"
          >
            <ArchiveRestore size={16} />
            {showTrash ? t('customers.active') : t('customers.trash')}
          </Button>
        </div>
      </PageToolbar>

      */}

      {!showTrash && (
        <LeadStatusTabs
          selectedStatusId={selectedLeadStatusId}
          onStatusChange={handleLeadStatusTabChange}
          onStatusesChange={setLeadStatusTabs}
          customers={sourceRows}
          freshLeadCount={freshLeadRows.length}
          freshLeadActive={freshLeadActive}
          freshLeadHasAlert={freshLeadHasAlert}
          onFreshLeadClick={handleFreshLeadTabClick}
          activeActivityDrawerType={activeActivityDrawerType}
          onToggleActivityDrawer={handleToggleActivityDrawer}
          meetingsTodayCount={todayMeetings.length}
          callsTodayCount={todayCalls.length}
          onOpenMultiView={() => {
            const query = selectedLeadStatusId ? `?statuses=${selectedLeadStatusId}` : ''
            navigate(`/LeadsCenter/status-board${query}`)
          }}
        />
      )}

      <div className={`grid min-w-0 gap-3 ${activeActivityDrawerType ? 'xl:grid-cols-[minmax(0,1fr)_340px]' : 'grid-cols-1'}`}>
        <section className="overflow-x-auto min-w-0">
          <DataTable
            data={filteredRows}
            columns={columns}
            tableId={showTrash ? 'customers-trash' : 'customers'}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            hasNextPage={!showTrash && customersQuery.hasNextPage}
            isFetchingNextPage={!showTrash && customersQuery.isFetchingNextPage}
            onLoadMore={!showTrash ? customersQuery.fetchNextPage : undefined}
            onRowDoubleClick={handleRowDoubleClick}
            rowClassName={getRowClassName}
            selectionContextActions={getSelectionContextActions}
            rowContextActions={getRowContextActions}
            serialColumnRender={serialColumnRender}
            toolbarActions={!showTrash ? ({ selectedRows, selectedCount, clearSelection }) => (
              <CustomersBulkActions
                selectedRows={selectedRows}
                selectedCount={selectedCount}
                clearSelection={clearSelection}
                onDone={refetch}
                onAddLeadNote={handleOpenLeadNoteDialog}
              />
            ) : null}
            emptyMessage={
              showTrash
                ? t('customers.page.emptyTrash')
                : freshLeadActive
                  ? t('customers.noFreshLeads')
                  : true
                  ? t('customers.noCustomers')
                  : 'اختر حالة العميل أولًا لعرض العملاء'
            }
            enableSorting={true}
            enableFiltering={true}
            enablePagination={true}
            enableColumnVisibility={true}
            showToolbar={true}
            showFooter={true}
          />
        </section>

        {activeActivityDrawerType ? (
          <aside className="min-w-0 rounded-xl border border-[#D7EEF0] bg-white shadow-sm xl:sticky xl:top-16 xl:h-[calc(100vh-7rem)] xl:overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E8EEF0] px-3 py-2">
              <div className="text-sm font-black text-[var(--text)]">
                {activeActivityDrawerType === 'meeting' ? t('customers.table.meetingsGroupLabel') : t('customers.table.callsGroupLabel')} {getActivityRangeLabel(activityRangeValue, t)}
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-black text-[#334155]">
                  {activeActivityList.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveActivityDrawerType(null)}
                  className="rounded-lg border border-[#E2E8F0] px-2 py-1 text-xs font-bold text-[#475569] transition-colors hover:bg-[#F8FAFC]"
                >
                  {t('customers.page.close')}
                </button>
              </div>
            </div>

            <div className="border-b border-[#E8EEF0] px-2 py-2">
              <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#F8FAFC] p-1">
                {getActivityRangeOptions(t).map((option) => {
                  const isSelected = Number(option.value) === Number(activityRangeValue)

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActivityRangeDays(option.value)}
                      className={`rounded-md px-2 py-1.5 text-[11px] font-black transition-colors ${
                        isSelected
                          ? activeActivityDrawerType === 'meeting'
                            ? 'bg-[#E8F9FA] text-[#007A80] shadow-sm'
                            : 'bg-[#FFF1F2] text-[#B91C1C] shadow-sm'
                          : 'text-[#64748B] hover:bg-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="border-b border-[#E8EEF0] px-2 py-2">
              <div className="flex flex-wrap gap-1.5">
                {activityStatusOptions.map((option) => {
                  const isSelected = activeActivityStatusFilter === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActiveActivityStatusFilter(option.value)}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-black transition-colors ${
                        isSelected
                          ? activeActivityDrawerType === 'meeting'
                            ? 'border-[#BEEFF2] bg-[#E8F9FA] text-[#007A80]'
                            : 'border-[#F8C3C3] bg-[#FFF1F2] text-[#B91C1C]'
                          : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 p-2 xl:h-[calc(100%-98px)] xl:overflow-y-auto">
              {activeActivityList.length ? activeActivityList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedActivityItem(item)}
                  className={`block w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
                    activeActivityDrawerType === 'meeting'
                      ? 'border-[#D7EEF0] bg-[#F8FEFF] hover:bg-[#F0FEFF]'
                      : 'border-[#FADADA] bg-[#FFF8F8] hover:bg-[#FFF2F2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-[var(--text)]">{item.customerName}</div>
                      <div className="truncate text-[11px] font-semibold text-[var(--text-muted)]">{item.title}</div>
                    </div>
                    <div className={`shrink-0 text-[11px] font-black ${activeActivityDrawerType === 'meeting' ? 'text-[#0F766E]' : 'text-[#B91C1C]'}`}>
                      {formatBackendTime12(item.startAt, t)}
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#64748B]">
                    <span>{getActivityStatusLabel(item.status, t)}</span>
                    {activityRangeValue > 1 ? (
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[#475569] ring-1 ring-[#E2E8F0]">
                        {formatBackendDateShort(item.startAt)}
                      </span>
                    ) : null}
                  </div>
                </button>
              )) : (
                <div className="rounded-lg border border-dashed border-[#D7EEF0] px-2 py-3 text-center text-xs font-semibold text-[var(--text-muted)]">
                  {activeActivityDrawerType === 'meeting'
                    ? t('customers.page.noMeetingsInRange', { range: getActivityRangeLabel(activityRangeValue, t) })
                    : t('customers.page.noCallsInRange', { range: getActivityRangeLabel(activityRangeValue, t) })}
                </div>
              )}
            </div>
          </aside>
        ) : null}
      </div>

      <NewCustomerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={mutations.create.mutateAsync}
        isLoading={mutations.create.isPending}
      />

      {selectedActivityItem ? (
        <MeetingDataDrawer
          open={Boolean(selectedActivityItem)}
          onClose={() => setSelectedActivityItem(null)}
          meetingId={selectedActivityItem?.activityId}
          schedule={{
            id: selectedActivityItem?.activityId,
            type: selectedActivityItem?.type || activeActivityDrawerType,
            status: selectedActivityItem?.status,
          }}
          allowComplete
        />
      ) : null}

      <CustomerDetailsDrawer
        customer={selectedCustomer}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onStatusChanged={handleCustomerStatusChanged}
        initialTab={detailsInitialTab}
      />

      <TableSettingsDrawer
        open={isTableSettingsOpen}
        onClose={() => setIsTableSettingsOpen(false)}
      />

      <FollowUpNoteDialog
        open={Boolean(leadNoteDialogRow)}
        customer={leadNoteDialogRow}
        statuses={leadStatusesQuery.data || []}
        currentStatus={leadNoteDialogRow ? statusById.get(String(leadNoteDialogRow?.lead?.status_type_id ?? leadNoteDialogRow?.status_type_id)) : null}
        onClose={handleCloseLeadNoteDialog}
        onSaved={handleLeadNoteSaved}
      />

      <ScheduleActivityDialog
        type={scheduleDialog?.type}
        isOpen={Boolean(scheduleDialog?.type)}
        onClose={handleCloseScheduledActivityDialog}
        customer={scheduleDialog?.row}
        relatedType="customer"
        presentation="drawer"
        onCreated={handleScheduledActivityCreated}
      />
    </div>
  )
}
