import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PanelRightOpen, Plus } from 'lucide-react'

import { Badge } from '../../../shared/components/ui/Badge'
import { CustomerSourceBadge } from '../../../shared/components/Icons/CustomerSourceBadge'
import { definitionsApi } from '../../../features/definitions/api/definitionsApi'
import { usersApi } from '../../../features/users/api/usersApi'
import { MessengerLogoIcon } from '../../../features/conversations/components/MessengerNavbarButton'
import { GmailLogoIcon } from '../../../features/conversations/components/GmailNavbarButton'
import { extractLeadStatuses } from '../utils/customerStatus'
import {
  CustomerMarketingSourceCell,
  CustomerLeadActivitiesCell,
  CustomerPersonCell,
  CustomerProductsCell,
} from './customers-table'

function collectObjects(value, matcher) {
  if (!value) return []
  if (Array.isArray(value)) return value.flatMap((item) => collectObjects(item, matcher))
  if (typeof value !== 'object') return []
  if (matcher(value)) return [value]

  return Object.values(value).flatMap((item) => collectObjects(item, matcher))
}

function extractTags(response) {
  return collectObjects(response?.data ?? response, (item) => (
    'id' in item && ('tag' in item || 'name' in item || 'status' in item)
  ))
}

function extractUsers(response) {
  return collectObjects(response?.data ?? response, (item) => (
    'id' in item && ('name' in item || 'email' in item || 'username' in item)
  ))
}

function toIdMap(items = []) {
  return new Map(items.map((item) => [String(item.id), item]))
}

function getTagLabel(tag) {
  return tag?.tag || tag?.name || tag?.status || ''
}

