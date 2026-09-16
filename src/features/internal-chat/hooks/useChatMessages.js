import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { internalChatApi } from '../api/internalChatApi'
import { chatKeys } from '../constants/chatConstants'
import { extractMessagesList, normalizeMessage, sortMessagesAscending, upsertMessage } from '../utils/messageCacheHelpers'

export function useChatMessages(conversationId, params = { page: 1 }, options = {}) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId, params),
    queryFn: () => internalChatApi.getMessages(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    select: (response) => sortMessagesAscending(extractMessagesList(response).map(normalizeMessage)),
    ...options,
  })
}

export function useChatMessageMutations(conversationId, params = { page: 1 }) {
  const queryClient = useQueryClient()

  const appendPendingMessage = (payload) => {
    queryClient.setQueryData(chatKeys.messages(conversationId, params), (current = []) => {
      const draftMessage = {
        id: `temp-${crypto.randomUUID()}`,
        text: payload?.body || '',
        createdAt: new Date().toISOString(),
        attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
        direction: 'outgoing',
        is_pending: true,
        raw: {
          id: `temp-${crypto.randomUUID()}`,
          body: payload?.body || '',
          created_at: new Date().toISOString(),
        },
      }
      return [...(Array.isArray(current) ? current : []), draftMessage]
    })
  }

  const sendMessage = useMutation({
    mutationFn: (payload) => internalChatApi.sendMessage(conversationId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(conversationId, params) })
      appendPendingMessage(payload)
    },
    onSuccess: (response) => {
      const serverMessage = normalizeMessage(response?.data || response?.message || response)
      queryClient.setQueryData(chatKeys.messages(conversationId, params), (current = []) => {
        const base = (Array.isArray(current) ? current : []).filter((item) => !String(item?.id || '').startsWith('temp-'))
        return sortMessagesAscending(upsertMessage(base, serverMessage))
      })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId, params) })
    },
  })

  const markAsRead = useMutation({
    mutationFn: () => internalChatApi.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })

  return useMemo(() => ({ sendMessage, markAsRead }), [markAsRead, sendMessage])
}
