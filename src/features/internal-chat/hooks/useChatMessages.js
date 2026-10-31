import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { internalChatApi } from '../api/internalChatApi'
import { chatKeys } from '../constants/chatConstants'
import { extractMessagesList, normalizeMessage, sortMessagesAscending, upsertMessage } from '../utils/messageCacheHelpers'

function createTempMessageId() {
  const randomUUID = globalThis?.crypto?.randomUUID
  if (typeof randomUUID === 'function') return `temp-${randomUUID.call(globalThis.crypto)}`

  // Browser-compatible fallback when randomUUID is not available.
  const random = Math.random().toString(36).slice(2, 10)
  return `temp-${Date.now().toString(36)}-${random}`
}

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
  const messagesKey = chatKeys.messages(conversationId, params)

  const appendPendingMessage = (payload) => {
    const tempId = createTempMessageId()
    queryClient.setQueryData(messagesKey, (current = []) => {
      const draftMessage = {
        id: tempId,
        text: payload?.body || '',
        createdAt: new Date().toISOString(),
        attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
        direction: 'outgoing',
        is_pending: true,
        raw: {
          id: tempId,
          body: payload?.body || '',
          created_at: new Date().toISOString(),
        },
      }
      return [...(Array.isArray(current) ? current : []), draftMessage]
    })
    return tempId
  }

  const sendMessage = useMutation({
    mutationFn: (payload) => internalChatApi.sendMessage(conversationId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: messagesKey })
      const previousMessages = queryClient.getQueryData(messagesKey)
      const tempId = appendPendingMessage(payload)
      return { previousMessages, tempId }
    },
    onSuccess: (response, _payload, context) => {
      const serverMessage = normalizeMessage(response?.data || response?.message || response)
      queryClient.setQueryData(messagesKey, (current = []) => {
        const list = Array.isArray(current) ? current : []

        if (context?.tempId) {
          const index = list.findIndex((item) => String(item?.id || '') === String(context.tempId))
          if (index >= 0) {
            const next = [...list]
            next[index] = serverMessage
            return sortMessagesAscending(next)
          }
        }

        return sortMessagesAscending(upsertMessage(list, serverMessage))
      })

      queryClient.invalidateQueries({ queryKey: messagesKey })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (_error, _payload, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(messagesKey, context.previousMessages)
      }
      queryClient.invalidateQueries({ queryKey: messagesKey })
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
