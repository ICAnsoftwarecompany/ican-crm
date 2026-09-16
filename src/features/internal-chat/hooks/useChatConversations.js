import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '../../../store/authStore'
import { internalChatApi } from '../api/internalChatApi'
import { chatKeys } from '../constants/chatConstants'
import { extractConversationsList, getConversationId, normalizeConversation } from '../utils/conversationHelpers'

export function useChatConversations(params = {}, options = {}) {
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?.id ?? currentUser?.user_id ?? currentUser?.userId

  return useQuery({
    queryKey: chatKeys.conversations(params),
    queryFn: () => internalChatApi.getConversations(params),
    select: (response) => extractConversationsList(response).map((item) => normalizeConversation(item, currentUserId)),
    ...options,
  })
}

export function useChatConversation(conversationId, params = {}, options = {}) {
  const query = useChatConversations(params, options)

  return {
    ...query,
    data: (query.data || []).find((conversation) => String(getConversationId(conversation)) === String(conversationId || '')) || null,
  }
}

export function useChatConversationMutations() {
  const queryClient = useQueryClient()

  const invalidateConversations = () => queryClient.invalidateQueries({ queryKey: chatKeys.all })

  return {
    createConversation: useMutation({
      mutationFn: internalChatApi.createConversation,
      onSuccess: invalidateConversations,
    }),
    markAsRead: useMutation({
      mutationFn: (conversationId) => internalChatApi.markAsRead(conversationId),
      onSuccess: invalidateConversations,
    }),
    muteConversation: useMutation({
      mutationFn: ({ conversationId, until }) => internalChatApi.muteConversation(conversationId, until),
      onSuccess: invalidateConversations,
    }),
    unmuteConversation: useMutation({
      mutationFn: (conversationId) => internalChatApi.unmuteConversation(conversationId),
      onSuccess: invalidateConversations,
    }),
  }
}
