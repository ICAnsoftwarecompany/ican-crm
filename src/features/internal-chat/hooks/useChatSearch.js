import { useMemo } from 'react'

import { useChatConversations } from './useChatConversations'
import { getLastMessagePreview } from '../utils/conversationHelpers'

export function useChatSearch(query) {
  const conversationsQuery = useChatConversations({ per_page: 50 })
  const normalizedQuery = String(query || '').trim().toLowerCase()

  const results = useMemo(() => {
    const list = Array.isArray(conversationsQuery.data) ? conversationsQuery.data : []
    if (!normalizedQuery) return list

    return list.filter((conversation) => {
      const candidate = [
        conversation?.display_name,
        conversation?.name,
        getLastMessagePreview(conversation),
      ].filter(Boolean).join(' ').toLowerCase()

      return candidate.includes(normalizedQuery)
    })
  }, [conversationsQuery.data, normalizedQuery])

  return {
    ...conversationsQuery,
    data: results,
  }
}
