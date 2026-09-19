import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Clock3, FileText, Megaphone, MousePointerClick, UploadCloud, UserRound } from 'lucide-react'

export const CUSTOMER_SOURCE_META = {
  form: {
    labelKey: 'customers.table.source.form',
    label: 'Form',
    icon: FileText,
    className: 'border-[#BBD7FF] bg-[#EFF6FF] text-[#145DBF]',
  },
  ad: {
    labelKey: 'customers.table.source.ad',
    label: 'Ad',
    icon: MousePointerClick,
    className: 'border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]',
  },
  campaign: {
    labelKey: 'customers.table.source.campaign',
    label: 'Campaign',
    icon: Megaphone,
    className: 'border-[#C4B5FD] bg-[#F5F3FF] text-[#6D28D9]',
  },
  manual: {
    labelKey: 'customers.table.source.manual',
    label: 'Manual',
    icon: UploadCloud,
    className: 'border-[#D7EEF0] bg-[#F8FEFF] text-[#007A80]',
  },
}

function formatHoverDateTime(value, t) {
  if (!value) return '-'

  const text = String(value).trim()
  if (!text) return '-'

  const normalized = text
    .replace('T', ' ')
    .replace(/(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/, '')

  const match = normalized.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})(?::\d{2})?$/)
  if (match) {
    const [, datePart, hourPart, minutePart] = match
    const hour24 = Number(hourPart)
    const hour12 = hour24 % 12 || 12
    const period = hour24 >= 12 ? (t ? t('common.pm') : 'PM') : (t ? t('common.am') : 'AM')
    return `${datePart} ${hour12}:${minutePart} ${period}`
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return text

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function renderValue(value) {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

function getActivityStatusMeta(statusValue = '', t) {
  const status = String(statusValue || '').trim().toLowerCase()

  if (status === 'scheduled') {
    return { label: t ? t('activities.status.scheduled') : 'Scheduled', className: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]' }
  }

  if (status === 'in_progress') {
    return { label: t ? t('activities.status.in_progress') : 'In Progress', className: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]' }
  }

  if (status === 'completed') {
    return { label: t ? t('activities.status.completed') : 'Completed', className: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]' }
  }

  if (status === 'cancelled') {
    return { label: t ? t('activities.status.cancelled') : 'Cancelled', className: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]' }
  }

  return { label: renderValue(statusValue) || '-', className: 'border-[#E2E8F0] bg-white text-[#475569]' }
}

function getActivityPriorityMeta(priorityValue = '', t) {
  const priority = String(priorityValue || '').trim().toLowerCase()

  if (priority === 'urgent') {
    return { label: t ? t('activities.priority.urgent') : 'Urgent', className: 'border-[#EF4444] bg-[#FEE2E2] text-[#991B1B]' }
  }

  if (priority === 'high') {
    return { label: t ? t('activities.priority.high') : 'High', className: 'border-[#F97316] bg-[#FFF7ED] text-[#9A3412]' }
  }

  if (priority === 'medium') {
    return { label: t ? t('activities.priority.medium') : 'Medium', className: 'border-[#F59E0B] bg-[#FFFBEB] text-[#92400E]' }
  }

  if (priority === 'low') {
    return { label: t ? t('activities.priority.low') : 'Low', className: 'border-[#22C55E] bg-[#F0FDF4] text-[#166534]' }
  }

  return { label: renderValue(priorityValue) || '-', className: 'border-[#E2E8F0] bg-white text-[#475569]' }
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

function getActivityTypeLabel(activity, t) {
  const type = String(activity?.type || '').trim().toLowerCase()
  if (type === 'meeting') return t ? t('activities.type.meeting') : 'Meeting'
  if (type === 'call') return t ? t('activities.type.call') : 'Call'
  return renderValue(type) || '-'
}

function getMeetingReportSummary(activity) {
  const reports = Array.isArray(activity?.reports) ? activity.reports : []
  const reportCount = Number(activity?.reports_count ?? reports.length ?? 0)
  const normalizedReports = reports.length ? reports : []
  const hasPreMeetingReport = normalizedReports.some((report) => String(report?.title || '').toLowerCase().includes('pre'))
  const hasAfterMeetingReport = normalizedReports.some((report) => String(report?.title || '').toLowerCase().includes('after'))

  return {
    count: Number.isFinite(reportCount) && reportCount > 0 ? reportCount : normalizedReports.length,
    hasPreMeetingReport,
    hasAfterMeetingReport,
  }
}

function HoverDetailGrid({ rows = [] }) {
  const visibleRows = rows.filter((item) => renderValue(item?.value) && item.value !== '-')

  if (!visibleRows.length) return null

  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {visibleRows.map((item) => (
        <div key={item.label} className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5">
          <div className="text-[10px] font-black text-[#64748B]">{item.label}</div>
          {item.className ? (
            <span className={`mt-1 inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${item.className}`}>
              <span className="min-w-0 break-words">{item.value}</span>
            </span>
          ) : (
            <div className="mt-0.5 whitespace-pre-wrap break-words text-xs font-bold text-[var(--text)]">
              {item.value}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function CustomerTableHoverCard({
  content,
  children,
  width = 480,
  estimatedHeight = 340,
  delay = 500,
  wrapperClassName = 'min-w-0',
  cardClassName = '',
}) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState(null)
  const anchorRef = useRef(null)
  const timerRef = useRef(null)

  const updatePosition = () => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect || typeof window === 'undefined') return

    const resolvedWidth = Math.min(width, window.innerWidth - 16)
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - resolvedWidth - 8))
    const preferredTop = rect.bottom + 6
    const top = preferredTop > window.innerHeight - estimatedHeight
      ? Math.max(8, rect.top - estimatedHeight - 6)
      : preferredTop

    setPosition({ top, left, width: resolvedWidth })
  }

  const showDelayed = () => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      updatePosition()
      setVisible(true)
    }, delay)
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
      className={wrapperClassName}
      onMouseEnter={showDelayed}
      onMouseLeave={hide}
      onFocus={showDelayed}
      onBlur={hide}
    >
      {children}
      {visible && position && content && typeof document !== 'undefined' ? createPortal(
        <div
          className={`fixed z-[160000] max-h-[min(440px,calc(100vh-1rem))] overflow-y-auto rounded-xl border border-[#D8E7EA] bg-white p-3 text-xs shadow-2xl ${cardClassName}`}
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

export function CustomerNotePreviewHover({ note, activityAt, title, userName, t }) {
  return (
    <div>
      <div className="whitespace-pre-wrap break-words leading-6">{note}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[#EEF4F5] pt-2 text-[11px] text-[#64748B]">
        {title ? <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5">{title}</span> : null}
        {activityAt ? (
          <span className="rounded-full bg-[#E8F9FA] px-2 py-0.5 text-[#007A80]">
            {formatHoverDateTime(activityAt, t)}
          </span>
        ) : null}
        {userName ? <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5">{userName}</span> : null}
      </div>
    </div>
  )
}

export function CustomerLeadNoteHoverDetails({ activity, t }) {
  const data = activity?.data && typeof activity.data === 'object' ? activity.data : null
  const h = (key, fallback) => (t ? t(`customers.table.hover.${key}`) : fallback)

  const rows = [
    { label: h('note', 'Note'), value: activity?.note || activity?.data?.note || activity?.description },
    { label: h('title', 'Title'), value: activity?.title },
    { label: h('type', 'Type'), value: activity?.type },
    { label: h('date', 'Date'), value: formatHoverDateTime(activity?.activity_at, t) },
    { label: h('createdAt', 'Created At'), value: formatHoverDateTime(activity?.created_at, t) },
    { label: h('updatedAt', 'Last Updated'), value: formatHoverDateTime(activity?.updated_at, t) },
    { label: h('user', 'User'), value: activity?.user?.name || activity?.user?.username },
    { label: h('userEmail', 'User Email'), value: activity?.user?.email },
    { label: h('userId', 'User ID'), value: activity?.user_id || activity?.user?.id },
    { label: h('logId', 'Log ID'), value: activity?.user_lead_log_id || activity?.id },
  ]

  return (
    <div className="space-y-3">
      <div className="text-sm font-black text-[#007A80]">{h('followUpData', 'Follow-up data')}</div>
      <HoverDetailGrid rows={rows} />
      {data ? (
        <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <summary className="cursor-pointer text-[11px] font-black text-[#007A80]">{h('additionalData', 'Additional data')}</summary>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#334155]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      ) : null}
      <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
        <summary className="cursor-pointer text-[11px] font-black text-[#007A80]">{h('allFollowUpData', 'All follow-up data')}</summary>
        <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#334155]">
          {JSON.stringify(activity, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export function CustomerScheduledActivityHoverDetails({ activity, remainingLabel, includeMode = false, t }) {
  const statusMeta = getActivityStatusMeta(activity?.status, t)
  const priorityMeta = getActivityPriorityMeta(activity?.priority, t)
  const normalizedType = String(activity?.type || '').trim().toLowerCase()
  const normalizedStatus = String(activity?.status || '').trim().toLowerCase()
  const canStart = normalizedStatus === 'scheduled'
  const canCancel = normalizedStatus === 'scheduled' || normalizedStatus === 'in_progress'
  const canComplete = normalizedStatus === 'in_progress'
  const showCancelButton = !(normalizedType === 'meeting' && normalizedStatus === 'in_progress')
  const reportSummary = getMeetingReportSummary(activity)
  const h = (key, fallback) => (t ? t(`customers.table.hover.${key}`) : fallback)

  const actionLoading = Boolean(activity?._statusActionLoading)

  const details = [
    { label: 'ID', value: activity?.id },
    { label: h('title', 'Title'), value: activity?.title },
    { label: h('description', 'Description'), value: activity?.description },
    { label: h('status', 'Status'), value: statusMeta.label, className: statusMeta.className },
    { label: h('priority', 'Priority'), value: priorityMeta.label, className: priorityMeta.className },
    { label: h('type', 'Type'), value: getActivityTypeLabel(activity, t) },
    includeMode ? { label: h('contactMethod', 'Contact Method'), value: activity?.mode } : null,
    { label: 'Scope', value: activity?.scope },
    { label: h('actualStart', 'Actual start'), value: formatHoverDateTime(activity?.actual_start_at, t) },
    { label: h('actualEnd', 'Actual end'), value: formatHoverDateTime(activity?.actual_end_at, t) },
    { label: h('start', 'Start'), value: formatHoverDateTime(activity?.start_at, t) },
    { label: h('end', 'End'), value: formatHoverDateTime(activity?.end_at, t) },
    { label: h('reminder', 'Reminder'), value: remainingLabel },
    { label: h('reminderType', 'Reminder Type'), value: activity?.reminder_type },
    { label: h('reminderBefore', 'Reminder Before'), value: activity?.reminder_before ? `${activity.reminder_before} ${activity?.reminder_unit || ''}` : '' },
    { label: h('reminderSentAt', 'Reminder Sent At'), value: formatHoverDateTime(activity?.reminder_sent_at, t) },
    { label: 'Meeting Link', value: activity?.meeting_link },
    { label: 'Location', value: activity?.location },
    { label: 'Latitude', value: activity?.latitude },
    { label: 'Longitude', value: activity?.longitude },
    { label: 'Call Provider', value: activity?.call_provider },
    { label: 'External Call ID', value: activity?.external_call_id },
    { label: 'Recording URL', value: activity?.recording_url },
    { label: h('reportsCount', 'Reports count'), value: reportSummary.count },
    { label: h('preMeetingReport', 'Pre-meeting report'), value: reportSummary.hasPreMeetingReport ? h('available', 'Available') : h('notAvailable', 'Not available') },
    { label: h('afterMeetingReport', 'After-meeting report'), value: reportSummary.hasAfterMeetingReport ? h('available', 'Available') : h('notAvailable', 'Not available') },
    { label: 'Call Duration', value: activity?.call_duration_seconds ? `${activity.call_duration_seconds} sec` : '' },
    { label: 'Call Status', value: activity?.call_status },
    { label: 'Caller Number', value: activity?.caller_number },
    { label: 'Callee Number', value: activity?.callee_number },
    { label: 'Team ID', value: activity?.team_id },
    { label: 'Created By', value: activity?.created_by },
    { label: h('createdAt', 'Created At'), value: formatHoverDateTime(activity?.created_at, t) },
    { label: h('updatedAt', 'Last Updated'), value: formatHoverDateTime(activity?.updated_at, t) },
  ].filter(Boolean)

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[11px] font-black text-[#007A80]">{h('note', 'Note')}</div>
        <div className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-[#F8FEFF] px-2 py-1.5 text-xs font-bold text-[#334155]">
          {getActivityNoteText(activity)}
        </div>
      </div>
      <HoverDetailGrid rows={details} />

      {typeof activity?._onChangeStatus === 'function' ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => activity._onChangeStatus('in_progress', activity)}
            disabled={!canStart || actionLoading}
            className="inline-flex h-8 items-center rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2 text-[11px] font-black text-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t ? t('customers.table.start') : 'Start'}
          </button>
          {showCancelButton ? (
            <button
              type="button"
              onClick={() => activity._onChangeStatus('cancelled', activity)}
              disabled={!canCancel || actionLoading}
              className="inline-flex h-8 items-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2 text-[11px] font-black text-[#991B1B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t ? t('customers.table.cancel') : 'Cancel'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => activity._onChangeStatus('completed', activity)}
            disabled={!canComplete || actionLoading}
            className="inline-flex h-8 items-center rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-2 text-[11px] font-black text-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t ? t('customers.table.finish') : 'Finish'}
          </button>
        </div>
      ) : null}

      {activity?.data && typeof activity.data === 'object' ? (
        <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <summary className="cursor-pointer text-[11px] font-black text-[#007A80]">{h('additionalData', 'Additional data')}</summary>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#334155]">
            {JSON.stringify(activity.data, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  )
}

export function getSourceDisplayName(source) {
  return (
    renderValue(source?.campaignName) ||
    renderValue(source?.adName) ||
    renderValue(source?.formName) ||
    renderValue(source?.manualName) ||
    renderValue(source?.title) ||
    '-'
  )
}

export function getSourceSpecificLabel(source, t) {
  const h = (key, fallback) => (t ? t(`customers.table.source.${key}`) : fallback)
  if (source?.kind === 'campaign') return h('campaign', 'Campaign')
  if (source?.kind === 'ad') return h('ad', 'Ad')
  if (source?.kind === 'form') return h('form', 'Form')
  return h('manual', 'Manual')
}

function getSourceSummaryRows(source, t) {
  const raw = source?.raw || {}
  const h = (key, fallback) => (t ? t(`customers.table.source.${key}`) : fallback)
  const hh = (key, fallback) => (t ? t(`customers.table.hover.${key}`) : fallback)

  return [
    { label: h('sourceType', 'Source Type'), value: source?.label || source?.kind },
    { label: h('campaignName', 'Campaign Name'), value: source?.campaignName || raw?.campaign?.name || raw?.campaign_name },
    { label: h('adName', 'Ad Name'), value: source?.adName || raw?.ad?.name || raw?.ads_name || raw?.ad_name },
    { label: h('formName', 'Form Name'), value: source?.formName || raw?.form?.name || raw?.form_name || raw?.lead_form_name },
    { label: h('manual', 'Manual'), value: source?.manualName },
    { label: hh('title', 'Title'), value: source?.title },
    { label: hh('description', 'Description'), value: source?.description },
    { label: h('code', 'Code'), value: source?.code },
    { label: 'External ID', value: source?.externalId },
    { label: 'Campaign ID', value: raw?.campaign_id || raw?.campaign?.id },
    { label: 'Ad ID', value: raw?.ads_id || raw?.ad_id || raw?.ad?.id },
    { label: 'Form ID', value: raw?.form_id || raw?.lead_form_id || raw?.form?.id },
    { label: 'Platform', value: source?.platform },
    { label: 'Status', value: source?.status },
    { label: 'Budget', value: source?.budget },
    { label: 'Target Audience', value: source?.targetAudience },
    { label: 'Start Date', value: source?.startDate },
    { label: 'End Date', value: source?.endDate },
    { label: h('linkedProducts', 'Linked Products'), value: source?.linkedProducts?.length ? `${source.linkedProducts.length}` : '' },
  ]
}

export function CustomerMarketingSourceHoverDetails({ source, meta, t }) {
  const displayName = getSourceDisplayName(source)
  const metaLabel = meta.labelKey && t ? t(meta.labelKey) : meta.label

  return (
    <div className="space-y-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black ${meta.className}`}>
          {metaLabel}
        </span>
        <div className="min-w-0 flex-1">
          <div className="break-words text-sm font-black text-[var(--text)]">{displayName}</div>
          {source?.description ? (
            <div className="mt-0.5 break-words text-[11px] font-semibold text-[#64748B]">{source.description}</div>
          ) : null}
        </div>
      </div>

      <HoverDetailGrid rows={getSourceSummaryRows(source, t)} />

      {source?.linkedProducts?.length ? (
        <div className="space-y-1.5">
          <div className="text-[11px] font-black text-[#007A80]">{t ? t('customers.table.source.linkedProducts') : 'Linked Products'}</div>
          <div className="flex flex-wrap gap-1.5">
            {source.linkedProducts.slice(0, 8).map((product) => (
              <span key={product.id} className="max-w-full rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-black text-[#166534]">
                <span className="break-words">{product.name || product.productId || '-'}</span>
              </span>
            ))}
            {source.linkedProducts.length > 8 ? (
              <span className="rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-black text-[#475569]">
                +{source.linkedProducts.length - 8}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function CustomerPersonHoverDetails({ person, title, t }) {
  const h = (key, fallback) => (t ? t(`customers.table.hover.${key}`) : fallback)
  const p = (key, fallback, opts) => (t ? t(`customers.table.person.${key}`, opts) : fallback)
  const resolvedTitle = title || p('title', 'User data')
  const statusLabel = person?.active !== undefined && person?.active !== null
    ? (Number(person.active) === 1 ? p('active', 'Active') : p('inactive', 'Inactive'))
    : ''
  const teamLabel = person?.teamName || (person?.teamId ? p('teamNumber', `Team ${person.teamId}`, { id: person.teamId }) : '')
  const rows = [
    { label: t ? t('customers.name') : 'Name', value: person?.name },
    { label: p('username', 'Username'), value: person?.username },
    { label: t ? t('customers.email') : 'Email', value: person?.email },
    { label: t ? t('customers.phone') : 'Phone', value: person?.phone },
    { label: p('role', 'Role'), value: person?.role },
    { label: h('type', 'Type'), value: person?.type },
    {
      label: h('status', 'Status'),
      value: statusLabel,
      className: Number(person?.active) === 1
        ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
        : 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]',
    },
    { label: p('team', 'Team'), value: teamLabel },
    { label: 'Team ID', value: person?.teamId },
    { label: 'Manager ID', value: person?.managerId },
    { label: 'Priority', value: person?.priority },
    { label: h('userId', 'User ID'), value: person?.id },
    { label: h('createdAt', 'Created At'), value: formatHoverDateTime(person?.createdAt, t) },
    { label: h('updatedAt', 'Last Updated'), value: formatHoverDateTime(person?.updatedAt, t) },
  ]

  return (
    <div className="space-y-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D7EEF0] bg-[#F8FEFF] text-[#007A80]">
          <UserRound size={15} />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-black text-[var(--text)]">{resolvedTitle}</div>
          <div className="break-words text-xs font-bold text-[#64748B]">{person?.name || '-'}</div>
        </div>
      </div>
      <HoverDetailGrid rows={rows} />
      {person?.raw && typeof person.raw === 'object' ? (
        <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <summary className="cursor-pointer text-[11px] font-black text-[#007A80]">{p('allUserData', 'All user data')}</summary>
          <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#334155]">
            {JSON.stringify(person.raw, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  )
}

export function getCustomerActivityUserName(activity, userById) {
  const directUser = activity?.user || activity?.created_by || activity?.creator || activity?.performed_by
  const directName = directUser?.name || directUser?.username || directUser?.email
  if (directName) return directName

  const userId = activity?.user_id || activity?.created_by_id || activity?.creator_id
  if (!userId) return '-'

  const user = userById?.get?.(String(userId))
  return user?.name || user?.username || user?.email || `User #${userId}`
}

export function getCustomerActivityTooltipTitle(activity, userById, t) {
  const userLabel = t ? t('customers.table.hover.user') : 'User'
  const dateLabel = t ? t('customers.table.hover.date') : 'Date'
  return [
    activity?.title,
    activity?.description,
    `${userLabel}: ${getCustomerActivityUserName(activity, userById)}`,
    `${dateLabel}: ${formatHoverDateTime(activity?.activity_at || activity?.created_at, t)}`,
  ].filter(Boolean).join('\n')
}

export function CustomerStatusChangeHoverDetails({ activities, userById, t }) {
  return (
    <div className="space-y-2">
      {activities.map((activity, index) => (
        <div key={activity.id || index} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <div className="font-black text-[#0F172A]">{activity?.title || (t ? t('customers.table.hover.statusChangeFallbackTitle') : 'Status change')}</div>
          {activity?.description ? (
            <div className="mt-1 whitespace-pre-wrap break-words text-[#475569]">{activity.description}</div>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#64748B]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
              <UserRound size={12} />
              {getCustomerActivityUserName(activity, userById)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
              <Clock3 size={12} />
              {formatHoverDateTime(activity?.activity_at || activity?.created_at, t)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
