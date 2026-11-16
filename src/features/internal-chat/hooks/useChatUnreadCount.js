import { useMemo } from 'react'
import { useChatConversations } from './useChatConversations'

export function useChatUnreadCount(params = {}, options = {}) {
  const conversationsQuery = useChatConversations(params, options)

  const unreadCount = useMemo(() => {
    const list = Array.isArray(conversationsQuery.data) ? conversationsQuery.data : []
    return list.reduce((total, item) => total + Number(item?.unread_count || 0), 0)
  }, [conversationsQuery.data])

  return {
    ...conversationsQuery,
    unreadCount,
  }
}
