import { getActivityTypeConfig } from '../config/activityTypes'

function getSafeData(activity) {
  if (!activity?.data || typeof activity.data !== 'object' || Array.isArray(activity.data)) return {}
  return { ...activity.data }
}

function normalizeProducts(payload = {}) {
  const products = Array.isArray(payload.products) ? payload.products : []
  return products.map((product, index) => ({
    id: product?.id || `${product?.product_id || index}`,
    productId: product?.product_id ?? product?.id ?? '',
    interestLevel: String(product?.interest_level || '').trim().toLowerCase(),
    note: String(product?.note || product?.notes || '').trim(),
    name: product?.name || '',
  }))
}

function getValidUser(candidate) {
  if (!candidate || typeof candidate !== 'object') return null

  const name = String(candidate?.name || candidate?.username || '').trim()
  const id = candidate?.id ?? ''

  if (!name && (id === '' || id === null || id === undefined)) return null

  return {
    ...candidate,
    name: name || String(id || '').trim() || '',
  }
}

function resolveActivityUser(log, activity) {
  const candidates = [
    activity?.user,
    activity?.created_by,
    activity?.actor,
    log?.user,
    log?.created_by,
    log?.actor,
  ]

  for (const candidate of candidates) {
    const user = getValidUser(candidate)
    if (user) return user
  }

  return null
}

function normalizeSingleActivity({ log, activity, index }) {
  const type = String(activity?.type || log?.type || '').trim().toLowerCase() || 'unknown'
  const config = getActivityTypeConfig(type)
  const data = getSafeData(activity)
  const date = activity?.activity_at || activity?.created_at || log?.activity_at || log?.created_at || null
  const user = resolveActivityUser(log, activity)
  const products = normalizeProducts(data)

  const fallbackId = `${log?.id || 'log'}-${activity?.id || index}-${type}`

  return {
    id: activity?.id || fallbackId,
    logId: log?.id ?? null,
    type,
    category: config.category || 'other',
    importance: config.importance || null,
    title: String(activity?.title || config.label || 'نشاط').trim(),
    description: String(activity?.description || '').trim(),
    date,
    user: user && typeof user === 'object' ? { ...user } : null,
    userName: String(user?.name || '').trim() || '-',
    oldStatus: log?.old_status_title ?? activity?.old_status_title ?? null,
    newStatus: log?.new_status_title ?? activity?.new_status_title ?? null,
    oldStatusId: log?.old_status_id ?? activity?.old_status_id ?? null,
    newStatusId: log?.new_status_id ?? activity?.new_status_id ?? null,
    responseTimeSeconds: log?.response_time_seconds ?? null,
    source: data?.source || activity?.source || log?.source || null,
    action: log?.action || activity?.action || null,
    noteText: String(data?.note || activity?.note || activity?.description || '').trim(),
    products,
    data,
    raw: {
      log,
      activity,
    },
  }
}

export function normalizeCustomerActivities(logs = []) {
  if (!Array.isArray(logs)) return []

  const normalized = logs.flatMap((log, logIndex) => {
    if (!log || typeof log !== 'object') return []

    const nestedActivities = Array.isArray(log.activities)
      ? log.activities
      : []

    if (nestedActivities.length === 0) {
      return [normalizeSingleActivity({
        log,
        activity: log,
        index: logIndex,
      })]
    }

    return nestedActivities.map((activity, activityIndex) => normalizeSingleActivity({
      log,
      activity,
      index: activityIndex,
    }))
  })

  return normalized.sort((a, b) => {
    const first = new Date(a?.date || 0).getTime()
    const second = new Date(b?.date || 0).getTime()
    return (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first)
  })
}
