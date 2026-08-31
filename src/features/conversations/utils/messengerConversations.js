import { resolveTenantFromHostname } from '../../../services/tenantResolver'

export const MESSENGER_CONVERSATIONS_QUERY_KEY = ['messenger', 'conversations']
export const MESSENGER_CONVERSATION_INFO_QUERY_KEY = (conversationId) => [
  'messenger',
  'conversation-info',
  String(conversationId || ''),
]
export const MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY = (conversationId) => [
  'messenger',
  'conversation-messages',
  String(conversationId || ''),
]

export function extractMessengerConversations(response) {
  const data = response?.data ?? response
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.conversations)) return data.conversations
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data?.data)) return data.data.data
  return []
}

export function extractMessengerMessages(response) {
  const data = response?.data ?? response
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.messages)) return data.messages
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data?.data)) return data.data.data
  return []
}

export function getMessengerConversationId(conversation) {
  return conversation?.id || conversation?.conversation_id || conversation?.conversation?.id || ''
}

export function getMessengerContactId(conversation) {
  return (
    conversation?.contact?.id ||
    conversation?.contact_id ||
    conversation?.contactId ||
    conversation?.conversation?.contact?.id ||
    conversation?.raw?.contact?.id ||
    ''
  )
}

export function getMessengerMessageId(message) {
  return message?.id || message?.message_id || `${message?.sent_at || message?.created_at}-${message?.body || message?.text || ''}`
}

export function getMessengerMessageText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)

  if (typeof value === 'object') {
    return (
      getMessengerMessageText(value.body) ||
      getMessengerMessageText(value.text) ||
      getMessengerMessageText(value.message) ||
      getMessengerMessageText(value.title) ||
      ''
    )
  }

  return String(value)
}

export function getMessengerConversationTitle(conversation) {
  const contactFullName = [
    conversation?.contact?.first_name,
    conversation?.contact?.last_name,
  ].filter(Boolean).join(' ').trim()

  return (
    conversation?.contact?.name ||
    contactFullName ||
    conversation?.contact?.first_name ||
    conversation?.customer?.name ||
    conversation?.customer_name ||
    conversation?.lead_name ||
    conversation?.name ||
    conversation?.contact?.username ||
    conversation?.contact?.phone ||
    conversation?.contact?.email ||
    conversation?.phone ||
    `Conversation #${getMessengerConversationId(conversation)}`
  )
}

export function getMessengerConversationSubtitle(conversation) {
  const lastMessage = conversation?.last_message
  const lastMessageText = getMessengerMessageText(lastMessage?.body || lastMessage?.text || lastMessage?.message)
  if (lastMessageText) return lastMessageText

  const lastMessageType = String(lastMessage?.type || '').toLowerCase()
  if (lastMessageType === 'image') return 'صورة'
  if (lastMessageType === 'video') return 'فيديو'
  if (lastMessageType === 'audio') return 'رسالة صوتية'
  if (lastMessageType === 'file') return 'ملف'

  const directMessageText = getMessengerMessageText(conversation?.message)
  if (directMessageText) return directMessageText

  return (
    conversation?.customer?.email ||
    conversation?.contact?.username ||
    ''
  )
}

function getMessengerMessageTypeLabel(type = '') {
  const normalizedType = String(type || '').toLowerCase()
  if (normalizedType === 'image') return '\u0635\u0648\u0631\u0629'
  if (normalizedType === 'video') return '\u0641\u064a\u062f\u064a\u0648'
  if (normalizedType === 'audio') return '\u0631\u0633\u0627\u0644\u0629 \u0635\u0648\u062a\u064a\u0629'
  if (normalizedType === 'file') return '\u0645\u0644\u0641'
  return ''
}

