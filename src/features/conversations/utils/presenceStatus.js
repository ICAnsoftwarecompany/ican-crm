function normalizeText(value = '') {
  return String(value || '').trim().toLowerCase()
}

function normalizePhone(value = '') {
  return String(value || '').replace(/[^\d+]/g, '')
}

function normalizeDate(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
}

function normalizePresenceFlag(value) {
  if (typeof value === 'boolean') return value
  const text = normalizeText(value)
  if (!text) return null
  if (['online', 'active', 'connected', 'joined', 'available'].includes(text)) return true
  if (['offline', 'inactive', 'disconnected', 'left', 'logout', 'signed_out'].includes(text)) return false
  return null
}

function isPresenceFresh(lastSeenAt) {
  if (!lastSeenAt) return false
  const parsed = new Date(lastSeenAt)
  if (Number.isNaN(parsed.getTime())) return false
  return (Date.now() - parsed.getTime()) <= 120000
}

function getEntityTokens(entity = {}) {
  const rawTokens = [
    entity?.id,
    entity?.user_id,
    entity?.userId,
    entity?.contact_id,
    entity?.contactId,
    entity?.customer_id,
    entity?.customerId,
    entity?.lead_id,
    entity?.leadId,
    entity?.external_id,
    entity?.externalId,
    entity?.username,
    entity?.login,
    entity?.email,
    entity?.phone,
    entity?.mobile,
    entity?.wa_id,
  ].filter((item) => item !== null && item !== undefined && String(item || '').trim() !== '')

  const tokens = new Set()

  rawTokens.forEach((rawValue) => {
    const text = String(rawValue).trim()
    if (!text) return

    tokens.add(normalizeText(text))

    if (text.includes('@')) {
      tokens.add(`email:${normalizeText(text)}`)
    }

    if (/^\+?[\d\s()-]+$/.test(text)) {
      tokens.add(`phone:${normalizePhone(text)}`)
    }
  })

  return Array.from(tokens)
}

function getPresenceRecord(entity = {}) {
  const status = normalizePresenceFlag(
    entity?.is_online ?? entity?.online ?? entity?.status ?? entity?.presence_status ?? entity?.state
  )

  return {
    isOnline: status,
    lastSeenAt: normalizeDate(entity?.last_seen_at ?? entity?.lastSeenAt ?? entity?.last_seen),
  }
}

function mergePresenceRecord(current = null, next = null) {
  if (!next) return current
  if (!current) return next

  return {
    isOnline: typeof next.isOnline === 'boolean' ? next.isOnline : current.isOnline,
    lastSeenAt: next.lastSeenAt || current.lastSeenAt,
  }
}

export function buildPresenceIndex(users = [], onlineUsers = []) {
  const index = new Map()

  const append = (entity = {}) => {
    const tokens = getEntityTokens(entity)
    if (!tokens.length) return

    const record = getPresenceRecord(entity)
    tokens.forEach((token) => {
      const current = index.get(token) || null
      index.set(token, mergePresenceRecord(current, record))
    })
  }

  users.forEach(append)
  onlineUsers.forEach((user) => {
    append({ ...user, is_online: true })
  })

  return index
}

export function getPresenceForEntity(entity = null, presenceIndex = new Map()) {
  if (!entity || typeof entity !== 'object' || !(presenceIndex instanceof Map)) return null

  const tokens = getEntityTokens(entity)
  if (!tokens.length) return null

  let resolved = null
  tokens.forEach((token) => {
    const candidate = presenceIndex.get(token)
    if (!candidate) return
    resolved = mergePresenceRecord(resolved, candidate)
  })

  if (!resolved) return null

  const rawStatus = typeof resolved.isOnline === 'boolean' ? resolved.isOnline : false
  const isOnline = rawStatus && (resolved.lastSeenAt ? isPresenceFresh(resolved.lastSeenAt) : true)

  return {
    isOnline,
    lastSeenAt: resolved.lastSeenAt || '',
  }
}

export function mergeUsersWithPresence(conversationUsers = [], presenceIndex = new Map()) {
  const list = Array.isArray(conversationUsers) ? conversationUsers : []
  return list.map((user) => {
    const presence = getPresenceForEntity(user, presenceIndex)
    if (!presence) return user

    return {
      ...user,
      is_online: presence.isOnline,
      last_seen_at: presence.lastSeenAt || user?.last_seen_at || '',
    }
  })
}

export function formatLastSeen(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
}
