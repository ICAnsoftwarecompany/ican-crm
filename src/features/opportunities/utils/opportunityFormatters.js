import {
  OPPORTUNITY_TYPES_MAP,
  OPPORTUNITY_STATUSES_MAP,
  OPPORTUNITY_PRIORITIES_MAP,
  OPPORTUNITY_SOURCES_MAP,
  OPPORTUNITY_SIGNAL_TYPES_MAP,
  OPPORTUNITY_DISMISS_REASONS_MAP,
  OPPORTUNITY_TIMELINE_EVENT_LABELS,
} from '../constants/opportunityTypes'

export function getOpportunityTypeLabel(value) {
  return OPPORTUNITY_TYPES_MAP.get(value)?.label || value || '-'
}

export function getOpportunityStatusMeta(value) {
  return OPPORTUNITY_STATUSES_MAP.get(value) || { value, label: value || '-', variant: 'default' }
}

export function getOpportunityPriorityMeta(value) {
  return OPPORTUNITY_PRIORITIES_MAP.get(value) || { value, label: value || '-', color: '#94A3B8' }
}

export function getOpportunitySourceMeta(value) {
  return OPPORTUNITY_SOURCES_MAP.get(value) || { value, label: value || '-', color: '#94A3B8' }
}

export function getSignalTypeMeta(value) {
  return OPPORTUNITY_SIGNAL_TYPES_MAP.get(value) || { value, label: value || '-' }
}

export function getDismissReasonLabel(value) {
  return OPPORTUNITY_DISMISS_REASONS_MAP.get(value)?.label || value || '-'
}

export function getTimelineEventLabel(type) {
  return OPPORTUNITY_TIMELINE_EVENT_LABELS[type] || type || '-'
}

export function formatCurrency(value, currency = 'EGP') {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '-'

  try {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString('ar-EG')} ${currency}`
  }
}

function parseDateValue(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(value) {
  const date = parseDateValue(value)
  if (!date) return '-'

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatRelativeTime(value, nowTimestamp = Date.now()) {
  const date = parseDateValue(value)
  if (!date) return '-'

  const diffMs = nowTimestamp - date.getTime()
  if (diffMs < 0) {
    return formatDateTime(value)
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  if (diffMinutes < 1) return 'الآن'
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `منذ ${diffHours} ساعة`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `منذ ${diffDays} يوم`

  const diffMonths = Math.floor(diffDays / 30)
  return `منذ ${diffMonths} شهر`
}

export function isOpportunityOverdue(opportunity, nowTimestamp = Date.now()) {
  const dueAt = opportunity?.next_action?.due_at
  if (!dueAt) return false
  if (['activated', 'dismissed', 'expired'].includes(opportunity?.status)) return false

  const dueDate = parseDateValue(dueAt)
  if (!dueDate) return false

  return dueDate.getTime() < nowTimestamp
}

export function isHighPotentialOpportunity(opportunity) {
  return Number(opportunity?.score?.total || 0) >= 80
}

export function getScoreComponents(score = {}) {
  return [
    { key: 'fit', label: 'Fit', value: Number(score.fit) || 0, max: 25 },
    { key: 'intent', label: 'Intent', value: Number(score.intent) || 0, max: 30 },
    { key: 'engagement', label: 'Engagement', value: Number(score.engagement) || 0, max: 25 },
    { key: 'timing', label: 'Timing', value: Number(score.timing) || 0, max: 20 },
  ]
}
