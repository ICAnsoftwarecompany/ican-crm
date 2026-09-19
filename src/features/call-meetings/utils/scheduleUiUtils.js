import { toast } from 'sonner'

export function fieldValue(value, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

export function formatDateTime12(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fieldValue(value)

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTimeForApi(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatElapsedDuration(diffMs, { includeSeconds = false } = {}, t) {
  const totalSeconds = Math.max(0, Math.floor(Number(diffMs || 0) / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []

  if (!t) {
    if (days) parts.push(`${days} يوم`)
    if (days || hours) parts.push(`${hours} ساعة`)
    if (days || hours || minutes) parts.push(`${minutes} دقيقة`)
    if (includeSeconds || !parts.length) parts.push(`${seconds} ثانية`)
    return parts.join(' و ')
  }

  if (days) parts.push(t('activities.duration.day', { count: days }))
  if (days || hours) parts.push(t('activities.duration.hour', { count: hours }))
  if (days || hours || minutes) parts.push(t('activities.duration.minute', { count: minutes }))
  if (includeSeconds || !parts.length) parts.push(t('activities.duration.second', { count: seconds }))

  return parts.join(t('activities.duration.and'))
}

export function formatElapsedSince(value, nowTimestamp = Date.now(), options, t) {
  if (!value) return ''
  const startedAt = new Date(value).getTime()
  if (Number.isNaN(startedAt) || nowTimestamp < startedAt) return ''
  return formatElapsedDuration(nowTimestamp - startedAt, options, t)
}

export function buildScheduleStatusPayload(status, now = new Date()) {
  const normalizedStatus = String(status || '').trim()
  const currentDateTime = formatDateTimeForApi(now)

  if (normalizedStatus === 'in_progress' || normalizedStatus === 'cancelled') {
    return {
      status: normalizedStatus,
      actual_start_at: currentDateTime,
    }
  }

  if (normalizedStatus === 'completed') {
    return {
      status: normalizedStatus,
      actual_end_at: currentDateTime,
    }
  }

  return {
    status: normalizedStatus,
  }
}

export function getScheduleLeadId(schedule, fallbackCustomer) {
  return (
    schedule?.taskable_id ||
    schedule?.taskable?.id ||
    schedule?.lead_id ||
    schedule?.lead?.id ||
    schedule?.customer?.lead_id ||
    fallbackCustomer?.lead_id ||
    fallbackCustomer?.lead?.id ||
    fallbackCustomer?.id ||
    ''
  )
}

export function buildAfterMeetingReportUrl(schedule, fallbackCustomer) {
  const leadId = getScheduleLeadId(schedule, fallbackCustomer)
  const meetingId = schedule?.id || ''
  if (!leadId || !meetingId) return ''

  const type = String(schedule?.type || '').trim().toLowerCase()
  const tab = type === 'call' ? 'calls' : 'meetings'
  return `/lead/${leadId}?tab=${tab}&afterMeetingReport=1&meetingId=${meetingId}`
}

export function getCustomerPhone(customer) {
  return customer?.phone || customer?.lead?.phone || ''
}

export function normalizePhoneForUrl(phone) {
  return String(phone || '').replace(/[^\d+]/g, '')
}

export function openExternalAction(url, missingMessage) {
  if (!url) {
    toast.info(missingMessage)
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

export function notifySoon(label, t) {
  toast.info(label, {
    description: t ? t('callMeetings.selectionReadyDescription') : 'تم تجهيز الاختيار، ويمكن ربطه لاحقا بتكامل مباشر.',
    duration: 2800,
  })
}
