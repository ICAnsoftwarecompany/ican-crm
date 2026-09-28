// Field pickers shared by the channel adapters for the normalized Conversation.
// Precedence mirrors the existing code: unlinked filter (customer link), Messenger
// list sort (updatedAt), and the inbox filters (assigned user).

export function getUnreadCount(conversation = {}) {
  return Number(conversation?.unread_count || 0)
}

export function getUpdatedAt(conversation = {}) {
  return conversation?.last_message_at || conversation?.updated_at || conversation?.created_at || ''
}

export function getLinkedCustomerId(conversation = {}) {
  return String(conversation?.customer?.id || conversation?.customer_id || conversation?.customerId || '')
}

export function getLinkedLeadId(conversation = {}) {
  return String(conversation?.lead?.id || conversation?.lead_id || conversation?.leadId || '')
}

export function getConversationStatus(conversation = {}) {
  return String(conversation?.status || 'open').toLowerCase()
}

export function getAssignedUser(conversation = {}) {
  const user = conversation?.assigned_user || conversation?.assignedUser || null
  const id = String(user?.id || conversation?.assigned_user_id || '')
  const name = String(user?.name || conversation?.assigned_user_name || '')
  return id || name ? { id, name } : null
}

export function buildConversation(channel, conversation, {
  id,
  title,
  subtitle,
  contact,
  lastMessage,
}) {
  return {
    channel,
    id: String(id || ''),
    contact,
    title,
    subtitle,
    lastMessage,
    unreadCount: getUnreadCount(conversation),
    updatedAt: getUpdatedAt(conversation),
    status: getConversationStatus(conversation),
    linkedCustomerId: getLinkedCustomerId(conversation),
    linkedLeadId: getLinkedLeadId(conversation),
    assignedUser: getAssignedUser(conversation),
    raw: conversation,
  }
}
