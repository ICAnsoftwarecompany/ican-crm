import { useCallback, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatKeys, internalChatApi, useChatConversations } from '../../internal-chat'
import { getChannelAdapter } from '../../conversations'
import { buildDealContactIndex, isDealContactIndexEmpty, matchesDealContact } from '../utils/dealConversations'
import { filterDealGroups, makeDealGroupFilter, nextDealGroupName } from '../utils/dealGroups'

const CHAT_PARAMS = { per_page: 100 }

/**
 * Internal chat groups of a deal (2026-10-16): the groups named "<deal name> G<n>" (utils/dealGroups), the filter
 * for the chat lists, the next name, and `create(userIds)` → `POST /chat { type: 'group', name, user_ids }`.
 */
export function useDealGroups(dealName = '') {
  const client = useQueryClient()
  const chatsQuery = useChatConversations(CHAT_PARAMS)
  const chats = useMemo(() => (Array.isArray(chatsQuery.data) ? chatsQuery.data : []), [chatsQuery.data])
  const groups = useMemo(() => filterDealGroups(chats, dealName), [chats, dealName])
  const filter = useMemo(() => makeDealGroupFilter(dealName), [dealName])
  const nextName = nextDealGroupName(dealName, chats)
  const create = useMutation({
    mutationFn: ({ name, userIds }) => internalChatApi.createConversation({ type: 'group', name, user_ids: userIds }),
    onSuccess: () => client.invalidateQueries({ queryKey: chatKeys.all }),
  })
  return {
    groups,
    filter,
    nextName,
    unread: groups.reduce((sum, group) => sum + Number(group.unread_count || 0), 0),
    isLoading: chatsQuery.isLoading,
    error: chatsQuery.error,
    refetch: chatsQuery.refetch,
    create,
  }
}

/**
 * Filter for customer conversations of any channel: `(raw, channel) => boolean`, true when the conversation's linked
 * lead / customer, phone or email is one of the deal's leads (utils/dealConversations).
 */
export function useDealConversationFilter(leads = []) {
  const index = useMemo(() => buildDealContactIndex(leads), [leads])
  const filter = useCallback((raw, channel) => {
    try {
      return matchesDealContact(getChannelAdapter(channel).normalizeConversation(raw), index)
    } catch {
      return false
    }
  }, [index])
  return { filter, isEmpty: isDealContactIndexEmpty(index), contacts: leads.length }
}
