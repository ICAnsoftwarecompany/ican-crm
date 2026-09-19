import {
  getOpportunityTypesMap,
  getOpportunityStatusesMap,
  getOpportunityPrioritiesMap,
  getOpportunitySourcesMap,
  getOpportunitySignalTypesMap,
  getOpportunityDismissReasonsMap,
  getOpportunityTimelineEventLabels,
} from '../constants/opportunityTypes'

function resolveLocale(language) {
  return String(language || '').startsWith('ar') ? 'ar-EG' : 'en-US'
}

export function getOpportunityTypeLabel(value, t) {
  return getOpportunityTypesMap(t).get(value)?.label || value || '-'
}

export function getOpportunityStatusMeta(value, t) {
  return getOpportunityStatusesMap(t).get(value) || { value, label: value || '-', variant: 'default' }
}

export function getOpportunityPriorityMeta(value, t) {
  return getOpportunityPrioritiesMap(t).get(value) || { value, label: value || '-', color: '#94A3B8' }
}

export function getOpportunitySourceMeta(value, t) {
  return getOpportunitySourcesMap(t).get(value) || { value, label: value || '-', color: '#94A3B8' }
}

export function getSignalTypeMeta(value, t) {
  return getOpportunitySignalTypesMap(t).get(value) || { value, label: value || '-' }
}

export function getDismissReasonLabel(value, t) {
  return getOpportunityDismissReasonsMap(t).get(value)?.label || value || '-'
}

export function getTimelineEventLabel(type, t) {
  return getOpportunityTimelineEventLabels(t)[type] || type || '-'
}

export function formatCurrency(value, currency = 'EGP', language) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '-'

  const locale = resolveLocale(language)

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`
  }
}

function parseDateValue(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(value, language) {
  const date = parseDateValue(value)
  if (!date) return '-'

  return new Intl.DateTimeFormat(resolveLocale(language), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatRelativeTime(value, nowTimestamp = Date.now(), language, t) {
  const date = parseDateValue(value)
  if (!date) return '-'

  const diffMs = nowTimestamp - date.getTime()
  if (diffMs < 0) {
    return formatDateTime(value, language)
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  if (diffMinutes < 1) return t('opportunities.relativeTime.now')
  if (diffMinutes < 60) return t('opportunities.relativeTime.minutesAgo', { count: diffMinutes })

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return t('opportunities.relativeTime.hoursAgo', { count: diffHours })

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return t('opportunities.relativeTime.daysAgo', { count: diffDays })

  const diffMonths = Math.floor(diffDays / 30)
  return t('opportunities.relativeTime.monthsAgo', { count: diffMonths })
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

export function getScoreComponents(score = {}, t) {
  return [
    { key: 'fit', label: t('opportunities.scoreComponents.fit'), value: Number(score.fit) || 0, max: 25 },
    { key: 'intent', label: t('opportunities.scoreComponents.intent'), value: Number(score.intent) || 0, max: 30 },
    { key: 'engagement', label: t('opportunities.scoreComponents.engagement'), value: Number(score.engagement) || 0, max: 25 },
    { key: 'timing', label: t('opportunities.scoreComponents.timing'), value: Number(score.timing) || 0, max: 20 },
  ]
}