export function getMessengerLastCustomerMessagePreview(conversation) {
  const explicitMessage =
    conversation?.last_customer_message ||
    conversation?.last_inbound_message ||
    conversation?.customer_last_message ||
    null

  if (explicitMessage) {
    return (
      getMessengerMessageText(explicitMessage?.body || explicitMessage?.text || explicitMessage?.message) ||
      getMessengerMessageTypeLabel(explicitMessage?.type) ||
      ''
    )
  }

  const lastMessage = conversation?.last_message || null
  const lastDirection = String(lastMessage?.direction || '').toLowerCase()
  const isInbound = lastDirection === 'inbound' || lastDirection === 'incoming' || lastDirection === 'received'

  if (!lastMessage || !isInbound) return ''

  return (
    getMessengerMessageText(lastMessage?.body || lastMessage?.text || lastMessage?.message) ||
    getMessengerMessageTypeLabel(lastMessage?.type) ||
    ''
  )
}

export function getMessengerProfilePicture(conversation) {
  return (
    conversation?.contact?.profile_picture ||
    conversation?.profile_picture ||
    conversation?.customer?.profile_picture ||
    ''
  )
}

function trimSlashes(value = '') {
  return String(value || '').trim().replace(/^\/+|\/+$/g, '')
}

function getMessengerMediaBaseUrl(path = '') {
  const rootDomain = trimSlashes(import.meta.env.VITE_API_ROOT_DOMAIN || '3s-export.com').replace(/^https?:\/\//i, '')
  const scheme = String(import.meta.env.VITE_API_SCHEME || 'https').replace(/:$/, '')
  const tenantFromHost = resolveTenantFromHostname(undefined, rootDomain)
  const tenantFromPath = String(path || '').split('/').filter(Boolean)[0] || ''
  const tenant = tenantFromHost || tenantFromPath

  if (!tenant || !rootDomain) return ''
  return `${scheme}://${tenant}.${rootDomain}`
}

export function resolveMessengerMediaUrl(url = '') {
  const value = String(url || '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value)) return value

  const baseUrl = getMessengerMediaBaseUrl(value)
  if (!baseUrl) return value

  return `${baseUrl}/${trimSlashes(value)}`
}

export function normalizeMessengerAttachments(message = {}) {
  const attachments = Array.isArray(message?.attachments) ? message.attachments : []
  return attachments.map((attachment) => ({
    ...attachment,
    url: resolveMessengerMediaUrl(attachment?.url),
    originalUrl: attachment?.url || '',
    type: String(attachment?.type || message?.type || '').toLowerCase(),
    mimeType: attachment?.mime_type || attachment?.mimeType || '',
    size: attachment?.size || 0,
  }))
}

export function normalizeMessageDirection(messageDirection = '') {
  const direction = String(messageDirection || '').toLowerCase()
  if (direction === 'outbound') return 'outgoing'
  if (direction === 'inbound') return 'incoming'
  return direction || 'incoming'
}

export function isOutgoingMessage(message = {}) {
  const normalizedDirection = normalizeMessageDirection(message?.direction)
  const status = String(message?.status || '').toLowerCase()
  return normalizedDirection === 'outgoing' || status === 'sent' || status === 'read'
}

export function normalizeMessengerMessage(message, conversationInfo) {
  const pageId = conversationInfo?.page_id
  const contactId = conversationInfo?.contact?.external_id
  const direction = normalizeMessageDirection(message?.direction || (
    pageId && String(message?.from_id) === String(pageId)
      ? 'outgoing'
      : contactId && String(message?.from_id) === String(contactId)
        ? 'incoming'
        : 'incoming'
  ))

  return {
    id: getMessengerMessageId(message),
    text: getMessengerMessageText(message?.body || message?.text || message?.message),
    direction,
    status: message?.status || 'delivered',
    createdAt: message?.sent_at || message?.created_at,
    attachments: normalizeMessengerAttachments(message),
    reactions: Array.isArray(message?.reactions) ? message.reactions : [],
    replyToMessageId: message?.reply_to_message_id || message?.reply_to?.id || '',
    replyTo: message?.reply_to || message?.replyTo || null,
    raw: message,
  }
}

export function sortMessagesAscending(messages) {
  return [...messages].sort((first, second) => {
    const firstTime = new Date(first.createdAt || first.raw?.sent_at || first.raw?.created_at).getTime()
    const secondTime = new Date(second.createdAt || second.raw?.sent_at || second.raw?.created_at).getTime()
    return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime)
  })
}

export function upsertMessengerMessage(messages = [], message) {
  const messageId = getMessengerMessageId(message)
  const exists = messages.some((item) => String(getMessengerMessageId(item)) === String(messageId))

  if (exists) {
    return messages.map((item) => (
      String(getMessengerMessageId(item)) === String(messageId) ? { ...item, ...message } : item
    ))
  }

  return [...messages, message]
}

function getPayloadData(payload = {}) {
  return payload?.data && typeof payload.data === 'object' ? payload.data : payload
}

export function getMessengerRealtimeMessage(payload = {}) {
  const data = getPayloadData(payload)
  const candidates = [
    payload.message,
    data.message,
    payload.messenger_message,
    data.messenger_message,
    payload.messege,
    data.messege,
  ]

  return candidates.find((item) => item && typeof item === 'object' && (item.id || item.message_id || item.body || item.reactions)) || null
}

export function getMessengerRealtimeConversation(payload = {}) {
  const data = getPayloadData(payload)
  return payload.conversation || data.conversation || null
}

export function getMessengerRealtimeConversationId(payload = {}) {
  const data = getPayloadData(payload)
  const conversation = getMessengerRealtimeConversation(payload)
  return (
    payload.conversation_id ||
    data.conversation_id ||
    payload.conversationId ||
    data.conversationId ||
    conversation?.id ||
    ''
  )
}

export function getMessengerRealtimeReaction(payload = {}) {
  const data = getPayloadData(payload)
  return (
    payload.reaction ||
    data.reaction ||
    payload.message_reaction ||
    data.message_reaction ||
    payload.messenger_reaction ||
    data.messenger_reaction ||
    null
  )
}

export function getMessengerRealtimeReactionMessageId(payload = {}) {
  const data = getPayloadData(payload)
  const reaction = getMessengerRealtimeReaction(payload) || {}
  const message = getMessengerRealtimeMessage(payload) || {}

  return (
    payload.message_id ||
    data.message_id ||
    payload.messege_id ||
    data.messege_id ||
    payload.messenger_message_id ||
    data.messenger_message_id ||
    payload.messageId ||
    data.messageId ||
    reaction.message_id ||
    reaction.messege_id ||
    reaction.messageId ||
    reaction.messenger_message_id ||
    reaction.message?.id ||
    message.id ||
    message.message_id ||
    ''
  )
}

export function getMessengerRealtimeMessagePatch(payload = {}) {
  const data = getPayloadData(payload)
  const message = getMessengerRealtimeMessage(payload)

  if (message) return message

  const messageId = (
    payload.message_id ||
    data.message_id ||
    payload.messege_id ||
    data.messege_id ||
    payload.messenger_message_id ||
    data.messenger_message_id ||
    payload.messageId ||
    data.messageId ||
    payload.id ||
    data.id ||
    ''
  )

  const status = payload.status || data.status || payload.message_status || data.message_status || ''
  const hasPatchValue = Boolean(
    messageId &&
    (
      status ||
      payload.read_at ||
      data.read_at ||
      payload.seen_at ||
      data.seen_at ||
      payload.delivered_at ||
      data.delivered_at
    )
  )

  if (!hasPatchValue) return null

  return {
    id: messageId,
    message_id: messageId,
    status: status || undefined,
    read_at: payload.read_at || data.read_at || undefined,
    seen_at: payload.seen_at || data.seen_at || undefined,
    delivered_at: payload.delivered_at || data.delivered_at || undefined,
  }
}

function getMessengerMessageLookupIds(message = {}) {
  return [
    message.id,
    message.message_id,
    message.raw?.id,
    message.raw?.message_id,
  ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value))
}

