import { extractList } from '../../../shared/utils/apiResponse'

export function getUserId(user) {
  return user?.id ?? user?.user_id ?? user?.userId ?? null
}

export function getConversationId(conversation) {
  return conversation?.id ?? conversation?.conversation_id ?? conversation?.conversationId ?? null
}

export function getConversationUsers(conversation) {
  if (Array.isArray(conversation?.users)) return conversation.users
  if (Array.isArray(conversation?.members)) return conversation.members
  return []
}

export function getOtherParticipant(conversation, currentUserId) {
  const users = getConversationUsers(conversation)
  const normalizedCurrent = String(currentUserId || '')
  return users.find((user) => String(getUserId(user)) !== normalizedCurrent) || users[0] || null
}

export function getConversationDisplayInfo(conversation, currentUserId) {
  const type = String(conversation?.type || '').toLowerCase()
  if (type === 'direct') {
    const other = getOtherParticipant(conversation, currentUserId)
    return {
      name: other?.name || other?.username || other?.login || conversation?.name || 'Direct message',
      avatar: other?.avatar || other?.profile_image || conversation?.avatar || '',
      subtitle: other?.email || other?.username || other?.login || '',
    }
  }

  return {
    name: conversation?.display_name || conversation?.name || 'Group',
    avatar: conversation?.display_avatar || conversation?.avatar || '',
    subtitle: `${getConversationUsers(conversation).length || conversation?.users_count || 0} members`,
  }
}

function findConversationArray(value, depth = 0) {
  if (depth > 5 || value === null || value === undefined) return []
  if (Array.isArray(value)) {
    return value.some((item) => item && typeof item === 'object' && ('id' in item || 'type' in item || 'users' in item))
      ? value
      : []
  }
  if (typeof value !== 'object') return []

  for (const entry of Object.values(value)) {
    const nested = findConversationArray(entry, depth + 1)
    if (nested.length) return nested
  }

  return []
}

export function extractConversationsList(response) {
  const direct = extractList(response, ['chats', 'conversations', 'data'])
  if (direct.length) return direct
  return findConversationArray(response?.data ?? response)
}

export function normalizeConversation(conversation, currentUserId) {
  const display = getConversationDisplayInfo(conversation, currentUserId)
  return {
    ...conversation,
    id: getConversationId(conversation),
    display_name: display.name,
    display_avatar: display.avatar,
    display_subtitle: display.subtitle,
    unread_count: Number(conversation?.unread_count || 0),
    is_muted: Boolean(conversation?.is_muted),
    users_count: Number(conversation?.users_count || getConversationUsers(conversation).length || 0),
  }
}

export function getLastMessagePreview(conversation) {
  const last = conversation?.last_message
  if (!last) return 'No messages yet'
  if (typeof last === 'string') return last
  return last?.body || last?.text || last?.message || 'Message'
}
