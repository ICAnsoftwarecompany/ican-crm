import { resolveTenantFromHostname } from '../../../services/tenantResolver'

export const WHATSAPP_CONVERSATIONS_QUERY_KEY = (params) => ['integrations', 'whatsapp', 'conversations', params || {}]
export const WHATSAPP_CONVERSATION_INFO_QUERY_KEY = (conversationId) => [
  'integrations',
  'whatsapp',
  'conversations',
  String(conversationId || ''),
  'info',
]
export const WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY = (conversationId, params) => [
  'integrations',
  'whatsapp',
  'conversations',
  String(conversationId || ''),
  'messages',
  params || {},
]

function trimSlashes(value = '') {
  return String(value || '').trim().replace(/^\/+|\/+$/g, '')
}

function normalizeText(value = '') {
  return String(value || '').trim().toLowerCase()
}

function getMediaBaseUrl(path = '') {
  const rootDomain = trimSlashes(import.meta.env.VITE_API_ROOT_DOMAIN || '3s-export.com').replace(/^https?:\/\//i, '')
  const scheme = String(import.meta.env.VITE_API_SCHEME || 'https').replace(/:$/, '')
  const tenantFromHost = resolveTenantFromHostname(undefined, rootDomain)
  const tenantFromPath = String(path || '').split('/').filter(Boolean)[0] || ''
  const tenant = tenantFromHost || tenantFromPath

  if (!tenant || !rootDomain) return ''
  return `${scheme}://${tenant}.${rootDomain}`
}

export function resolveWhatsappMediaUrl(url = '') {
  const value = String(url || '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value)) return value

  const baseUrl = getMediaBaseUrl(value)
  return baseUrl ? `${baseUrl}/${trimSlashes(value)}` : value
}

export function extractWhatsappList(response) {
  const data = response?.data ?? response
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.conversations)) return data.conversations
  if (Array.isArray(data?.messages)) return data.messages
  if (Array.isArray(data?.data?.data)) return data.data.data
  return []
}

export function extractWhatsappEntity(response) {
  return response?.data?.data || response?.data || response || null
}

export function getWhatsappConversationId(conversation) {
  return conversation?.id || conversation?.conversation_id || conversation?.conversation?.id || ''
}

export function getWhatsappContactId(conversation) {
  return conversation?.contact?.id || conversation?.contact_id || conversation?.contactId || ''
}

export function getWhatsappConversationTitle(conversation) {
  const contactFullName = [
    conversation?.contact?.first_name,
    conversation?.contact?.last_name,
  ].filter(Boolean).join(' ').trim()

  return (
    conversation?.contact?.name ||
    contactFullName ||
    conversation?.customer?.name ||
    conversation?.lead?.name ||
    conversation?.name ||
    conversation?.contact?.phone ||
    conversation?.phone ||
    conversation?.to ||
    `WhatsApp #${getWhatsappConversationId(conversation)}`
  )
}

export function getWhatsappConversationContact(conversation) {
  return (
    conversation?.contact?.phone ||
    conversation?.customer?.phone ||
    conversation?.lead?.phone ||
    conversation?.phone ||
    conversation?.to ||
    conversation?.contact?.email ||
    conversation?.customer?.email ||
    ''
  )
}

function getMessageText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    return getMessageText(value.body) || getMessageText(value.text) || getMessageText(value.message) || ''
  }
  return String(value)
}

function getTypeLabel(type = '') {
  const value = normalizeText(type)
  if (value === 'image') return 'صورة'
  if (value === 'video') return 'فيديو'
  if (value === 'audio' || value === 'voice') return 'رسالة صوتية'
  if (value === 'file' || value === 'document') return 'ملف'
  return ''
}

export function getWhatsappConversationSubtitle(conversation) {
  const lastMessage = conversation?.last_message
  const text = getMessageText(lastMessage?.body || lastMessage?.text || lastMessage?.message || lastMessage?.snippet)
  if (text) return text
  return getTypeLabel(lastMessage?.type) || conversation?.contact?.phone || conversation?.customer?.phone || ''
}

export function getWhatsappMessageId(message) {
  return message?.id || message?.message_id || message?.whatsapp_message_id || `${message?.sent_at || message?.created_at}-${message?.body || ''}`
}