function normalizeRealtimeReaction(reaction = {}) {
  if (!reaction || typeof reaction !== 'object') return null
  const emoji = reaction.emoji || reaction.reaction || reaction.value || ''
  const reactorId = reaction.reactor_id || reaction.reactorId || reaction.user_id || reaction.userId || reaction.actor_id || ''
  if (!emoji && !reactorId && !reaction.id) return null

  return {
    ...reaction,
    emoji,
    reactor_id: reactorId,
  }
}

export function isMessengerReactionRemovalEvent(eventName = '', payload = {}) {
  const normalizedEventName = String(eventName || '').toLowerCase()
  const data = getPayloadData(payload)
  const action = String(payload.action || data.action || '').toLowerCase()
  return (
    normalizedEventName.includes('deleted') ||
    normalizedEventName.includes('removed') ||
    action === 'delete' ||
    action === 'deleted' ||
    action === 'remove' ||
    action === 'removed'
  )
}

export function applyMessengerReactionToMessage(message = {}, payload = {}, eventName = '') {
  const targetMessageId = String(getMessengerRealtimeReactionMessageId(payload) || '')
  if (!targetMessageId) return { message, applied: false }

  const messageIds = getMessengerMessageLookupIds(message)
  if (!messageIds.includes(targetMessageId)) return { message, applied: false }

  const reaction = normalizeRealtimeReaction(getMessengerRealtimeReaction(payload))
  const shouldRemove = isMessengerReactionRemovalEvent(eventName, payload)
  const currentReactions = Array.isArray(message.reactions) ? message.reactions : []

  if (shouldRemove) {
    const nextReactions = currentReactions.filter((item) => {
      if (reaction?.id && item?.id) return String(item.id) !== String(reaction.id)
      if (reaction?.reactor_id && (item?.reactor_id || item?.reactorId)) {
        return String(item.reactor_id || item.reactorId) !== String(reaction.reactor_id)
      }
      if (reaction?.emoji || reaction?.reaction) {
        return String(item.emoji || item.reaction || '') !== String(reaction.emoji || reaction.reaction || '')
      }
      return false
    })
    return { message: { ...message, reactions: nextReactions }, applied: true }
  }

  if (!reaction) return { message, applied: false }

  const exists = currentReactions.some((item) => {
    if (reaction.id && item?.id) return String(item.id) === String(reaction.id)
    if (reaction.reactor_id && (item?.reactor_id || item?.reactorId)) {
      return String(item.reactor_id || item.reactorId) === String(reaction.reactor_id)
    }
    return false
  })

  const nextReactions = exists
    ? currentReactions.map((item) => {
        if (reaction.id && item?.id && String(item.id) === String(reaction.id)) return { ...item, ...reaction }
        if (reaction.reactor_id && (item?.reactor_id || item?.reactorId) && String(item.reactor_id || item.reactorId) === String(reaction.reactor_id)) {
          return { ...item, ...reaction }
        }
        return item
      })
    : [...currentReactions, reaction]

  return { message: { ...message, reactions: nextReactions }, applied: true }
}

