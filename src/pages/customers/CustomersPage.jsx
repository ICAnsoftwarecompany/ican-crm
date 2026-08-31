import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArchiveRestore, X, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from '../../shared/components/data-table'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
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
import { leadsApi } from '../../features/leads/api/leadsApi'
import { definitionsApi } from '../../features/definitions/api/definitionsApi'
import { requestOpenMessengerSidebar } from '../../features/conversations/constants/messengerSidebarEvents'
import { extractLeadStatuses } from './utils/customerStatus'

const ACTIVITY_RANGE_OPTIONS = [
  { value: 1, label: 'اليوم' },
  { value: 7, label: '7 أيام' },
  { value: 15, label: '15 يوم' },
  { value: 30, label: '30 يوم' },
]

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

function formatBackendTime12(value) {
  const parts = parseBackendLocalDateParts(value)
  if (!parts) return '-'

  const hour12 = parts.hour % 12 || 12
  const period = parts.hour >= 12 ? 'م' : 'ص'
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

function getActivityRangeLabel(rangeDays) {
  const option = ACTIVITY_RANGE_OPTIONS.find((item) => Number(item.value) === Number(rangeDays))
  return option?.label || `${rangeDays} يوم`
}

function formatBackendDateShort(value) {
  const parts = parseBackendLocalDateParts(value)
  if (!parts) return ''

  return `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${parts.year}`
}

function getActivityStatusLabel(status = '') {
  if (status === 'scheduled') return 'Scheduled'
  if (status === 'in_progress') return 'In Progress'
  if (status === 'completed') return 'Completed'
  if (status === 'cancelled') return 'Cancelled'
  return status || '-'
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
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

function formatDateTimeForApi(value) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 16) + ':00'
}

function formatDateTimeLocalInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getStatusLabel(status) {
  return status?.status || status?.name || status?.title || ''
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
  const candidates = [
    { type: 'meeting', data: resolveActivityByType(row, 'meeting'), defaultWindowMs: 60 * 60 * 1000 },
    { type: 'call', data: resolveActivityByType(row, 'call'), defaultWindowMs: 30 * 60 * 1000 },
  ]

  const activeAlerts = candidates.flatMap((entry) => {
    const activity = entry.data
    if (!activity) return []

    const status = normalizeStatus(activity?.status)
    if (status !== 'scheduled') return []

    const startAt = parseBackendLocalTimestamp(activity?.start_at)
    if (Number.isNaN(startAt)) return []

    const alertWindowMs = getReminderDurationMs(activity) || entry.defaultWindowMs
    const alertStart = startAt - alertWindowMs
    const isBeforeStartInWindow = now >= alertStart && now < startAt
    if (!isBeforeStartInWindow) return []

    const priority = normalizePriority(activity?.priority)
    const rank = priority === 'urgent' ? 4 : priority === 'high' ? 3 : priority === 'medium' ? 2 : priority === 'low' ? 1 : 0

    return [{ priority, rank, startAt }]
  })

  if (!activeAlerts.length) return ''

  activeAlerts.sort((first, second) => {
    if (second.rank !== first.rank) return second.rank - first.rank
    return first.startAt - second.startAt
  })

  return getPriorityRowClass(activeAlerts[0].priority, true)
}

