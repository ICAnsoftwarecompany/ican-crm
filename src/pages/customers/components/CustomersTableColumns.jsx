import { useCallback, useEffect, useMemo, useState } from 'react'
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
import {
  CustomerLeadNoteHoverDetails,
  CustomerNotePreviewHover,
  CustomerScheduledActivityHoverDetails,
  CustomerTableHoverCard,
} from './customers-table/CustomerTableHovers'

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

  return date.toLocaleString(undefined, {
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

const FRESH_LEAD_TYPE = 'fresh lead'

function isFreshLeadRow(row) {
  return String(row?.__leadType || row?.lead_type || getLead(row).lead_type || '')
    .trim()
    .toLowerCase() === FRESH_LEAD_TYPE
}

function FreshLeadBadge({ label, compact = false }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-[#BBF7D0] bg-[#F0FDF4] font-black leading-none text-[#166534] ${
        compact ? 'max-w-20 px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      }`}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  )
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
  label = 'Note',
  tone = 'slate',
}) {
  if (!note) return null

  const toneClasses = tone === 'teal'
    ? 'border-[#BEEFF2] bg-[#F8FEFF] text-[#0F766E]'
    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'

  return (
    <CustomerTableHoverCard
      content={<CustomerNotePreviewHover note={note} activityAt={activityAt} title={title} userName={userName} />}
      width={360}
      estimatedHeight={180}
      wrapperClassName="relative"
    >
      <div className={`line-clamp-2 break-words rounded-md border px-2 py-1 text-[11px] font-semibold leading-5 ${toneClasses}`}>
        <span className="me-1 font-black">{label}:</span>
        <span>{note}</span>
      </div>
    </CustomerTableHoverCard>
  )
}

function getLatestLeadNote(row, latestLeadNotes) {
  const leadId = resolveLeadId(row)
  if (!leadId || !latestLeadNotes?.get) return null
  return latestLeadNotes.get(String(leadId)) || null
}

function DelayedFullTextHover({ text = '', children }) {
  return (
    <CustomerTableHoverCard
      content={text}
      width={420}
      estimatedHeight={260}
      wrapperClassName="relative"
      cardClassName="font-bold leading-6 text-[#334155]"
    >
      {children}
    </CustomerTableHoverCard>
  )
}

function LeadNoteHoverDetails({ activity }) {
  const data = activity?.data && typeof activity.data === 'object' ? activity.data : null
  const rows = [
    { label: 'الملاحظة', value: activity?.note || activity?.data?.note || activity?.description },
    { label: 'العنوان', value: activity?.title },
    { label: 'النوع', value: activity?.type },
    { label: 'التاريخ', value: formatDateTime(activity?.activity_at) },
    { label: 'تاريخ الإنشاء', value: formatDateTime(activity?.created_at) },
    { label: 'آخر تحديث', value: formatDateTime(activity?.updated_at) },
    { label: 'المستخدم', value: activity?.user?.name || activity?.user?.username },
    { label: 'بريد المستخدم', value: activity?.user?.email },
    { label: 'User ID', value: activity?.user_id || activity?.user?.id },
    { label: 'Log ID', value: activity?.user_lead_log_id || activity?.id },
  ].filter((item) => item.value && item.value !== '-')

  return (
    <div className="space-y-3">
      <div className="text-sm font-black text-[#007A80]">بيانات المتابعة</div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {rows.map((item) => (
          <div key={item.label} className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5">
            <div className="text-[10px] font-black text-[#64748B]">{item.label}</div>
            <div className="mt-0.5 whitespace-pre-wrap break-words text-xs font-bold text-[var(--text)]">
              {item.value}
            </div>
          </div>
        ))}
      </div>
      {data ? (
        <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <summary className="cursor-pointer text-[11px] font-black text-[#007A80]">بيانات إضافية</summary>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#334155]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      ) : null}
      <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
        <summary className="cursor-pointer text-[11px] font-black text-[#007A80]">كل بيانات المتابعة</summary>
        <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#334155]">
          {JSON.stringify(activity, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function LatestLeadNoteCell({ row, latestLeadNotes, onAddLeadNote, t }) {
  const activity = getLatestLeadNote(row, latestLeadNotes)
  const lead = getLead(row)
  const targetName = lead?.name || (t ? t('customers.table.theCustomer') : 'the customer')

  const addButton = (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onAddLeadNote?.(row)
      }}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#BEEFF2] bg-white text-[#007A80] transition hover:bg-[#E8F9FA]"
      title={t ? t('customers.table.addNoteFor', { name: targetName }) : `Add a note for ${targetName}`}
      aria-label={t ? t('customers.table.addNoteFor', { name: targetName }) : `Add a note for ${targetName}`}
    >
      <Plus size={14} />
    </button>
  )

  if (!activity) {
    return (
      <div className="flex w-full min-w-0 items-center gap-2">
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
    <div className="w-full min-w-0 max-w-full space-y-1.5">
      <div className="flex items-start gap-2">
        {addButton}
        <div className="min-w-0 flex-1">
          <CustomerTableHoverCard
            content={<CustomerLeadNoteHoverDetails activity={activity} />}
            width={480}
            estimatedHeight={340}
          >
            <div className="line-clamp-2 break-words rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-2.5 py-1.5 text-xs font-bold leading-5 text-[var(--text)]">
              {note}
            </div>
          </CustomerTableHoverCard>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
        <span className="inline-flex max-w-full items-center rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5">
          <span className="min-w-0 break-words">{title}</span>
        </span>
        <span className="inline-flex items-center rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2 py-0.5 text-[#007A80]">
          {activityAt}
        </span>
        <span className="inline-flex max-w-full items-center rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5">
          <span className="min-w-0 break-words">{userName}</span>
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

function formatBackendDateTime(value, t) {
  if (!value) return '-'

  const text = String(value).trim()
  if (!text) return '-'

  const parsedTime = parseBackendLocalTimestamp(text)
  if (!Number.isNaN(parsedTime)) {
    return new Date(parsedTime).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const normalized = text
    .replace('T', ' ')
    .replace(/(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/, '')

  const dateTimeMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})/)
  if (dateTimeMatch) {
    const [, datePart, hourPart, minutePart] = dateTimeMatch
    const hour24 = Number(hourPart)
    const hour12 = hour24 % 12 || 12
    const period = hour24 >= 12 ? (t ? t('common.pm') : 'PM') : (t ? t('common.am') : 'AM')

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

function getActivitiesByType(row, expectedType) {
  const lead = getLead(row)
  const type = normalizeActivityType(expectedType)
  const meetings = Array.isArray(lead?.meetings) ? lead.meetings : []

  const fromMeetings = meetings
    .filter((activity) => normalizeActivityType(activity?.type) === type)
    .sort((first, second) => {
      const firstTime = parseBackendLocalTimestamp(first?.start_at)
      const secondTime = parseBackendLocalTimestamp(second?.start_at)
      return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
    })

  if (fromMeetings.length) return fromMeetings

  const fallback = resolveActivityByType(row, type)
  return fallback ? [fallback] : []
}

function resolveScheduledActivityByType(row, expectedType, nowTimestamp) {
  const scheduled = getActivitiesByType(row, expectedType)
    .filter((activity) => String(activity?.status || '').trim().toLowerCase() === 'scheduled')

  if (!scheduled.length) return null

  const upcoming = scheduled
    .filter((activity) => {
      const time = parseBackendLocalTimestamp(activity?.start_at)
      return !Number.isNaN(time) && time >= nowTimestamp
    })
    .sort((first, second) => parseBackendLocalTimestamp(first?.start_at) - parseBackendLocalTimestamp(second?.start_at))

  if (upcoming.length) return upcoming[0]

  return scheduled
    .sort((first, second) => parseBackendLocalTimestamp(second?.start_at) - parseBackendLocalTimestamp(first?.start_at))[0]
}

function resolveInProgressActivityByType(row, expectedType, nowTimestamp) {
  const inProgress = getActivitiesByType(row, expectedType)
    .filter((activity) => String(activity?.status || '').trim().toLowerCase() === 'in_progress')

  if (!inProgress.length) return null

  const overdue = inProgress
    .filter((activity) => {
      const endAt = parseBackendLocalTimestamp(activity?.end_at)
      return !Number.isNaN(endAt) && endAt <= nowTimestamp
    })
    .sort((first, second) => parseBackendLocalTimestamp(first?.end_at) - parseBackendLocalTimestamp(second?.end_at))

  if (overdue.length) return overdue[0]

  return inProgress
    .sort((first, second) => parseBackendLocalTimestamp(first?.start_at) - parseBackendLocalTimestamp(second?.start_at))[0]
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
    <div className="w-full min-w-0 space-y-1.5">
      <div className="text-xs font-black text-[var(--text)]">{formatBackendDateTime(activity?.start_at)}</div>
      <div className="break-words text-[11px] font-semibold text-[var(--text-muted)]" title={detailText || '-'}>
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
    <div className="w-full min-w-0 space-y-1">
      <div className="text-xs font-black text-[var(--text)]">{formatBackendDateTime(activity?.start_at)}</div>
      {remainingLabel ? (
        <div className={`text-[10px] font-black ${isReminderAlert ? 'text-[#B91C1C]' : 'text-[#64748B]'}`}>
          {remainingLabel}
        </div>
      ) : null}
      <div className="break-words text-[11px] font-semibold text-[var(--text-muted)]" title={detailText || '-'}>
        {detailText || '-'}
      </div>
    </div>
  )
}

function getActivityNoteText(activity) {
  return (
    activity?.note ||
    activity?.notes ||
    activity?.data?.note ||
    activity?.description ||
    activity?.title ||
    '-'
  )
}

function getActivityReportsCount(activity) {
  const value = activity?.reports_count
  if (value === null || value === undefined || value === '') return null

  const count = Number(value)
  if (Number.isFinite(count)) return count

  const raw = String(value).trim()
  return raw ? raw : null
}

function ScheduledActivityHover({ activity, remainingLabel, includeMode = false }) {
  const statusMeta = getActivityStatusMeta(activity?.status)
  const priorityMeta = getActivityPriorityMeta(activity?.priority)
  const details = [
    { label: 'العنوان', value: activity?.title },
    { label: 'الحالة', value: statusMeta.label, className: statusMeta.className },
    { label: 'الأولوية', value: priorityMeta.label, className: priorityMeta.className },
    { label: 'النوع', value: normalizeActivityType(activity?.type) },
    includeMode ? { label: 'طريقة التواصل', value: activity?.mode } : null,
    { label: 'البداية', value: formatBackendDateTime(activity?.start_at) },
    { label: 'النهاية', value: formatBackendDateTime(activity?.end_at) },
    { label: 'التذكير', value: remainingLabel },
    { label: 'قبل التذكير', value: activity?.reminder_before ? `${activity.reminder_before} ${activity?.reminder_unit || ''}` : '' },
    { label: 'تم الإنشاء', value: formatBackendDateTime(activity?.created_at) },
    { label: 'آخر تحديث', value: formatBackendDateTime(activity?.updated_at) },
  ].filter((item) => item?.value && item.value !== '-')

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[11px] font-black text-[#007A80]">الملاحظة</div>
        <div className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-[#F8FEFF] px-2 py-1.5 text-xs font-bold text-[#334155]">
          {getActivityNoteText(activity)}
        </div>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label} className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5">
            <div className="text-[10px] font-black text-[#64748B]">{detail.label}</div>
            {detail.className ? (
              <span className={`mt-1 inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${detail.className}`}>
                <span className="min-w-0 break-words">{detail.value}</span>
              </span>
            ) : (
              <div className="mt-0.5 break-words text-xs font-bold text-[var(--text)]">{detail.value}</div>
            )}
          </div>
        ))}
      </div>
      {activity?.data && typeof activity.data === 'object' ? (
        <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <summary className="cursor-pointer text-[11px] font-black text-[#007A80]">بيانات إضافية</summary>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#334155]">
            {JSON.stringify(activity.data, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  )
}

function DelayedActivityHover({ content, children }) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState(null)
  const anchorRef = useRef(null)
  const timerRef = useRef(null)

  const updatePosition = () => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect || typeof window === 'undefined') return

    const width = Math.min(480, window.innerWidth - 16)
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    const bottomTop = rect.bottom + 6
    const top = bottomTop > window.innerHeight - 340
      ? Math.max(8, rect.top - 340 - 6)
      : bottomTop

    setPosition({ top, left, width })
  }

  const showDelayed = () => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      updatePosition()
      setVisible(true)
    }, 500)
  }

  const hide = () => {
    window.clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return undefined

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [visible])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  return (
    <div
      ref={anchorRef}
      className="min-w-0"
      onMouseEnter={showDelayed}
      onMouseLeave={hide}
      onFocus={showDelayed}
      onBlur={hide}
    >
      {children}
      {visible && position && content ? createPortal(
        <div
          className="fixed z-[160000] max-h-[min(420px,calc(100vh-1rem))] overflow-y-auto rounded-xl border border-[#D8E7EA] bg-white p-3 text-xs shadow-2xl"
          style={{ top: position.top, left: position.left, width: position.width }}
          onMouseEnter={() => window.clearTimeout(timerRef.current)}
          onMouseLeave={hide}
        >
          {content}
        </div>,
        document.body
      ) : null}
    </div>
  )
}

function renderScheduledActivitySummary(activity, nowTimestamp, { includeMode = false, onChangeScheduledActivityStatus, t } = {}) {
  if (!activity) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const remainingLabel = getScheduledRemainingLabel(activity, nowTimestamp, t)
  const isReminderAlert = isActivityInReminderWindow(activity, nowTimestamp)
  const noteText = getActivityNoteText(activity)
  const reportsCount = getActivityReportsCount(activity)
  const actualStartLabel = activity?.actual_start_at ? formatBackendDateTime(activity.actual_start_at, t) : ''
  const actualElapsedLabel = getActualElapsedLabel(activity, nowTimestamp, t)

  return (
    <CustomerTableHoverCard
      content={(
        <CustomerScheduledActivityHoverDetails
          activity={
            activity
              ? {
                  ...activity,
                  _onChangeStatus: onChangeScheduledActivityStatus,
                }
              : activity
          }
          remainingLabel={remainingLabel}
          includeMode={includeMode}
        />
      )}
      width={480}
      estimatedHeight={340}
    >
      <div className="w-full min-w-0 space-y-1 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1.5">
        <div className="break-words text-xs font-black text-[var(--text)]">
          {formatBackendDateTime(activity?.start_at, t)}
        </div>
        {actualStartLabel ? (
          <div className="break-words text-[10px] font-black text-[#007A80]">
            {t ? t('customers.table.hover.actualStart') : 'Actual start'}: {actualStartLabel}
          </div>
        ) : null}
        {actualElapsedLabel ? (
          <div className="break-words text-[10px] font-black text-[#0F766E]">
            {actualElapsedLabel}
          </div>
        ) : null}
        {remainingLabel ? (
          <div className={`break-words text-[10px] font-black ${isReminderAlert ? 'text-[#B91C1C]' : 'text-[#64748B]'}`}>
            {remainingLabel}
          </div>
        ) : null}
        {reportsCount !== null && normalizeActivityType(activity?.type) === 'meeting' ? (
          <div className="break-words text-[10px] font-black text-[#0369A1]">
            {t ? t('customers.table.hover.reportsCount') : 'Reports count'}: {reportsCount}
          </div>
        ) : null}
        <div className="break-words text-[11px] font-semibold text-[var(--text-muted)]" title={noteText}>
          {noteText}
        </div>
      </div>
    </CustomerTableHoverCard>
  )
}

function renderInlineStatusActions(activity, nowTimestamp, onChangeScheduledActivityStatus, t) {
  if (!activity || typeof onChangeScheduledActivityStatus !== 'function') return null

  const status = String(activity?.status || '').trim().toLowerCase()
  const reminderStarted = isActivityInReminderWindow(activity, nowTimestamp)

  if (status === 'in_progress') {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChangeScheduledActivityStatus('completed', activity)
          }}
          className="inline-flex h-7 items-center rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-2 text-[10px] font-black text-[#166534]"
        >
          {t ? t('customers.table.finish') : 'Finish'}
        </button>
      </div>
    )
  }

  if (status === 'scheduled' && reminderStarted) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChangeScheduledActivityStatus('in_progress', activity)
          }}
          className="inline-flex h-7 items-center rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2 text-[10px] font-black text-[#1D4ED8]"
        >
          {t ? t('customers.table.start') : 'Start'}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChangeScheduledActivityStatus('cancelled', activity)
          }}
          className="inline-flex h-7 items-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2 text-[10px] font-black text-[#991B1B]"
        >
          {t ? t('customers.table.cancel') : 'Cancel'}
        </button>
      </div>
    )
  }

  return null
}

