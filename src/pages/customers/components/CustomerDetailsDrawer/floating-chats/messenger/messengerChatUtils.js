import {
  getMessengerMessageId,
  getMessengerMessageText,
  normalizeMessengerAttachments,
} from '../../../../../../features/conversations/utils/messengerConversations'

export function getLeadId(customer) {
  return customer?.lead?.id || customer?.lead_id || customer?.id
}

export function getConversationFromResponse(response) {
  const data = response?.data ?? response
  return data?.conversation || data?.data?.conversation || null
}

export function getConversationInfoFromResponse(response) {
  return response?.data?.data || response?.data || response || null
}

export function getMessagesFromResponse(response) {
  const data = response?.data ?? response
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.messages)) return data.messages
  if (Array.isArray(data?.items)) return data.items
  return []
}

export function getMetaFromResponse(response) {
  const data = response?.data ?? response
  return data?.meta || data?.data?.meta || {}
}

function normalizeMessageDirection(messageDirection = '') {
  const direction = String(messageDirection || '').toLowerCase()
  if (direction === 'outbound') return 'outgoing'
  if (direction === 'inbound') return 'incoming'
  return direction || 'incoming'
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
