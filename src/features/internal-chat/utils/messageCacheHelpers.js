import { resolveTenantFromHostname } from '../../../services/tenantResolver'

function getMessageId(message) {
  return message?.id ?? message?.message_id ?? message?.client_id ?? null
}

function trimSlashes(value = '') {
  return String(value || '').trim().replace(/^\/+|\/+$/g, '')
}

function getMediaBaseUrl(path = '') {
  const rootDomain = trimSlashes(import.meta.env.VITE_API_ROOT_DOMAIN || 'app.main.alameer-realestate.com').replace(/^https?:\/\//i, '')
  const scheme = String(import.meta.env.VITE_API_SCHEME || 'https').replace(/:$/, '')
  const tenantFromHost = resolveTenantFromHostname(undefined, rootDomain)
  const tenantFromPath = String(path || '').split('/').filter(Boolean)[0] || ''
  const tenant = tenantFromHost || tenantFromPath

  if (!tenant || !rootDomain) return ''
  return `${scheme}://${tenant}.${rootDomain}`
}

function resolveInternalChatMediaUrl(url = '') {
  const value = String(url || '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value)) return value

  const baseUrl = getMediaBaseUrl(value)
  return baseUrl ? `${baseUrl}/${trimSlashes(value)}` : value
}

function inferAttachmentType(rawType = '', mimeType = '') {
  const mime = String(mimeType || '').toLowerCase()
  const raw = String(rawType || '').toLowerCase()
  const combined = `${mime} ${raw}`.trim()

  if (combined.includes('image')) return 'image'
  if (combined.includes('video')) return 'video'
  if (combined.includes('audio') || combined.includes('voice')) return 'audio'
  return 'file'
}

function normalizeAttachments(message = {}) {
  const attachments = Array.isArray(message?.attachments)
    ? message.attachments
    : Array.isArray(message?.files)
      ? message.files
      : []

  return attachments.map((attachment) => {
    const mimeType = attachment?.media_mime_type || attachment?.mime_type || attachment?.mimeType || ''
    const rawType = attachment?.type || message?.type || mimeType
    const rawPath = attachment?.url || attachment?.media_path || attachment?.path || attachment?.download_url || ''

    return {
      ...attachment,
      type: inferAttachmentType(rawType, mimeType),
      mimeType,
      url: resolveInternalChatMediaUrl(rawPath),
      originalUrl: rawPath,
      label: attachment?.file_name || attachment?.name || attachment?.filename || mimeType || 'attachment',
      size: attachment?.size || attachment?.file_size || 0,
    }
  })
}

export function extractMessagesList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.messages)) return response.messages
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

export function normalizeMessage(message) {
  return {
    ...message,
    id: getMessageId(message),
    text: message?.body || message?.text || message?.message || '',
    createdAt: message?.created_at || message?.createdAt || message?.sent_at || '',
    attachments: normalizeAttachments(message),
    raw: message,
  }
}

export function sortMessagesAscending(messages = []) {
  return [...messages].sort((a, b) => {
    const first = new Date(a?.createdAt || a?.raw?.created_at || 0).getTime()
    const second = new Date(b?.createdAt || b?.raw?.created_at || 0).getTime()
    return first - second
  })
}

export function upsertMessage(existing = [], incoming) {
  const incomingId = String(getMessageId(incoming) || '')
  if (!incomingId) return [...existing, incoming]

  const index = existing.findIndex((item) => String(getMessageId(item) || '') === incomingId)
  if (index === -1) return [...existing, incoming]

  const next = [...existing]
  next[index] = { ...next[index], ...incoming }
  return next
}
