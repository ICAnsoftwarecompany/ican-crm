export const GMAIL_CONVERSATIONS_QUERY_KEY = (params) => ['gmail', 'conversations', params || {}]
export const GMAIL_CONVERSATION_INFO_QUERY_KEY = (conversationId) => [
  'gmail',
  'conversation-info',
  String(conversationId || ''),
]
export const GMAIL_CONVERSATION_MESSAGES_QUERY_KEY = (conversationId, params) => [
  'gmail',
  'conversation-messages',
  String(conversationId || ''),
  params || {},
]
export const GMAIL_CUSTOMER_CONVERSATION_QUERY_KEY = (customerId, params) => [
  'gmail',
  'customer-conversation',
  String(customerId || ''),
  params || {},
]
export const GMAIL_LEAD_CONVERSATION_QUERY_KEY = (leadId, params) => [
  'gmail',
  'lead-conversation',
  String(leadId || ''),
  params || {},
]
export const GMAIL_MAILBOXES_QUERY_KEY = (params) => ['gmail', 'mailboxes', params || {}]
export const GMAIL_BUSINESS_EMAILS_QUERY_KEY = (params) => ['gmail', 'business-emails', params || {}]

export function extractGmailList(response) {
  const data = response?.data ?? response
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.conversations)) return data.conversations
  if (Array.isArray(data?.messages)) return data.messages
  if (Array.isArray(data?.mailboxes)) return data.mailboxes
  if (Array.isArray(data?.data?.data)) return data.data.data
  return []
}

export function extractGmailEntity(response) {
  return response?.data?.data || response?.data || response || null
}

export function extractGmailConversations(response) {
  return extractGmailList(response)
}

export function extractGmailMessages(response) {
  return extractGmailList(response)
}

export function extractGmailMailboxes(response) {
  return extractGmailList(response)
}

export function extractGmailBusinessEmails(response) {
  return extractGmailList(response)
}

export function getGmailConversationId(conversation) {
  return conversation?.id || conversation?.conversation_id || conversation?.conversation?.id || ''
}

export function getGmailConversationTitle(conversation) {
  return (
    conversation?.subject ||
    conversation?.title ||
    conversation?.customer?.name ||
    conversation?.lead?.name ||
    conversation?.from_email ||
    conversation?.to_email ||
    conversation?.mailbox_email ||
    `Gmail Conversation #${getGmailConversationId(conversation)}`
  )
}

export function getGmailConversationSubtitle(conversation) {
  return (
    conversation?.last_message?.snippet ||
    conversation?.snippet ||
    conversation?.participant_email ||
    conversation?.mailbox_email ||
    ''
  )
}

export function getGmailConversationContact(conversation) {
  return (
    conversation?.participant_email ||
    conversation?.participant_name ||
    conversation?.customer?.email ||
    conversation?.customer?.phone ||
    conversation?.mailbox_email ||
    ''
  )
}

export function getGmailParticipantEmail(conversation, messages = []) {
  const mailboxEmail = String(conversation?.mailbox_email || '').toLowerCase()
  const explicit = conversation?.participant_email || conversation?.customer?.email || ''
  if (explicit) return explicit

  const received = messages.find((message) => String(message?.direction || '').toLowerCase() === 'received')
  if (received?.from_address) return received.from_address

  const candidates = [
    conversation?.last_message?.from_address,
    conversation?.from_address,
    conversation?.to_addresses,
  ].filter(Boolean)

  return candidates.find((email) => String(email).toLowerCase() !== mailboxEmail) || ''
}

function getGmailMessageText(message = {}) {
  return (
    message.body_text ||
    message.snippet ||
    message.body ||
    message.text ||
    ''
  )
}

function normalizeGmailAttachment(attachment = {}, message = {}) {
  const type = String(attachment.type || attachment.mime_type || attachment.mimeType || '').toLowerCase()
  return {
    ...attachment,
    type: type.includes('image')
      ? 'image'
      : type.includes('video')
        ? 'video'
        : type.includes('audio')
          ? 'audio'
          : 'file',
    mimeType: attachment.mime_type || attachment.mimeType || '',
    url: attachment.url || attachment.download_url || attachment.path || '',
    label: attachment.name || attachment.filename || attachment.mime_type || message.subject || 'attachment',
    size: attachment.size || 0,
  }
}

export function normalizeGmailMessage(message = {}, conversationInfo = {}) {
  const direction = String(message.direction || '').toLowerCase()
  const isSent = direction === 'sent' || direction === 'outbound' || direction === 'outgoing'

  return {
    id: message.id || message.gmail_message_id || `${message.created_at || message.received_at}-${message.snippet || ''}`,
    text: getGmailMessageText(message),
    direction: isSent ? 'outgoing' : 'incoming',
    status: message.is_read ? 'read' : isSent ? 'sent' : 'received',
    createdAt: message.received_at || message.created_at,
    attachments: Array.isArray(message.attachments)
      ? message.attachments.map((attachment) => normalizeGmailAttachment(attachment, message))
      : [],
    reactions: [],
    raw: {
      ...message,
      contact_name: message.from_name || conversationInfo?.participant_name || conversationInfo?.customer?.name || '',
      contact_email: message.from_address || conversationInfo?.participant_email || '',
      body: getGmailMessageText(message),
      sent_at: message.received_at || message.created_at,
      sent_by: message.sent_by,
    },
  }
}

export function sortGmailMessagesAscending(messages = []) {
  return [...messages].sort((first, second) => {
    const firstTime = new Date(first.createdAt || first.raw?.received_at || first.raw?.created_at).getTime()
    const secondTime = new Date(second.createdAt || second.raw?.received_at || second.raw?.created_at).getTime()
    return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime)
  })
}

export function filterGmailConversations(conversations = [], query = '', filters = {}) {
  const normalizedQuery = String(query || '').trim().toLowerCase()

  return conversations.filter((conversation) => {
    if (filters.unreadOnly && Number(conversation.unread_count || 0) <= 0) return false
    if (filters.unlinkedOnly && (conversation.customer || conversation.customer_id || conversation.customerId)) return false
    if (filters.closedOnly && String(conversation.status || '').toLowerCase() !== 'closed') return false

    if (filters.assignedUserId && filters.assignedUserId !== 'all') {
      const assignedId = String(conversation.assigned_user?.id || conversation.assigned_user_id || '')
      const assignedName = String(conversation.assigned_user?.name || '')
      if (filters.assignedUserId !== assignedId && filters.assignedUserId !== assignedName) return false
    }

    if (!normalizedQuery) return true

    const haystack = [
      conversation.subject,
      conversation.mailbox_email,
      conversation.participant_email,
      conversation.participant_name,
      conversation.customer?.name,
      conversation.customer?.email,
      conversation.assigned_user?.name,
      conversation.last_message?.snippet,
    ].filter(Boolean).join(' ').toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}