export function normalizeWhatsappAttachments(message = {}) {
  const attachments = Array.isArray(message?.attachments)
    ? message.attachments
    : Array.isArray(message?.files)
      ? message.files
      : []

  return attachments.map((attachment) => {
    const rawType = normalizeText(attachment?.type || attachment?.mime_type || message?.type)
    const mimeType = attachment?.mime_type || attachment?.mimeType || ''
    const type = rawType.includes('image')
      ? 'image'
      : rawType.includes('video')
        ? 'video'
        : rawType.includes('audio') || rawType === 'voice'
          ? 'audio'
          : 'file'

    return {
      ...attachment,
      type,
      mimeType,
      url: resolveWhatsappMediaUrl(attachment?.url || attachment?.path || attachment?.download_url),
      originalUrl: attachment?.url || attachment?.path || '',
      label: attachment?.name || attachment?.filename || mimeType || type,
      size: attachment?.size || 0,
    }
  })
}

export function normalizeWhatsappMessage(message = {}, conversationInfo = {}) {
  const phoneNumberId = conversationInfo?.phone_number_id || conversationInfo?.phoneNumberId
  const contactExternalId = conversationInfo?.contact?.external_id || conversationInfo?.contact?.phone
  const rawDirection = normalizeText(message?.direction)
  const direction = rawDirection === 'outbound' || rawDirection === 'outgoing' || (phoneNumberId && String(message?.from_id) === String(phoneNumberId))
    ? 'outgoing'
    : rawDirection === 'inbound' || rawDirection === 'incoming' || (contactExternalId && String(message?.from_id) === String(contactExternalId))
      ? 'incoming'
      : 'incoming'

  return {
    id: getWhatsappMessageId(message),
    text: getMessageText(message?.body || message?.text || message?.message || message?.caption),
    direction,
    status: message?.status || (direction === 'outgoing' ? 'sent' : 'received'),
    createdAt: message?.sent_at || message?.created_at || message?.received_at,
    attachments: normalizeWhatsappAttachments(message),
    reactions: Array.isArray(message?.reactions) ? message.reactions : [],
    replyToMessageId: message?.reply_to_message_id || message?.reply_to?.id || '',
    replyTo: message?.reply_to || message?.replyTo || null,
    raw: {
      ...message,
      id: message?.message_id || message?.whatsapp_message_id || message?.id,
      database_id: message?.id,
      contact_name: conversationInfo?.contact?.name || conversationInfo?.customer?.name || '',
      contact_phone: conversationInfo?.contact?.phone || conversationInfo?.customer?.phone || '',
    },
  }
}

export function sortWhatsappMessagesAscending(messages = []) {
  return [...messages].sort((first, second) => {
    const firstTime = new Date(first.createdAt || first.raw?.sent_at || first.raw?.created_at).getTime()
    const secondTime = new Date(second.createdAt || second.raw?.sent_at || second.raw?.created_at).getTime()
    return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime)
  })
}

export function upsertWhatsappMessage(messages = [], message) {
  const messageId = getWhatsappMessageId(message)
  const exists = messages.some((item) => String(getWhatsappMessageId(item)) === String(messageId))
  if (exists) {
    return messages.map((item) => (
      String(getWhatsappMessageId(item)) === String(messageId) ? { ...item, ...message } : item
    ))
  }
  return [...messages, message]
}

export function filterWhatsappConversations(conversations = [], query = '', filters = {}) {
  const normalizedQuery = normalizeText(query)

  return conversations.filter((conversation) => {
    if (filters.unreadOnly && Number(conversation.unread_count || 0) <= 0) return false
    if (filters.unlinkedOnly && (conversation.customer || conversation.customer_id || conversation.customerId)) return false
    if (filters.closedOnly && normalizeText(conversation.status) !== 'closed') return false

    if (filters.assignedUserId && filters.assignedUserId !== 'all') {
      const assignedId = String(conversation.assigned_user?.id || conversation.assigned_user_id || '')
      const assignedName = String(conversation.assigned_user?.name || '')
      if (filters.assignedUserId !== assignedId && filters.assignedUserId !== assignedName) return false
    }

    if (!normalizedQuery) return true

    const haystack = [
      getWhatsappConversationTitle(conversation),
      getWhatsappConversationContact(conversation),
      getWhatsappConversationSubtitle(conversation),
      conversation.assigned_user?.name,
    ].filter(Boolean).join(' ').toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}
