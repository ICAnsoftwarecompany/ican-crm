// Channel-agnostic helpers. Each one reproduces the per-channel versions in
// utils/{whatsapp,messenger,gmail}Conversations.js exactly, with the differences
// passed in as parameters (equivalence is covered by conversationHelpers.test.js).

function normalizeText(value = '') {
  return String(value || '').trim().toLowerCase()
}

function getMessageTime(message, rawTimeFields) {
  let value = message.createdAt
  for (const field of rawTimeFields) {
    value = value || message.raw?.[field]
  }
  return new Date(value).getTime()
}

/**
 * Sort normalized messages oldest first.
 * @param {Array} messages
 * @param {string[]} rawTimeFields  `raw` fields tried after `createdAt`
 *   (WhatsApp/Messenger: sent_at, created_at; Gmail: received_at, created_at).
 */
export function sortMessagesByTime(messages = [], rawTimeFields = ['sent_at', 'created_at']) {
  return [...messages].sort((first, second) => {
    const firstTime = getMessageTime(first, rawTimeFields)
    const secondTime = getMessageTime(second, rawTimeFields)
    return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime)
  })
}

/** Replace the message with the same id (shallow merge) or append it. */
export function upsertMessageById(messages = [], message, getId) {
  const messageId = getId(message)
  const exists = messages.some((item) => String(getId(item)) === String(messageId))
  if (exists) {
    return messages.map((item) => (
      String(getId(item)) === String(messageId) ? { ...item, ...message } : item
    ))
  }
  return [...messages, message]
}

function defaultIsLinked(conversation) {
  return Boolean(conversation.customer || conversation.customer_id || conversation.customerId)
}

function defaultIsClosed(conversation) {
  return normalizeText(conversation.status) === 'closed'
}

function defaultGetAssignedUser(conversation) {
  return {
    id: String(conversation.assigned_user?.id || conversation.assigned_user_id || ''),
    name: String(conversation.assigned_user?.name || ''),
  }
}

/**
 * Filter raw conversations by the shared inbox filters and a text query.
 * @param {Array} conversations
 * @param {string} query
 * @param {{ unreadOnly?: boolean, unlinkedOnly?: boolean, closedOnly?: boolean, assignedUserId?: string }} filters
 * @param {Object} options
 * @param {(conversation: Object, normalizedQuery: string) => boolean} options.matchesQuery  Channel search.
 * @param {(conversation: Object) => boolean} [options.isLinked]
 * @param {(conversation: Object) => boolean} [options.isClosed]
 * @param {(conversation: Object) => { id: string, name: string }} [options.getAssignedUser]
 */
export function filterConversations(conversations = [], query = '', filters = {}, {
  matchesQuery,
  isLinked = defaultIsLinked,
  isClosed = defaultIsClosed,
  getAssignedUser = defaultGetAssignedUser,
} = {}) {
  const normalizedQuery = normalizeText(query)

  return conversations.filter((conversation) => {
    if (filters.unreadOnly && Number(conversation.unread_count || 0) <= 0) return false
    if (filters.unlinkedOnly && isLinked(conversation)) return false
    if (filters.closedOnly && !isClosed(conversation)) return false

    if (filters.assignedUserId && filters.assignedUserId !== 'all') {
      const assignedUser = getAssignedUser(conversation)
      if (filters.assignedUserId !== assignedUser.id && filters.assignedUserId !== assignedUser.name) return false
    }

    if (!normalizedQuery) return true
    return matchesQuery(conversation, normalizedQuery)
  })
}
