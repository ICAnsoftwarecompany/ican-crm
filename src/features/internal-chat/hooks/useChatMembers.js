import { useMemo } from 'react'

import { useChatConversation } from './useChatConversations'

export function useChatMembers(conversationId) {
  const conversationQuery = useChatConversation(conversationId)

  const members = useMemo(() => {
    const conversation = conversationQuery.data
    if (!conversation) return []

    if (Array.isArray(conversation.users)) return conversation.users
    if (Array.isArray(conversation.members)) return conversation.members
    return []
  }, [conversationQuery.data])

  return {
    ...conversationQuery,
    data: members,
  }
}