function getUserLabel(user) {
  return user?.name || user?.username || user?.email || ''
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function renderNullable(value) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

function parseTimestamp(value) {
  if (!value) return Number.NaN
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? Number.NaN : time
}

function parseBackendLocalTimestamp(value) {
  if (!value) return Number.NaN

  const normalized = String(value)
    .trim()
    .replace('T', ' ')
    .replace(/(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/, '')

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return parseTimestamp(value)

  const [, year, month, day, hour, minute, second = '0'] = match
  const time = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ).getTime()

  return Number.isNaN(time) ? Number.NaN : time
}

function getLead(row) {
  return row?.lead || {}
}

function getCustomerNoteActivity(row) {
  const lead = getLead(row)
  const activities = [
    ...(Array.isArray(lead?.lead_activities) ? lead.lead_activities : []),
    ...(Array.isArray(row?.lead_activities) ? row.lead_activities : []),
  ]

  return activities
    .filter((activity) => (
      normalizeActivityType(activity?.type) === 'note' &&
      String(activity?.title || '').trim().toLowerCase() === 'customer note added'
    ))
    .sort((first, second) => {
      const firstTime = parseTimestamp(first?.activity_at || first?.created_at)
      const secondTime = parseTimestamp(second?.activity_at || second?.created_at)
      return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
    })[0] || null
}

function getCustomerNoteText(row) {
  const activity = getCustomerNoteActivity(row)
  return renderNullable(activity?.data?.note || activity?.description || activity?.note) === '-'
    ? ''
    : renderNullable(activity?.data?.note || activity?.description || activity?.note)
}

function CustomerNotePreview({
  note = '',
  activityAt = '',
  title = '',
  userName = '',
  label = 'ملاحظة',
  tone = 'slate',
}) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const showDelayed = () => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setVisible(true), 500)
  }

  const hide = () => {
    window.clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  if (!note) return null

  const toneClasses = tone === 'teal'
    ? 'border-[#BEEFF2] bg-[#F8FEFF] text-[#0F766E]'
    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'

  return (
    <div
      className="relative"
      onMouseEnter={showDelayed}
      onMouseLeave={hide}
      onFocus={showDelayed}
      onBlur={hide}
    >
      <div className={`line-clamp-2 break-words rounded-md border px-2 py-1 text-[11px] font-semibold leading-5 ${toneClasses}`}>
        <span className="me-1 font-black">{label}:</span>
        <span>{note}</span>
      </div>
      {visible ? (
        <div className="absolute start-0 top-full z-[140] mt-1 w-[min(360px,80vw)] rounded-xl border border-[#D8E7EA] bg-white px-3 py-2 text-xs font-bold text-[#334155] shadow-2xl">
          <div className="whitespace-pre-wrap break-words leading-6">{note}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[#EEF4F5] pt-2 text-[11px] text-[#64748B]">
            {title ? (
              <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5">{title}</span>
            ) : null}
            {activityAt ? (
              <span className="rounded-full bg-[#E8F9FA] px-2 py-0.5 text-[#007A80]">
                {formatDateTime(activityAt)}
              </span>
            ) : null}
            {userName ? (
              <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5">{userName}</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function getLatestLeadNote(row, latestLeadNotes) {
  const leadId = resolveLeadId(row)
  if (!leadId || !latestLeadNotes?.get) return null
  return latestLeadNotes.get(String(leadId)) || null
}

function DelayedFullTextHover({ text = '', children }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const showDelayed = () => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setVisible(true), 500)
  }

  const hide = () => {
    window.clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  return (
    <div
      className="relative"
      onMouseEnter={showDelayed}
      onMouseLeave={hide}
      onFocus={showDelayed}
      onBlur={hide}
    >
      {children}
      {visible && text ? (
        <div className="absolute start-0 top-full z-[120] mt-1 max-h-64 w-[min(420px,80vw)] overflow-y-auto rounded-xl border border-[#D8E7EA] bg-white p-3 text-xs font-bold leading-6 text-[#334155] shadow-2xl">
          {text}
        </div>
      ) : null}
    </div>
  )
}

function LatestLeadNoteCell({ row, latestLeadNotes, onAddLeadNote }) {
  const activity = getLatestLeadNote(row, latestLeadNotes)
  const lead = getLead(row)

  const addButton = (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onAddLeadNote?.(row)
      }}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#BEEFF2] bg-white text-[#007A80] transition hover:bg-[#E8F9FA]"
      title={`إضافة ملاحظة على ${lead?.name || 'العميل'}`}
      aria-label={`إضافة ملاحظة على ${lead?.name || 'العميل'}`}
    >
      <Plus size={14} />
    </button>
  )

  if (!activity) {
    return (
      <div className="flex min-w-[220px] items-center gap-2">
        {addButton}
        <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
      </div>
    )
  }

  const note = renderNullable(activity.note || activity?.data?.note || activity?.description)
  const title = renderNullable(activity.title)
  const activityAt = formatDateTime(activity.activity_at)
  const userName = renderNullable(activity?.user?.name)

  return (
    <div className="min-w-[260px] max-w-full space-y-1.5">
      <div className="flex items-start gap-2">
        {addButton}
        <div className="min-w-0 flex-1">
          <DelayedFullTextHover text={note}>
            <div className="line-clamp-2 break-words rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-2.5 py-1.5 text-xs font-bold leading-5 text-[var(--text)]">
              {note}
            </div>
          </DelayedFullTextHover>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
        <span className="inline-flex max-w-full items-center rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5">
          <span className="max-w-32 truncate">{title}</span>
        </span>
        <span className="inline-flex items-center rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2 py-0.5 text-[#007A80]">
          {activityAt}
        </span>
        <span className="inline-flex max-w-full items-center rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5">
          <span className="max-w-24 truncate">{userName}</span>
        </span>
      </div>
    </div>
  )
}

function hasMessengerChannel(row) {
  const lead = getLead(row)
  return Boolean(
    row?.has_messenger ||
    lead?.has_messenger ||
    row?.messenger_enabled ||
    lead?.messenger_enabled
  )
}

function hasGmailChannel(row) {
  const lead = getLead(row)
  return Boolean(
    row?.has_gmail ||
    lead?.has_gmail ||
    row?.gmail_enabled ||
    lead?.gmail_enabled
  )
}

function resolveLeadId(row) {
  return row?.lead?.id || row?.lead_id || ''
}

function resolveCustomerId(row) {
  return row?.customer_id || row?.id || ''
}

function normalizeActivityType(value = '') {
  return String(value || '').trim().toLowerCase()
}

function normalizePriority(value = '') {
  return String(value || '').trim().toLowerCase()
}

function parseCreatedTimestamp(activity) {
  const createdAt = parseTimestamp(activity?.created_at)
  if (!Number.isNaN(createdAt)) return createdAt
  return parseTimestamp(activity?.start_at)
}

function getActivityStatusMeta(statusValue = '') {
  const status = String(statusValue || '').trim().toLowerCase()

  if (status === 'scheduled') {
    return { label: 'Scheduled', className: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]' }
  }

  if (status === 'in_progress') {
    return { label: 'In Progress', className: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]' }
  }

  if (status === 'completed') {
    return { label: 'Completed', className: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]' }
  }

  if (status === 'cancelled') {
    return { label: 'Cancelled', className: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]' }
  }

  return { label: renderNullable(statusValue), className: 'border-[#E2E8F0] bg-white text-[#475569]' }
}

function getActivityPriorityMeta(priorityValue = '') {
  const priority = normalizePriority(priorityValue)

  if (priority === 'urgent') {
    return { label: 'Urgent', className: 'border-[#EF4444] bg-[#FEE2E2] text-[#991B1B]' }
  }

  if (priority === 'high') {
    return { label: 'High', className: 'border-[#F97316] bg-[#FFF7ED] text-[#9A3412]' }
  }

  if (priority === 'medium') {
    return { label: 'Medium', className: 'border-[#F59E0B] bg-[#FFFBEB] text-[#92400E]' }
  }

  if (priority === 'low') {
    return { label: 'Low', className: 'border-[#22C55E] bg-[#F0FDF4] text-[#166534]' }
  }

  return { label: renderNullable(priorityValue), className: 'border-[#E2E8F0] bg-white text-[#475569]' }
}

function formatBackendDateTime(value) {
  if (!value) return '-'

  const text = String(value).trim()
  if (!text) return '-'

  const normalized = text
    .replace('T', ' ')
    .replace(/(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/, '')

  const dateTimeMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})/)
  if (dateTimeMatch) {
    const [, datePart, hourPart, minutePart] = dateTimeMatch
    const hour24 = Number(hourPart)
    const hour12 = hour24 % 12 || 12
    const period = hour24 >= 12 ? 'م' : 'ص'

    return `${datePart} ${hour12}:${minutePart} ${period}`
  }

  return normalized || '-'
}

function resolveActivityByType(row, expectedType) {
  const lead = getLead(row)
  const type = normalizeActivityType(expectedType)
  const meetings = Array.isArray(lead?.meetings) ? lead.meetings : []

  const fromMeetings = meetings
    .filter((activity) => normalizeActivityType(activity?.type) === type)
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

  return candidates.find((activity) => normalizeActivityType(activity?.type) === type) || null
}

function renderActivityDetails(activity, { includeTypeMode = false } = {}) {
  if (!activity) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const statusMeta = getActivityStatusMeta(activity?.status)
  const detailText = [activity?.title, activity?.description].filter(Boolean).join(' - ')
  const modeLabel = includeTypeMode && activity?.mode ? String(activity.mode) : ''
  const typeLabel = includeTypeMode ? normalizeActivityType(activity?.type) : ''

  return (
    <div className="min-w-[220px] space-y-1.5">
      <div className="text-xs font-black text-[var(--text)]">{formatBackendDateTime(activity?.start_at)}</div>
      <div className="truncate text-[11px] font-semibold text-[var(--text-muted)]" title={detailText || '-'}>
        {detailText || '-'}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${statusMeta.className}`}>
          {statusMeta.label}
        </span>
        {includeTypeMode && typeLabel ? (
          <span className="inline-flex items-center rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
            {typeLabel}
          </span>
        ) : null}
        {includeTypeMode && modeLabel ? (
          <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#334155]">
            {modeLabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function renderActivityMainInfo(activity, remainingLabel, isReminderAlert = false) {
  if (!activity) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const detailText = [activity?.title, activity?.description].filter(Boolean).join(' - ')
  return (
    <div className="min-w-[200px] space-y-1">
      <div className="text-xs font-black text-[var(--text)]">{formatBackendDateTime(activity?.start_at)}</div>
      {remainingLabel ? (
        <div className={`text-[10px] font-black ${isReminderAlert ? 'text-[#B91C1C]' : 'text-[#64748B]'}`}>
          {remainingLabel}
        </div>
      ) : null}
      <div className="truncate text-[11px] font-semibold text-[var(--text-muted)]" title={detailText || '-'}>
        {detailText || '-'}
      </div>
    </div>
  )
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

function getScheduledRemainingLabel(activity, nowTimestamp) {
  const status = String(activity?.status || '').trim().toLowerCase()
  if (status !== 'scheduled' && status !== 'in_progress') return ''

  const startAt = parseBackendLocalTimestamp(activity?.start_at)
  if (Number.isNaN(startAt)) return ''

  const diffMs = startAt - nowTimestamp
  if (diffMs <= 0) return status === 'in_progress' ? 'النشاط قيد التنفيذ الآن' : 'موعد النشاط الآن أو متأخر'

  const totalHours = Math.ceil(diffMs / (60 * 60 * 1000))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  if (days > 0 && hours > 0) {
    return `متبقي ${days} يوم و ${hours} ساعة`
  }

  if (days > 0) {
    return `متبقي ${days} يوم`
  }

  if (hours > 0) {
    return `متبقي ${hours} ساعة`
  }

  return 'متبقي أقل من ساعة'
}

function isActivityInReminderWindow(activity, nowTimestamp) {
  const status = String(activity?.status || '').trim().toLowerCase()
  if (status !== 'scheduled' && status !== 'in_progress') return false

  const startAt = parseBackendLocalTimestamp(activity?.start_at)
  if (Number.isNaN(startAt)) return false

  const diffMs = startAt - nowTimestamp
  if (diffMs <= 0) return true

  const reminderDurationMs = getReminderDurationMs(activity)
  return Boolean(reminderDurationMs && diffMs <= reminderDurationMs)
}

function renderActivityWithRemaining(activity, nowTimestamp, { includeMode = false } = {}) {
  if (!activity) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const remainingLabel = getScheduledRemainingLabel(activity, nowTimestamp)
  const isReminderAlert = isActivityInReminderWindow(activity, nowTimestamp)
  const typeLabel = normalizeActivityType(activity?.type) || '-'
  const modeLabel = includeMode ? String(activity?.mode || '').trim() : ''
  const statusMeta = getActivityStatusMeta(activity?.status)
  const priorityMeta = getActivityPriorityMeta(activity?.priority)

  return (
    <div className="min-w-[200px] space-y-1">
      {renderActivityMainInfo(activity, remainingLabel, isReminderAlert)}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${statusMeta.className}`}>
          {statusMeta.label}
        </span>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityMeta.className}`}>
          {priorityMeta.label}
        </span>
        <span className="inline-flex items-center rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
          {typeLabel}
        </span>
        {modeLabel ? (
          <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#334155]">
            {modeLabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function renderActivityType(activity, { includeMode = false } = {}) {
  if (!activity) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const typeLabel = normalizeActivityType(activity?.type) || '-'
  const modeLabel = includeMode ? String(activity?.mode || '').trim() : ''

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
        {typeLabel}
      </span>
      {modeLabel ? (
        <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#334155]">
          {modeLabel}
        </span>
      ) : null}
    </div>
  )
}

function renderActivityStatus(activity) {
  if (!activity) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const statusMeta = getActivityStatusMeta(activity?.status)
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${statusMeta.className}`}>
      {statusMeta.label}
    </span>
  )
}