export function applyMessengerReactionToMessages(messages = [], payload = {}, eventName = '') {
  let applied = false
  const nextMessages = messages.map((message) => {
    const result = applyMessengerReactionToMessage(message, payload, eventName)
    if (result.applied) applied = true
    return result.message
  })

  return { messages: nextMessages, applied }
}

export function applyMessengerReactionToCachedResponse(current, payload = {}, eventName = '') {
  const applyToList = (list) => applyMessengerReactionToMessages(list, payload, eventName)

  if (Array.isArray(current)) {
    const result = applyToList(current)
    return result.applied ? result.messages : current
  }

  if (Array.isArray(current?.data)) {
    const result = applyToList(current.data)
    return result.applied ? { ...current, data: result.messages } : current
  }

  if (Array.isArray(current?.messages)) {
    const result = applyToList(current.messages)
    return result.applied ? { ...current, messages: result.messages } : current
  }

  if (current?.data && typeof current.data === 'object' && Array.isArray(current.data.data)) {
    const result = applyToList(current.data.data)
    return result.applied
      ? {
          ...current,
          data: {
            ...current.data,
            data: result.messages,
          },
        }
      : current
  }

  return current
}

function applyMessengerMessagePatchToMessages(messages = [], patch = {}) {
  const patchIds = getMessengerMessageLookupIds(patch)
  if (!patchIds.length) return { messages, applied: false }

  let applied = false
  const nextMessages = messages.map((message) => {
    const messageIds = getMessengerMessageLookupIds(message)
    const matched = patchIds.some((id) => messageIds.includes(id))
    if (!matched) return message

    applied = true
    return {
      ...message,
      ...patch,
      reactions: Array.isArray(patch.reactions) ? patch.reactions : message.reactions,
      attachments: Array.isArray(patch.attachments) ? patch.attachments : message.attachments,
      reply_to: patch.reply_to ?? message.reply_to,
    }
  })

  return { messages: nextMessages, applied }
}