export function CustomersPage({ defaultShowTrash = false }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showTrash] = useState(defaultShowTrash)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isTableSettingsOpen, setIsTableSettingsOpen] = useState(false)
  const [selectedLeadStatusId, setSelectedLeadStatusId] = useLocalStorage('customers-active-lead-status-tab', null)
  const [leadStatusTabs, setLeadStatusTabs] = useState([])
  const [flashRowKeys, setFlashRowKeys] = useState({})
  const [nowTimestamp, setNowTimestamp] = useState(Date.now())
  const [activeActivityDrawerType, setActiveActivityDrawerType] = useState(null)
  const [activityRangeDays, setActivityRangeDays] = useLocalStorage('customers-activity-drawer-range-days', 1)
  const [leadNoteDialogRow, setLeadNoteDialogRow] = useState(null)
  const [leadNoteForm, setLeadNoteForm] = useState({
    description: '',
    note: '',
    activity_at: formatDateTimeLocalInput(),
  })
  const [isSavingLeadNote, setIsSavingLeadNote] = useState(false)
  const customersQuery = useCustomers()
  const deletedQuery = useDeletedCustomers(showTrash)
  const mutations = useCustomerMutations()
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
  const filteredRows = filterCustomersByStatusId(normalizedRows, selectedLeadStatusId)
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

  const getRowCurrentStatusTitle = useCallback((row) => {
    const lead = row?.lead || {}
    const statusId = lead?.status_type_id ?? row?.status_type_id ?? lead?.status?.id ?? row?.status?.id
    const status = lead?.status || row?.status || statusById.get(String(statusId ?? ''))

    return (
      getStatusLabel(status) ||
      lead?.status_title ||
      lead?.status_name ||
      row?.status_title ||
      row?.status_name ||
      'ملاحظة على العميل'
    )
  }, [statusById])

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
    setLeadNoteForm({
      description: '',
      note: '',
      activity_at: formatDateTimeLocalInput(new Date()),
    })
  }, [])

  const handleCloseLeadNoteDialog = useCallback(() => {
    if (isSavingLeadNote) return
    setLeadNoteDialogRow(null)
  }, [isSavingLeadNote])

  const handleSaveLeadNote = useCallback(async (event) => {
    event.preventDefault()

    if (!leadNoteDialogRow) return

    const lead = leadNoteDialogRow?.lead || {}
    const leadId = lead?.id || leadNoteDialogRow?.lead_id || lead?.lead_id || leadNoteDialogRow?.customer?.lead_id
    const description = String(leadNoteForm.description || '').trim()
    const note = String(leadNoteForm.note || '').trim()
    const text = description || note

    if (!leadId) {
      toast.error('لا يوجد رقم Lead لهذا العميل')
      return
    }

    if (!text) {
      toast.error('اكتب الملاحظة أولا')
      return
    }

    const payload = {
      lead_id: leadId,
      action: 'create_activity',
      type: 'note-to-lead',
      title: getRowCurrentStatusTitle(leadNoteDialogRow),
      description: text,
      note: note || text,
      activity_at: formatDateTimeForApi(leadNoteForm.activity_at || formatDateTimeLocalInput(new Date())),
    }

    try {
      setIsSavingLeadNote(true)
      await leadsApi.saveAction(payload)
      toast.success('تمت إضافة الملاحظة')
      setLeadNoteDialogRow(null)
      await Promise.allSettled([leadLogsQuery.refetch(), refetch()])
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إضافة الملاحظة')
    } finally {
      setIsSavingLeadNote(false)
    }
  }, [getRowCurrentStatusTitle, leadLogsQuery, leadNoteDialogRow, leadNoteForm.activity_at, leadNoteForm.description, leadNoteForm.note, refetch])

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
    flashTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId)
    })
    flashTimeoutsRef.current.clear()
  }, [])

  const getRowClassName = useCallback((row) => {
    if (showTrash) return ''

    const classes = []
    if (isDetailsOpen && isSameCustomerRow(row, selectedCustomer)) {
      classes.push('customers-active-drawer-row')
    }

    const scheduleAlertClass = getUpcomingActivityAlertClass(row, nowTimestamp)
    if (scheduleAlertClass) classes.push(scheduleAlertClass)

    const rowKey = getCustomerRowKey(row)
    if (flashRowKeys[rowKey]) classes.push('bg-[#FFF5F5] hover:!bg-[#FFECEC]')

    if (!scheduleAlertClass && !flashRowKeys[rowKey] && classes.includes('customers-active-drawer-row')) {
      classes.push('bg-[#E8F9FA] hover:!bg-[#DDF6F8]')
    }

    return classes.join(' ')
  }, [flashRowKeys, isDetailsOpen, nowTimestamp, selectedCustomer, showTrash])

  const activeActivityList = activeActivityDrawerType === 'meeting' ? todayMeetings : todayCalls

  const handleToggleActivityDrawer = useCallback((type) => {
    setActiveActivityDrawerType((current) => (current === type ? null : type))
  }, [])

  const openCustomerDetails = (customer) => {
    setSelectedCustomer(customer)
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

      setSelectedLeadStatusId(nextStatus?.id ?? null)
    }

    document.addEventListener('keydown', handleStatusTabsShortcut)

    return () => {
      document.removeEventListener('keydown', handleStatusTabsShortcut)
    }
  }, [leadStatusTabs, selectedLeadStatusId, setSelectedLeadStatusId, showTrash])

  const handleCustomerStatusChanged = ({ customer, newStatus, actionType, activityType, activityTitle }) => {
    const customerName = customer?.name || customer?.email || customer?.phone || 'العميل'

    if (actionType === 'note') {
      toast.success('تمت إضافة المتابعة', {
        description: `${customerName} تم تحديث بياناته.`,
        duration: 3200,
      })
      leadLogsQuery.refetch()
      refetch()
      return
    }

    if (actionType === 'activity') {
      const activityLabel = activityType === 'meeting' ? 'اجتماع' : 'مكالمة'

      toast.info(`تم حفظ ${activityLabel}`, {
        description: `${activityTitle || activityLabel} للعميل ${customerName}.`,
        duration: 3400,
      })

      refetch()
      return
    }

    const statusName = newStatus?.status || newStatus?.name || 'الحالة الجديدة'
    toast.info('تم تحديث حالة العميل', {
      description: `${customerName} انتقل إلى ${statusName}. تم تحديث بيانات العملاء تلقائيًا.`,
      duration: 3800,
    })

    refetch()
  }

  const handleDelete = async (customer) => {
    if (!window.confirm(`هل تريد حذف ${customer.name || 'هذا العميل'}؟`)) return

    try {
      await mutations.remove.mutateAsync({ ids: [customer.id] })
    } catch (error) {
      console.error('خطأ في الحذف:', error)
    }
  }

  const handleRestore = async (customer) => {
    try {
      await mutations.restore.mutateAsync({ ids: [customer.id] })
    } catch (error) {
      console.error('خطأ في الاسترجاع:', error)
    }
  }

  const handleForceDelete = async (customer) => {
    if (!window.confirm(`هل تريد حذف ${customer.name || 'هذا العميل'} نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`)) return

    try {
      await mutations.forceDelete.mutateAsync({ ids: [customer.id] })
    } catch (error) {
      console.error('خطأ في الحذف النهائي:', error)
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
    if (!window.confirm(`هل تريد حذف ${ids.length} عميل؟`)) return

    try {
      await mutations.remove.mutateAsync({ ids })
      clearSelection?.()
    } catch (error) {
      console.error('خطأ في حذف العملاء المحددين:', error)
    }
  }

  const handleBulkRestore = async (selectedRows, clearSelection) => {
    const ids = getSelectedCustomerIds(selectedRows)
    if (!ids.length) return

    try {
      await mutations.restore.mutateAsync({ ids })
      clearSelection?.()
    } catch (error) {
      console.error('خطأ في استرجاع العملاء المحددين:', error)
    }
  }

  const handleBulkForceDelete = async (selectedRows, clearSelection) => {
    const ids = getSelectedCustomerIds(selectedRows)
    if (!ids.length) return
    if (!window.confirm(`هل تريد حذف ${ids.length} عميل نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`)) return

    try {
      await mutations.forceDelete.mutateAsync({ ids })
      clearSelection?.()
    } catch (error) {
      console.error('خطأ في الحذف النهائي للعملاء المحددين:', error)
    }
  }

  const getSelectionContextActions = ({ selectedCount, selectedRows, clearSelection }) => {
    if (!selectedCount) return []

    if (showTrash) {
      return [
        {
          id: 'restore-selected-customers',
          label: `استرجاع المحدد (${selectedCount})`,
          icon: ArchiveRestore,
          onClick: () => handleBulkRestore(selectedRows, clearSelection),
          disabled: mutations.restore.isPending,
        },
        {
          id: 'force-delete-selected-customers',
          label: `حذف نهائي (${selectedCount})`,
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
        label: `حذف المحدد (${selectedCount})`,
        icon: Trash2,
        variant: 'danger',
        onClick: () => handleBulkDelete(selectedRows, clearSelection),
        disabled: mutations.remove.isPending,
      },
    ]
  }

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
      `}</style>
      <CustomersPageHeader
        title={showTrash ? 'العملاء المحذوفون' : t('customers.title')}
        description={
          showTrash
            ? 'مراجعة العملاء المحذوفين واسترجاع السجلات عند الحاجة.'
            : 'إدارة بيانات العملاء، المتابعة، التصنيف والإجراءات الجماعية.'
        }
        onAdd={!showTrash ? () => setIsDialogOpen(true) : undefined}
        onImport={!showTrash ? () => navigate('/customers/import-export') : undefined}
        onExport={() => navigate('/customers/import-export')}
        onTrash={() => navigate(showTrash ? '/customers' : '/customers/trash')}
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
          onStatusChange={(status) => setSelectedLeadStatusId(status?.id ?? null)}
          onStatusesChange={setLeadStatusTabs}
          customers={sourceRows}
          activeActivityDrawerType={activeActivityDrawerType}
          onToggleActivityDrawer={handleToggleActivityDrawer}
          meetingsTodayCount={todayMeetings.length}
          callsTodayCount={todayCalls.length}
          onOpenMultiView={() => {
            const query = selectedLeadStatusId ? `?statuses=${selectedLeadStatusId}` : ''
            navigate(`/customers/status-board${query}`)
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
                ? 'لا توجد عناصر في سلة المحذوفات'
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
                {activeActivityDrawerType === 'meeting' ? 'اجتماعات' : 'مكالمات'} {getActivityRangeLabel(activityRangeValue)}
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
                  إغلاق
                </button>
              </div>
            </div>

            <div className="border-b border-[#E8EEF0] px-2 py-2">
              <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#F8FAFC] p-1">
                {ACTIVITY_RANGE_OPTIONS.map((option) => {
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

            <div className="space-y-2 p-2 xl:h-[calc(100%-98px)] xl:overflow-y-auto">
              {activeActivityList.length ? activeActivityList.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border px-2.5 py-2 ${
                    activeActivityDrawerType === 'meeting'
                      ? 'border-[#D7EEF0] bg-[#F8FEFF]'
                      : 'border-[#FADADA] bg-[#FFF8F8]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-[var(--text)]">{item.customerName}</div>
                      <div className="truncate text-[11px] font-semibold text-[var(--text-muted)]">{item.title}</div>
                    </div>
                    <div className={`shrink-0 text-[11px] font-black ${activeActivityDrawerType === 'meeting' ? 'text-[#0F766E]' : 'text-[#B91C1C]'}`}>
                      {formatBackendTime12(item.startAt)}
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#64748B]">
                    <span>{getActivityStatusLabel(item.status)}</span>
                    {activityRangeValue > 1 ? (
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[#475569] ring-1 ring-[#E2E8F0]">
                        {formatBackendDateShort(item.startAt)}
                      </span>
                    ) : null}
                  </div>
                </div>
              )) : (
                <div className="rounded-lg border border-dashed border-[#D7EEF0] px-2 py-3 text-center text-xs font-semibold text-[var(--text-muted)]">
                  {activeActivityDrawerType === 'meeting'
                    ? `لا توجد اجتماعات خلال ${getActivityRangeLabel(activityRangeValue)} داخل التاب الحالي`
                    : `لا توجد مكالمات خلال ${getActivityRangeLabel(activityRangeValue)} داخل التاب الحالي`}
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

      <CustomerDetailsDrawer
        customer={selectedCustomer}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onStatusChanged={handleCustomerStatusChanged}
      />

      <TableSettingsDrawer
        open={isTableSettingsOpen}
        onClose={() => setIsTableSettingsOpen(false)}
      />

      {leadNoteDialogRow && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4" dir="rtl">
          <button
            type="button"
            aria-label="إغلاق نافذة إضافة الملاحظة"
            className="absolute inset-0 cursor-default bg-slate-950/30 backdrop-blur-[2px]"
            onClick={handleCloseLeadNoteDialog}
          />

          <form
            onSubmit={handleSaveLeadNote}
            className="relative z-10 w-[min(560px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#BFEFF2] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#E5F6F7] bg-[#F7FEFF] px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#008C95]">إضافة ملاحظة</p>
                <h3 className="mt-1 truncate text-lg font-black text-[#102A43]">
                  {leadNoteDialogRow?.lead?.name || leadNoteDialogRow?.name || 'العميل'}
                </h3>
                <p className="mt-1 text-xs font-semibold text-[#64748B]">
                  عنوان الملاحظة: {getRowCurrentStatusTitle(leadNoteDialogRow)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseLeadNoteDialog}
                disabled={isSavingLeadNote}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D7EEF0] bg-white text-[#64748B] transition-colors hover:bg-[#ECFEFF] hover:text-[#008C95] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <Input
                label="وقت النشاط"
                type="datetime-local"
                value={leadNoteForm.activity_at}
                onChange={(event) => {
                  setLeadNoteForm((current) => ({
                    ...current,
                    activity_at: event.target.value,
                  }))
                }}
              />

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium font-arabic text-[var(--text)]">وصف الملاحظة</span>
                <textarea
                  value={leadNoteForm.description}
                  onChange={(event) => {
                    setLeadNoteForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }}
                  rows={4}
                  placeholder="اكتب تفاصيل الملاحظة التي ستظهر في آخر ملاحظة على العميل"
                  className="min-h-28 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-arabic text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-light)] focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium font-arabic text-[var(--text)]">ملاحظة داخلية</span>
                <textarea
                  value={leadNoteForm.note}
                  onChange={(event) => {
                    setLeadNoteForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }}
                  rows={3}
                  placeholder="اختياري، وإذا تركتها فارغة سيتم استخدام وصف الملاحظة"
                  className="min-h-20 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-arabic text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-light)] focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E5F6F7] bg-[#FBFEFF] px-5 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseLeadNoteDialog}
                disabled={isSavingLeadNote}
              >
                إلغاء
              </Button>
              <Button type="submit" variant="accent" loading={isSavingLeadNote}>
                حفظ الملاحظة
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