function renderAttributes(row) {
  const attributes = Array.isArray(row?.attributes) ? row.attributes : []

  if (!attributes.length) {
    return <span className="text-[var(--text-muted)]">-</span>
  }

  return (
    <div className="flex min-w-[220px] flex-wrap gap-1.5">
      {attributes.map((attribute) => (
        <span
          key={attribute.id || `${attribute.key}-${attribute.value}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1 text-xs font-semibold text-[var(--text)]"
          title={`${attribute.key}: ${attribute.value}`}
        >
          <span className="shrink-0 text-[#007A80]">{renderNullable(attribute.key)}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span className="min-w-0 max-w-28 truncate">{renderNullable(attribute.value)}</span>
        </span>
      ))}
    </div>
  )
}

export function useCustomersTableColumns(options = {}) {
  const resolveMessengerChannel = options.resolveMessengerChannel
  const resolveGmailChannel = options.resolveGmailChannel
  const onOpenMessenger = options.onOpenMessenger
  const onOpenGmail = options.onOpenGmail
  const onOpenDetails = options.onOpenDetails
  const latestLeadNotes = options.latestLeadNotes
  const onAddLeadNote = options.onAddLeadNote
  const attributeColumns = Array.isArray(options.attributeColumns) ? options.attributeColumns : []
  const [nowTimestamp, setNowTimestamp] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTimestamp(Date.now())
    }, 60000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const statusesQuery = useQuery({
    queryKey: ['customers', 'table-columns', 'statuses'],
    queryFn: () => definitionsApi.getStatuses(),
    select: extractLeadStatuses,
    staleTime: 1000 * 60,
  })
  const tagsQuery = useQuery({
    queryKey: ['customers', 'table-columns', 'tags'],
    queryFn: () => definitionsApi.getTags(),
    select: extractTags,
    staleTime: 1000 * 60,
  })
  const usersQuery = useQuery({
    queryKey: ['customers', 'table-columns', 'users'],
    queryFn: () => usersApi.getUsers(),
    select: extractUsers,
    staleTime: 1000 * 60,
  })
  const statusById = useMemo(() => toIdMap(statusesQuery.data || []), [statusesQuery.data])
  const tagById = useMemo(() => toIdMap(tagsQuery.data || []), [tagsQuery.data])
  const userById = useMemo(() => toIdMap(usersQuery.data || []), [usersQuery.data])

  const renderCustomerSerialColumn = useCallback((row) => (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 font-semibold text-[var(--text)]">{row.__serial ?? '-'}</span>
      <CustomerSourceBadge source={row.source || row.lead?.source} iconOnly />
    </div>
  ), [])

  const columns = [
    {
      id: 'lead_id',
      header: 'Lead ID',
      accessor: 'lead.id',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-24',
      render: (row) => renderNullable(getLead(row).id),
    },
    {
      id: 'lead_name',
      header: 'اسم العميل',
      accessor: 'lead.name',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-36',
      render: (row) => {
        const leadName = renderNullable(getLead(row).name)
        const noteActivity = getCustomerNoteActivity(row)
        const note = getCustomerNoteText(row)
        const latestLeadNote = getLatestLeadNote(row, latestLeadNotes)
        const latestLeadNoteText = renderNullable(
          latestLeadNote?.note ||
          latestLeadNote?.data?.note ||
          latestLeadNote?.description
        ) === '-'
          ? ''
          : renderNullable(latestLeadNote?.note || latestLeadNote?.data?.note || latestLeadNote?.description)

        return (
          <div className="min-w-[160px] max-w-full space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenDetails?.(row)
                }}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#BEEFF2] bg-white text-[#007A80] shadow-sm transition hover:border-[#00C2CB] hover:bg-[#E8F9FA]"
                title={`فتح تفاصيل ${leadName === '-' ? 'العميل' : leadName}`}
                aria-label={`فتح تفاصيل ${leadName === '-' ? 'العميل' : leadName}`}
                data-no-cell-copy="true"
              >
                <PanelRightOpen size={14} />
              </button>
              <div className="min-w-0 break-words font-bold text-[var(--text)]">{leadName}</div>
            </div>
            {note ? (
              <CustomerNotePreview
                note={note}
                activityAt={noteActivity?.activity_at || noteActivity?.created_at}
                title={noteActivity?.title || 'Customer note added'}
                userName={getUserLabel(noteActivity?.user)}
                label="نوت"
              />
            ) : null}
            {latestLeadNoteText ? (
              <CustomerNotePreview
                note={latestLeadNoteText}
                activityAt={latestLeadNote?.activity_at || latestLeadNote?.created_at}
                title={latestLeadNote?.title}
                userName={getUserLabel(latestLeadNote?.user)}
                label="آخر متابعة"
                tone="teal"
              />
            ) : null}
          </div>
        )
      },
    },
    {
      id: 'lead_email',
      header: 'البريد الإلكتروني',
      accessor: 'lead.email',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-44',
      render: (row) => renderNullable(getLead(row).email),
    },
    {
      id: 'latest_lead_note',
      header: 'آخر ملاحظة على العميل',
      accessor: '__latestLeadNote',
      searchable: false,
      sortable: false,
      filterable: false,
      visible: true,
      width: 'w-80',
      render: (row) => (
        <LatestLeadNoteCell
          row={row}
          latestLeadNotes={latestLeadNotes}
          onAddLeadNote={onAddLeadNote}
        />
      ),
    },
    {
      id: 'lead_phone',
      header: 'الهاتف',
      accessor: 'lead.phone',
      searchable: true,
      sortable: false,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-32',
      render: (row) => renderNullable(getLead(row).phone),
    },
    {
      id: 'company',
      header: 'الشركة',
      accessor: '__customerCompany',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-36',
      render: (row) => renderNullable(row.__customerCompany || row.company || getLead(row).company),
    },
    {
      id: 'customer_code',
      header: 'كود العميل',
      accessor: '__customerCode',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-32',
      render: (row) => renderNullable(row.__customerCode || row.code || getLead(row).code),
    },
    {
      id: 'lead_type',
      header: 'نوع الليد',
      accessor: '__leadType',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-36',
      render: (row) => renderNullable(row.__leadType || row.lead_type || getLead(row).lead_type),
    },
    {
      id: 'linked_channels',
      header: 'القنوات المربوطة',
      accessor: 'has_messenger',
      searchable: false,
      sortable: false,
      filterable: false,
      visible: true,
      width: 'w-44',
      render: (row) => {
        const lead = getLead(row)
        const messengerEnabled = hasMessengerChannel(row)
        const gmailEnabled = hasGmailChannel(row)

        if (!messengerEnabled && !gmailEnabled) {
          return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
        }

        const channelData = resolveMessengerChannel?.(row) || {}
        const unreadCount = Number(channelData.unreadCount || 0)
        const conversationId = channelData.conversationId || ''
        const gmailChannelData = resolveGmailChannel?.(row) || {}
        const gmailUnreadCount = Number(gmailChannelData.unreadCount || 0)
        const gmailConversationId = gmailChannelData.conversationId || ''

        return (
          <div className="flex items-center gap-2">
            {messengerEnabled ? (
            <button
              type="button"
              onClick={() => onOpenMessenger?.({
                conversationId,
                leadId: resolveLeadId(row),
                customerId: resolveCustomerId(row),
                leadName: lead?.name || row?.name || '',
                phone: lead?.phone || row?.phone || '',
                email: lead?.email || row?.email || '',
              })}
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D7E8EB] bg-white text-[#0A7CFF] transition hover:border-[#9EDCFF] hover:bg-[#EEF7FF]"
              title="فتح محادثة ماسنجر"
              aria-label="فتح محادثة ماسنجر"
            >
              <MessengerLogoIcon size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-black leading-none text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            ) : null}

            {gmailEnabled ? (
              <button
                type="button"
                onClick={() => onOpenGmail?.({
                  conversationId: gmailConversationId,
                  leadId: resolveLeadId(row),
                  customerId: resolveCustomerId(row),
                  leadName: lead?.name || row?.name || '',
                  phone: lead?.phone || row?.phone || '',
                  email: lead?.email || row?.email || '',
                })}
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#F4C7C3] bg-white text-[#D93025] transition hover:border-[#D93025] hover:bg-[#FCE8E6]"
                title="فتح محادثة Gmail"
                aria-label="فتح محادثة Gmail"
              >
                <GmailLogoIcon size={18} />
                {gmailUnreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-black leading-none text-white">
                    {gmailUnreadCount > 99 ? '99+' : gmailUnreadCount}
                  </span>
                )}
              </button>
            ) : null}

          </div>
        )
      },
    },
    {
      id: 'meeting',
      header: 'الميتنج',
      accessor: '__meetingFilterStatus',
      sortAccessor: '__meetingSortAt',
      searchable: false,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      visible: true,
      width: 'w-72',
      render: (row) => renderActivityWithRemaining(resolveActivityByType(row, 'meeting'), nowTimestamp, { includeMode: true }),
    },
    {
      id: 'call',
      header: 'المكالمة',
      accessor: '__callFilterStatus',
      sortAccessor: '__callSortAt',
      searchable: false,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      visible: true,
      width: 'w-72',
      render: (row) => renderActivityWithRemaining(resolveActivityByType(row, 'call'), nowTimestamp),
    },
    {
      id: 'lead_source',
      header: 'المصدر',
      accessor: 'lead.source',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-36',
      render: (row) => <CustomerSourceBadge source={getLead(row).source || row.source} />,
    },
    {
      id: 'marketing_source',
      header: 'بيانات المصدر',
      accessor: '__marketingSourceText',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-80',
      render: (row) => <CustomerMarketingSourceCell row={row} />,
    },
    {
      id: 'linked_products',
      header: 'المنتجات والاهتمامات',
      accessor: '__linkedProductsText',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-96',
      render: (row) => <CustomerProductsCell row={row} />,
    },
    {
      id: 'is_deal',
      header: 'Deal',
      accessor: 'is_deal',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Deal', value: '1' },
        { label: 'Lead', value: '0' },
      ],
      visible: true,
      width: 'w-24',
      render: (row) => (
        <Badge variant={Number(row.is_deal) === 1 ? 'success' : 'warning'}>
          {Number(row.is_deal) === 1 ? 'Deal' : 'Lead'}
        </Badge>
      ),
    },
    {
      id: 'linked_type',
      header: 'طريقة الربط',
      accessor: '__linkedType',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-32',
      render: (row) => renderNullable(row.__linkedType || row.linked_type || getLead(row).linked_type),
    },
    {
      id: 'linked_by',
      header: 'تم الربط بواسطة',
      accessor: '__linkedByText',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-48',
      render: (row) => <CustomerPersonCell row={row} field="linked_by" />,
    },
    {
      id: 'status_type_id',
      header: 'الحالة',
      accessor: 'lead.status_type_id',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: (statusesQuery.data || []).map((status) => ({
        label: status.status || status.name || String(status.id),
        value: String(status.id),
      })),
      visible: true,
      width: 'w-36',
      render: (row) => {
        const statusId = getLead(row).status_type_id
        const status = statusById.get(String(statusId))
        const label = status?.status || status?.name

        if (!label) return renderNullable(statusId)

        return (
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#D7EEF0] bg-white px-2 py-1 text-xs font-bold text-[var(--text)]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: status?.color || '#94A3B8' }}
            />
            <span className="min-w-0 max-w-28 truncate">{label}</span>
          </span>
        )
      },
    },
    {
      id: 'assigned_to',
      header: 'المسؤول',
      accessor: 'lead.assigned_to',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: (usersQuery.data || []).map((user) => ({
        label: getUserLabel(user) || String(user.id),
        value: String(user.id),
      })),
      visible: true,
      width: 'w-36',
      render: (row) => {
        const userId = getLead(row).assigned_to
        const user = userById.get(String(userId))
        const label = getUserLabel(user)

        return label ? (
          <span className="font-semibold text-[var(--text)]">{label}</span>
        ) : renderNullable(userId)
      },
    },
    {
      id: 'agent',
      header: 'السيلز / الوكيل',
      accessor: '__agentText',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-48',
      render: (row) => <CustomerPersonCell row={row} field="agent" />,
    },
    {
      id: 'assigned_at',
      header: 'Assigned At',
      accessor: 'lead.assigned_at',
      searchable: false,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-40',
      render: (row) => formatDateTime(getLead(row).assigned_at),
    },
    {
      id: 'last_action_at',
      header: 'Last Action',
      accessor: 'lead.last_action_at',
      searchable: false,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-40',
      render: (row) => formatDateTime(getLead(row).last_action_at),
    },
    {
      id: 'lead_activities',
      header: 'نشاط العميل',
      accessor: '__leadActivitiesText',
      searchable: true,
      sortable: false,
      filterable: false,
      visible: true,
      width: 'w-96',
      render: (row) => <CustomerLeadActivitiesCell row={row} />,
    },
    {
      id: 'tag_id',
      header: 'التاج',
      accessor: 'lead.tag_id',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: (tagsQuery.data || []).map((tag) => ({
        label: getTagLabel(tag) || String(tag.id),
        value: String(tag.id),
      })),
      visible: true,
      width: 'w-32',
      render: (row) => {
        const lead = getLead(row)
        const tag = lead.tag || tagById.get(String(lead.tag_id))
        const label = getTagLabel(tag)

        return label ? (
          <span className="inline-flex min-w-0 items-center rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2 py-1 text-xs font-bold text-[#007A80]">
            <span className="min-w-0 max-w-24 truncate">{label}</span>
          </span>
        ) : renderNullable(lead.tag_id)
      },
    },
    {
      id: 'created_at',
      header: 'تاريخ الإضافة',
      accessor: 'created_at',
      searchable: false,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-40',
      render: (row) => formatDateTime(row.created_at),
    },
    ...attributeColumns.map((attribute) => ({
      id: attribute.id,
      header: attribute.key,
      accessor: attribute.accessor,
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-36',
      render: (row) => {
        const value = row?.[attribute.accessor]

        return value ? (
          <span className="inline-flex max-w-full rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1 text-xs font-bold text-[var(--text)]">
            <span className="min-w-0 break-words">{value}</span>
          </span>
        ) : <span className="text-[var(--text-muted)]">-</span>
      },
    })),
  ]

  return {
    columns,
    serialColumnRender: renderCustomerSerialColumn,
  }
}