function ScheduledActivityAddButton({ row, type, onAddScheduledActivity, t }) {
  const label = type === 'meeting'
    ? (t ? t('customers.table.addMeeting') : 'Add meeting')
    : (t ? t('customers.table.addCall') : 'Add call')

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onAddScheduledActivity?.(row, type)
      }}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#BEEFF2] bg-white text-[#007A80] transition hover:bg-[#E8F9FA]"
      title={label}
      aria-label={label}
      data-no-cell-copy="true"
    >
      <Plus size={14} />
    </button>
  )
}

function renderScheduledActivityCell(row, type, nowTimestamp, { includeMode = false, onAddScheduledActivity, onChangeScheduledActivityStatus, t } = {}) {
  const activity = resolveScheduledActivityByType(row, type, nowTimestamp)
  const inProgressActivity = resolveInProgressActivityByType(row, type, nowTimestamp)
  const activities = getActivitiesByType(row, type)

  const statusChips = [
    {
      key: 'completed',
      label: t ? t('activities.status.completed') : 'Completed',
      className: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]',
      items: activities.filter((item) => String(item?.status || '').trim().toLowerCase() === 'completed'),
    },
    {
      key: 'cancelled',
      label: t ? t('activities.status.cancelled') : 'Cancelled',
      className: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]',
      items: activities.filter((item) => String(item?.status || '').trim().toLowerCase() === 'cancelled'),
    },
    {
      key: 'in_progress',
      label: t ? t('activities.status.in_progress') : 'In Progress',
      className: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]',
      items: activities.filter((item) => String(item?.status || '').trim().toLowerCase() === 'in_progress'),
    },
  ]

  const groupLabel = type === 'meeting'
    ? (t ? t('customers.table.meetingsGroupLabel') : 'Meetings')
    : (t ? t('customers.table.callsGroupLabel') : 'Calls')

  return (
    <div className="flex w-full min-w-0 items-start gap-2">
      <ScheduledActivityAddButton row={row} type={type} onAddScheduledActivity={onAddScheduledActivity} t={t} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusChips.map((chip) => (
            <CustomerTableHoverCard
              key={chip.key}
              width={420}
              estimatedHeight={300}
              content={(
                <div className="space-y-2">
                  <div className="text-xs font-black text-[#0F172A]">
                    {groupLabel} - {chip.label}
                  </div>
                  {chip.items.length ? (
                    chip.items.map((item) => (
                      <div key={item?.id || `${item?.start_at || ''}-${item?.title || ''}`} className="rounded-lg border border-[#E2E8F0] bg-white p-2">
                        <div className="text-xs font-black text-[#0F172A]">{item?.title || item?.description || '-'}</div>
                        <div className="mt-1 text-[11px] font-semibold text-[#64748B]">{formatBackendDateTime(item?.start_at, t)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[11px] font-semibold text-[#64748B]">
                      {t ? t('customers.table.noItemsForStatus') : 'No items with this status.'}
                    </div>
                  )}
                </div>
              )}
            >
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${chip.className}`}>
                <span>{chip.items.length}</span>
              </span>
            </CustomerTableHoverCard>
          ))}
        </div>
        {renderScheduledActivitySummary(activity, nowTimestamp, { includeMode, onChangeScheduledActivityStatus, t })}
        {renderInlineStatusActions(activity, nowTimestamp, onChangeScheduledActivityStatus, t)}
        {inProgressActivity ? (
          <>
            {renderScheduledActivitySummary(inProgressActivity, nowTimestamp, { includeMode, onChangeScheduledActivityStatus, t })}
            {renderInlineStatusActions(inProgressActivity, nowTimestamp, onChangeScheduledActivityStatus, t)}
          </>
        ) : null}
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

function formatCountdownDuration(diffMs, t) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []

  const tr = (key, count) => (t ? t(key, { count }) : `${count}`)

  if (days) parts.push(tr('activities.duration.day', days))
  if (days || hours) parts.push(tr('activities.duration.hour', hours))
  if (days || hours || minutes) parts.push(tr('activities.duration.minute', minutes))
  parts.push(tr('activities.duration.second', seconds))

  const joined = parts.join(t ? t('activities.duration.and') : ' and ')
  return t ? t('activities.duration.remaining', { value: joined }) : `Remaining ${joined}`
}

function formatOverdueHours(diffMs, t) {
  const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)))
  return t ? t('activities.duration.overdueSince', { hours }) : `Overdue by ${hours}h`
}

function formatElapsedDuration(diffMs, t) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const parts = []

  const tr = (key, count) => (t ? t(key, { count }) : `${count}`)

  if (days) parts.push(tr('activities.duration.day', days))
  if (hours) parts.push(tr('activities.duration.hour', hours))
  if (minutes) parts.push(tr('activities.duration.minute', minutes))
  if (!parts.length) parts.push(t ? t('activities.duration.lessThanMinute') : 'Less than a minute')

  return parts.slice(0, 2).join(t ? t('activities.duration.and') : ' and ')
}

function getScheduledRemainingLabel(activity, nowTimestamp, t) {
  const status = String(activity?.status || '').trim().toLowerCase()
  if (status !== 'scheduled' && status !== 'in_progress') return ''

  if (status === 'in_progress') {
    const statusChangedAt = parseBackendLocalTimestamp(activity?.actual_start_at)
    const changedAt = Number.isNaN(statusChangedAt)
      ? parseTimestamp(activity?.actual_start_at)
      : statusChangedAt

    if (!Number.isNaN(changedAt) && nowTimestamp >= changedAt) {
      if (normalizeActivityType(activity?.type) === 'meeting') {
        return ''
      }
      const elapsed = formatElapsedDuration(nowTimestamp - changedAt, t)
      return t ? t('activities.duration.inProgressSince', { value: elapsed }) : `In progress for ${elapsed}`
    }
  }

  const startAt = parseBackendLocalTimestamp(activity?.start_at)
  const endAt = parseBackendLocalTimestamp(activity?.end_at)
  if (Number.isNaN(startAt) && Number.isNaN(endAt)) return ''

  if (status === 'in_progress' && !Number.isNaN(endAt)) {
    const diffEndMs = endAt - nowTimestamp
    if (diffEndMs <= 0) return formatOverdueHours(Math.abs(diffEndMs), t)
  }

  if (!Number.isNaN(startAt)) {
    const diffMs = startAt - nowTimestamp
    if (diffMs <= 0) {
      if (status === 'scheduled') return formatOverdueHours(Math.abs(diffMs), t)
      return t ? t('activities.duration.inProgressNow') : 'Activity in progress now'
    }

    return formatCountdownDuration(diffMs, t)
  }

  return ''
}

function getActualElapsedLabel(activity, nowTimestamp, t) {
  const status = String(activity?.status || '').trim().toLowerCase()
  if (status !== 'in_progress' || !activity?.actual_start_at) return ''

  const actualStartAt = parseBackendLocalTimestamp(activity.actual_start_at)
  const startedAt = Number.isNaN(actualStartAt)
    ? parseTimestamp(activity.actual_start_at)
    : actualStartAt

  if (Number.isNaN(startedAt) || nowTimestamp < startedAt) return ''

  const elapsed = formatElapsedDuration(nowTimestamp - startedAt, t)
  return t ? t('activities.duration.elapsedTime', { value: elapsed }) : `Elapsed time: ${elapsed}`
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
    <div className="w-full min-w-0 space-y-1">
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
    <div className="flex w-full min-w-0 flex-wrap gap-1.5">
      {attributes.map((attribute) => (
        <span
          key={attribute.id || `${attribute.key}-${attribute.value}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1 text-xs font-semibold text-[var(--text)]"
          title={`${attribute.key}: ${attribute.value}`}
        >
          <span className="shrink-0 text-[#007A80]">{renderNullable(attribute.key)}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span className="min-w-0 break-words">{renderNullable(attribute.value)}</span>
        </span>
      ))}
    </div>
  )
}

export function useCustomersTableColumns(options = {}) {
  const translate = typeof options.t === 'function' ? options.t : null
  const freshLeadLabel = translate ? translate('customers.freshLead') : 'Fresh lead'
  const resolveMessengerChannel = options.resolveMessengerChannel
  const resolveGmailChannel = options.resolveGmailChannel
  const onOpenMessenger = options.onOpenMessenger
  const onOpenGmail = options.onOpenGmail
  const onOpenDetails = options.onOpenDetails
  const latestLeadNotes = options.latestLeadNotes
  const onAddLeadNote = options.onAddLeadNote
  const onAddScheduledActivity = options.onAddScheduledActivity
  const onChangeScheduledActivityStatus = options.onChangeScheduledActivityStatus
  const customerRows = Array.isArray(options.customerRows) ? options.customerRows : []
  const attributeColumns = Array.isArray(options.attributeColumns) ? options.attributeColumns : []
  const [nowTimestamp, setNowTimestamp] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTimestamp(Date.now())
    }, 1000)

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
      <span className="flex min-w-0 flex-col items-center gap-1">
        <CustomerSourceBadge source={row.source || row.lead?.source} iconOnly />
        {isFreshLeadRow(row) ? <FreshLeadBadge label={freshLeadLabel} compact /> : null}
      </span>
    </div>
  ), [freshLeadLabel])

  const columns = [
    {
      id: 'lead_id',
      header: translate ? translate('customers.table.leadId') : 'Lead ID',
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
      header: translate ? translate('customers.table.customerName') : 'Customer Name',
      accessor: 'lead.name',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-36',
      render: (row) => {
        const leadName = renderNullable(getLead(row).name)
        const detailsTarget = leadName === '-' ? (translate ? translate('customers.table.theCustomer') : 'the customer') : leadName
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
          <div className="w-full min-w-0 max-w-full space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenDetails?.(row)
                }}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#BEEFF2] bg-white text-[#007A80] shadow-sm transition hover:border-[#00C2CB] hover:bg-[#E8F9FA]"
                title={translate ? translate('customers.table.openDetailsFor', { name: detailsTarget }) : `Open ${detailsTarget} details`}
                aria-label={translate ? translate('customers.table.openDetailsFor', { name: detailsTarget }) : `Open ${detailsTarget} details`}
                data-no-cell-copy="true"
              >
                <PanelRightOpen size={14} />
              </button>
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="min-w-0 break-words font-bold text-[var(--text)]">{leadName}</span>
                {isFreshLeadRow(row) ? <FreshLeadBadge label={freshLeadLabel} /> : null}
              </div>
            </div>
            {note ? (
              <CustomerNotePreview
                note={note}
                activityAt={noteActivity?.activity_at || noteActivity?.created_at}
                title={noteActivity?.title || 'Customer note added'}
                userName={getUserLabel(noteActivity?.user)}
                label={translate ? translate('customers.table.notePreviewNote') : 'Note'}
              />
            ) : null}
            {latestLeadNoteText ? (
              <CustomerNotePreview
                note={latestLeadNoteText}
                activityAt={latestLeadNote?.activity_at || latestLeadNote?.created_at}
                title={latestLeadNote?.title}
                userName={getUserLabel(latestLeadNote?.user)}
                label={translate ? translate('customers.table.notePreviewLastFollowUp') : 'Last Follow-up'}
                tone="teal"
              />
            ) : null}
          </div>
        )
      },
    },
    {
      id: 'lead_email',
      header: translate ? translate('customers.email') : 'Email',
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
      header: translate ? translate('customers.table.latestFollowUp') : 'Latest Follow-up',
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
          t={translate}
        />
      ),
    },
    {
      id: 'lead_phone',
      header: translate ? translate('customers.phone') : 'Phone',
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
      header: translate ? translate('customers.table.company') : 'Company',
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
      header: translate ? translate('customers.table.customerCode') : 'Customer Code',
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
      header: translate ? translate('customers.table.leadType') : 'Lead Type',
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
      header: translate ? translate('customers.table.linkedChannels') : 'Linked Channels',
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
              title={translate ? translate('customers.table.openMessengerChat') : 'Open Messenger conversation'}
              aria-label={translate ? translate('customers.table.openMessengerChat') : 'Open Messenger conversation'}
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
                title={translate ? translate('customers.table.openGmailChat') : 'Open Gmail conversation'}
                aria-label={translate ? translate('customers.table.openGmailChat') : 'Open Gmail conversation'}
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
      header: translate ? translate('customers.table.meeting') : 'Meeting',
      accessor: '__meetingFilterStatus',
      sortAccessor: '__meetingSortAt',
      searchable: false,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: translate ? translate('activities.status.scheduled') : 'Scheduled', value: 'scheduled' },
        { label: translate ? translate('activities.status.in_progress') : 'In Progress', value: 'in_progress' },
        { label: translate ? translate('activities.status.completed') : 'Completed', value: 'completed' },
        { label: translate ? translate('activities.status.cancelled') : 'Cancelled', value: 'cancelled' },
      ],
      visible: true,
      width: 'w-72',
      render: (row) => renderScheduledActivityCell(row, 'meeting', nowTimestamp, {
        includeMode: true,
        onAddScheduledActivity,
        onChangeScheduledActivityStatus,
        t: translate,
      }),
    },
    {
      id: 'call',
      header: translate ? translate('customers.table.call') : 'Call',
      accessor: '__callFilterStatus',
      sortAccessor: '__callSortAt',
      searchable: false,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: translate ? translate('activities.status.scheduled') : 'Scheduled', value: 'scheduled' },
        { label: translate ? translate('activities.status.in_progress') : 'In Progress', value: 'in_progress' },
        { label: translate ? translate('activities.status.completed') : 'Completed', value: 'completed' },
        { label: translate ? translate('activities.status.cancelled') : 'Cancelled', value: 'cancelled' },
      ],
      visible: true,
      width: 'w-72',
      render: (row) => renderScheduledActivityCell(row, 'call', nowTimestamp, {
        onAddScheduledActivity,
        onChangeScheduledActivityStatus,
        t: translate,
      }),
    },
    {
      id: 'lead_source',
      header: translate ? translate('leads.source') : 'Source',
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
      header: translate ? translate('customers.table.marketingSourceData') : 'Source Data',
      accessor: '__marketingSourceText',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-80',
      render: (row) => <CustomerMarketingSourceCell row={row} t={translate} />,
    },
    {
      id: 'linked_products',
      header: translate ? translate('customers.table.productsAndInterests') : 'Products & Interests',
      accessor: '__linkedProductsText',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-96',
      render: (row) => <CustomerProductsCell row={row} customerRows={customerRows} t={translate} />,
    },
    {
      id: 'is_deal',
      header: translate ? translate('customers.table.deal') : 'Deal',
      accessor: 'is_deal',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: translate ? translate('customers.table.deal') : 'Deal', value: '1' },
        { label: translate ? translate('customers.table.lead') : 'Lead', value: '0' },
      ],
      visible: true,
      width: 'w-24',
      render: (row) => (
        <Badge variant={Number(row.is_deal) === 1 ? 'success' : 'warning'}>
          {Number(row.is_deal) === 1 ? (translate ? translate('customers.table.deal') : 'Deal') : (translate ? translate('customers.table.lead') : 'Lead')}
        </Badge>
      ),
    },
    {
      id: 'linked_type',
      header: translate ? translate('customers.table.linkedType') : 'Link Method',
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
      header: translate ? translate('customers.table.linkedBy') : 'Linked By',
      accessor: '__linkedByText',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-48',
      render: (row) => <CustomerPersonCell row={row} field="linked_by" userById={userById} t={translate} />,
    },
    {
      id: 'status_type_id',
      header: translate ? translate('customers.table.status') : 'Status',
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
            <span className="min-w-0 break-words">{label}</span>
          </span>
        )
      },
    },
    {
      id: 'assigned_to',
      header: translate ? translate('customers.table.assignedTo') : 'Assigned To',
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
      header: translate ? translate('customers.table.agent') : 'Sales / Agent',
      accessor: '__agentText',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      visible: true,
      width: 'w-48',
      render: (row) => <CustomerPersonCell row={row} field="agent" userById={userById} t={translate} />,
    },
    {
      id: 'assigned_at',
      header: translate ? translate('customers.table.assignedAt') : 'Assigned At',
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
      header: translate ? translate('customers.table.lastAction') : 'Last Action',
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
      header: translate ? translate('customers.table.leadActivities') : 'Customer Activity',
      accessor: '__leadActivitiesText',
      searchable: true,
      sortable: false,
      filterable: false,
      visible: true,
      width: 'w-96',
      render: (row) => <CustomerLeadActivitiesCell row={row} userById={userById} t={translate} />,
    },
    {
      id: 'tag_id',
      header: translate ? translate('customers.table.tag') : 'Tag',
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
            <span className="min-w-0 break-words">{label}</span>
          </span>
        ) : renderNullable(lead.tag_id)
      },
    },
    {
      id: 'created_at',
      header: translate ? translate('customers.table.createdAt') : 'Date Added',
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