export function applyMessengerMessagePatchToCachedResponse(current, patch = {}) {
  const applyToList = (list) => applyMessengerMessagePatchToMessages(list, patch)

  if (Array.isArray(current)) {
    const result = applyToList(current)
    return result.applied ? result.messages : current
  }

  if (Array.isArray(current?.data)) {
    const result = applyToList(current.data)
    return result.applied ? { ...current, data: result.messages } : current
  }

  if (Array.isArray(current?.messages)) {
    const result = applyToList(current.messages)
    return result.applied ? { ...current, messages: result.messages } : current
  }

  if (current?.data && typeof current.data === 'object' && Array.isArray(current.data.data)) {
    const result = applyToList(current.data.data)
    return result.applied
      ? {
          ...current,
          data: {
            ...current.data,
            data: result.messages,
          },
        }
      : current
  }

  return current
}

export function mergeConversationPatch(conversation, patch) {
  if (!patch) return conversation
  return {
    ...conversation,
    ...patch,
    unread_count: patch.unread_count ?? conversation?.unread_count,
    last_message_at: patch.last_message_at ?? conversation?.last_message_at,
  }
}

function upsertMessengerConversationList(conversations = [], patch) {
  const conversationId = getMessengerConversationId(patch)
  if (!conversationId) return conversations

  const exists = conversations.some((item) => String(getMessengerConversationId(item)) === String(conversationId))
  const next = exists
    ? conversations.map((item) => (
        String(getMessengerConversationId(item)) === String(conversationId)
          ? mergeConversationPatch(item, patch)
          : item
      ))
    : [patch, ...conversations]

  return next.sort((first, second) => {
    const firstTime = new Date(first.last_message_at || first.updated_at || first.created_at).getTime()
    const secondTime = new Date(second.last_message_at || second.updated_at || second.created_at).getTime()
    return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
  })
}

export function upsertMessengerConversation(conversations = [], patch) {
  if (Array.isArray(conversations)) {
    return upsertMessengerConversationList(conversations, patch)
  }

  if (Array.isArray(conversations?.data)) {
    return {
      ...conversations,
      data: upsertMessengerConversationList(conversations.data, patch),
    }
  }

  if (Array.isArray(conversations?.conversations)) {
    return {
      ...conversations,
      conversations: upsertMessengerConversationList(conversations.conversations, patch),
    }
  }

  if (Array.isArray(conversations?.items)) {
    return {
      ...conversations,
      items: upsertMessengerConversationList(conversations.items, patch),
    }
  }

  if (conversations?.data && typeof conversations.data === 'object' && Array.isArray(conversations.data.data)) {
    return {
      ...conversations,
      data: {
        ...conversations.data,
        data: upsertMessengerConversationList(conversations.data.data, patch),
      },
    }
  }

  return conversations
}

export function getMessengerNotificationData(payload = {}) {
  return payload.data || payload.notification?.data || payload
}

export function isMessengerNotification(payload = {}) {
  const data = getMessengerNotificationData(payload)
  const type = String(payload.type || data.type || data.channel || data.source || '').toLowerCase()
  if (type.includes('whatsapp') || type.includes('gmail')) return false
  return (
    type.includes('messenger') ||
    Boolean(payload.conversation?.id || data.conversation?.id || payload.conversation_id || data.conversation_id)
  )
}

export function getMessengerNotificationTitle(payload = {}) {
  const data = getMessengerNotificationData(payload)
  const conversation = payload.conversation || data.conversation
  const displayName = conversation ? getMessengerConversationTitle(conversation) : ''
  return displayName ? `رسالة ماسنجر من ${displayName}` : data.title || payload.title || 'رسالة ماسنجر جديدة'
}

export function getMessengerNotificationDescription(payload = {}) {
  const data = getMessengerNotificationData(payload)
  return (
    data.body ||
    data.message?.body ||
    payload.message?.body ||
    data.conversation?.last_message?.body ||
    data.conversation?.last_message?.text ||
    data.lead_name ||
    ''
  )
}
