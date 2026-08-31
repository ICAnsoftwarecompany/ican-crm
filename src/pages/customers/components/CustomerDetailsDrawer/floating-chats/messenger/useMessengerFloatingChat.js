import { useCallback, useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { messengerApi } from '../../../../../../features/conversations/api/messengerApi'
import { playMessengerNotificationSound } from '../../../../../../features/conversations/utils/messengerNotificationSound'
import {
  applyMessengerReactionToMessage,
  getMessengerRealtimeConversation,
  getMessengerRealtimeMessage,
  getMessengerRealtimeMessagePatch,
  getMessengerRealtimeReaction,
  getMessengerRealtimeReactionMessageId,
} from '../../../../../../features/conversations/utils/messengerConversations'
import { useRealtimeMessageHighlight } from '../../../../../../features/conversations/hooks/useRealtimeMessageHighlight'
import { useMessengerRealtime } from '../../../../../../realtime/hooks/useMessengerRealtime'
import {
  getConversationFromResponse,
  getConversationInfoFromResponse,
  getLeadId,
  getMessagesFromResponse,
  getMetaFromResponse,
  normalizeMessengerMessage,
  sortMessagesAscending,
} from './messengerChatUtils'

function buildQueryKeys(leadId, conversationId) {
  return {
    leadConversation: ['messenger-chat', 'lead-conversation', leadId],
    info: ['messenger-chat', 'conversation-info', conversationId],
    messagesBase: ['messenger-chat', 'conversation-messages', conversationId],
  }
}
function getMessageIdentity(message) {
  return message?.id || message?.message_id
}

function isOutgoingMessage(message = {}) {
  const direction = String(message?.direction || '').toLowerCase()
  const status = String(message?.status || '').toLowerCase()
  return direction === 'outgoing' || direction === 'outbound' || status === 'sent' || status === 'read'
}

function upsertRawMessage(messages = [], message) {
  const messageId = getMessageIdentity(message)
  if (!messageId) return [...messages, message]

  const exists = messages.some((item) => String(getMessageIdentity(item)) === String(messageId))
  if (exists) {
    return messages.map((item) => (
      String(getMessageIdentity(item)) === String(messageId) ? { ...item, ...message } : item
    ))
  }

  return [...messages, message]
}

function upsertMessageIntoPage(page, message) {
  if (!page) return page

  if (Array.isArray(page)) {
    return upsertRawMessage(page, message)
  }

  if (Array.isArray(page.data)) {
    return {
      ...page,
      data: upsertRawMessage(page.data, message),
    }
  }

  if (Array.isArray(page.messages)) {
    return {
      ...page,
      messages: upsertRawMessage(page.messages, message),
    }
  }

  if (page.data && typeof page.data === 'object' && Array.isArray(page.data.data)) {
    return {
      ...page,
      data: {
        ...page.data,
        data: upsertRawMessage(page.data.data, message),
      },
    }
  }

  return page
}

function upsertMessageIntoInfiniteData(current, message) {
  if (!message) return current

  if (!current?.pages?.length) {
    return {
      pages: [
        {
          success: true,
          data: [message],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 50,
            total: 1,
          },
        },
      ],
      pageParams: [1],
    }
  }

  return {
    ...current,
    pages: current.pages.map((page, index) => (
      index === 0 ? upsertMessageIntoPage(page, message) : page
    )),
  }
}

function applyReactionToRawMessages(messages = [], payload = {}, eventName = '') {
  let applied = false
  const nextMessages = messages.map((message) => {
    const result = applyMessengerReactionToMessage(message, payload, eventName)
    if (result.applied) applied = true
    return result.message
  })

  return { messages: nextMessages, applied }
}

function applyReactionToPage(page, payload = {}, eventName = '') {
  if (!page) return page

  if (Array.isArray(page)) {
    const result = applyReactionToRawMessages(page, payload, eventName)
    return result.applied ? result.messages : page
  }

  if (Array.isArray(page.data)) {
    const result = applyReactionToRawMessages(page.data, payload, eventName)
    return result.applied ? { ...page, data: result.messages } : page
  }

  if (Array.isArray(page.messages)) {
    const result = applyReactionToRawMessages(page.messages, payload, eventName)
    return result.applied ? { ...page, messages: result.messages } : page
  }

  if (page.data && typeof page.data === 'object' && Array.isArray(page.data.data)) {
    const result = applyReactionToRawMessages(page.data.data, payload, eventName)
    return result.applied
      ? {
          ...page,
          data: {
            ...page.data,
            data: result.messages,
          },
        }
      : page
  }

  return page
}

function applyReactionIntoInfiniteData(current, payload = {}, eventName = '') {
  if (!current?.pages?.length) return current

  return {
    ...current,
    pages: current.pages.map((page) => applyReactionToPage(page, payload, eventName)),
  }
}

function getRawMessageLookupIds(message = {}) {
  return [
    message.id,
    message.message_id,
    message.raw?.id,
    message.raw?.message_id,
  ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value))
}

function applyPatchToRawMessages(messages = [], patch = {}) {
  const patchIds = getRawMessageLookupIds(patch)
  if (!patchIds.length) return { messages, applied: false }

  let applied = false
  const nextMessages = messages.map((message) => {
    const messageIds = getRawMessageLookupIds(message)
    const matched = patchIds.some((id) => messageIds.includes(id))
    if (!matched) return message

    applied = true
    return {
      ...message,
      ...patch,
      reactions: Array.isArray(patch.reactions) ? patch.reactions : message.reactions,
      attachments: Array.isArray(patch.attachments) ? patch.attachments : message.attachments,
      reply_to: patch.reply_to ?? message.reply_to,
    }
  })

  return { messages: nextMessages, applied }
}

function applyPatchToPage(page, patch = {}) {
  if (!page) return page

  if (Array.isArray(page)) {
    const result = applyPatchToRawMessages(page, patch)
    return result.applied ? result.messages : page
  }

  if (Array.isArray(page.data)) {
    const result = applyPatchToRawMessages(page.data, patch)
    return result.applied ? { ...page, data: result.messages } : page
  }

  if (Array.isArray(page.messages)) {
    const result = applyPatchToRawMessages(page.messages, patch)
    return result.applied ? { ...page, messages: result.messages } : page
  }

  if (page.data && typeof page.data === 'object' && Array.isArray(page.data.data)) {
    const result = applyPatchToRawMessages(page.data.data, patch)
    return result.applied
      ? {
          ...page,
          data: {
            ...page.data,
            data: result.messages,
          },
        }
      : page
  }

  return page
}

function applyMessagePatchIntoInfiniteData(current, patch = {}) {
  if (!current?.pages?.length) return current

  return {
    ...current,
    pages: current.pages.map((page) => applyPatchToPage(page, patch)),
  }
}

function mergeConversationInfo(current, conversation) {
  if (!conversation) return current

  if (!current) {
    return {
      success: true,
      data: conversation,
    }
  }

  if (current.data && typeof current.data === 'object' && !Array.isArray(current.data)) {
    return {
      ...current,
      data: {
        ...current.data,
        ...conversation,
      },
    }
  }

  return {
    ...current,
    ...conversation,
  }
}

export function useMessengerFloatingChat(customer, open) {
  const queryClient = useQueryClient()
  const { highlightedMessageId, highlightMessage } = useRealtimeMessageHighlight()
  const leadId = getLeadId(customer)
  const keys = buildQueryKeys(leadId, null)

  const leadConversationQuery = useQuery({
    queryKey: keys.leadConversation,
    queryFn: () => messengerApi.getLeadConversation(leadId),
    enabled: Boolean(open && leadId),
    select: getConversationFromResponse,
  })

  const conversation = leadConversationQuery.data
  const conversationId = conversation?.id
  const conversationKeys = buildQueryKeys(leadId, conversationId)

  const conversationInfoQuery = useQuery({
    queryKey: conversationKeys.info,
    queryFn: () => messengerApi.getConversationInfo(conversationId),
    enabled: Boolean(open && conversationId),
    select: getConversationInfoFromResponse,
  })

  const messagesQuery = useInfiniteQuery({
    queryKey: conversationKeys.messagesBase,
    queryFn: ({ pageParam = 1 }) => messengerApi.getConversationMessages(conversationId, { page: pageParam }),
    enabled: Boolean(open && conversationId),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = getMetaFromResponse(lastPage)
      const currentPage = Number(meta.current_page || 1)
      const lastPageNumber = Number(meta.last_page || currentPage)
      return currentPage < lastPageNumber ? currentPage + 1 : undefined
    },
  })

  const conversationInfo = conversationInfoQuery.data
  const messages = useMemo(() => {
    const rawMessages = (messagesQuery.data?.pages || []).flatMap(getMessagesFromResponse)
    return sortMessagesAscending(rawMessages.map((message) => (
      normalizeMessengerMessage(message, conversationInfo)
    )))
  }, [conversationInfo, messagesQuery.data])

  const sendMutation = useMutation({
    mutationFn: ({ text, attachment, replyToMessageId }) => messengerApi.sendMessage(conversationId, {
      message: text,
      attachment,
      reply_to_message_id: replyToMessageId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.info })
      queryClient.invalidateQueries({ queryKey: conversationKeys.messagesBase })
    },
  })

  const reactionMutation = useMutation({
    mutationFn: ({ messageId, reaction }) => messengerApi.reactToMessage(conversationId, messageId, { reaction }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messagesBase })
    },
  })

  const removeReactionMutation = useMutation({
    mutationFn: ({ messageId }) => messengerApi.deleteReaction(conversationId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messagesBase })
    },
  })

  const refreshConversationInfoQueries = useCallback(() => {
    if (!conversationId) {
      queryClient.invalidateQueries({ queryKey: keys.leadConversation })
      return
    }

    queryClient.invalidateQueries({ queryKey: keys.leadConversation })
    queryClient.invalidateQueries({ queryKey: conversationKeys.info })
  }, [conversationId, conversationKeys.info, keys.leadConversation, queryClient])

  const refreshConversationMessagesQueries = useCallback(() => {
    if (!conversationId) return
    queryClient.invalidateQueries({ queryKey: conversationKeys.messagesBase })
  }, [conversationId, conversationKeys.messagesBase, queryClient])

  const handleRealtimeMessage = useCallback((payload = {}, eventName = '') => {
    const message = getMessengerRealtimeMessage(payload)
    const conversationPatch = getMessengerRealtimeConversation(payload)

    if (conversationPatch && conversationId) {
      queryClient.setQueryData(
        conversationKeys.info,
        (current) => mergeConversationInfo(current, conversationPatch)
      )
      queryClient.invalidateQueries({ queryKey: keys.leadConversation })
    }

    if (!message) {
      const messagePatch = getMessengerRealtimeMessagePatch(payload)
      const reaction = getMessengerRealtimeReaction(payload)
      const reactionMessageId = getMessengerRealtimeReactionMessageId(payload)
      if (messagePatch) {
        queryClient.setQueryData(
          conversationKeys.messagesBase,
          (current) => applyMessagePatchIntoInfiniteData(current, messagePatch)
        )
      }

      if (reaction || reactionMessageId) {
        queryClient.setQueryData(
          conversationKeys.messagesBase,
          (current) => applyReactionIntoInfiniteData(current, payload, eventName)
        )
      }

      refreshConversationInfoQueries()
      return
    }

    console.info('[Messenger chat] Realtime message added to cache', {
      conversationId,
      messageId: getMessageIdentity(message),
      body: message.body,
    })

    const messageIdentity = getMessageIdentity(message)
    highlightMessage(messageIdentity)

    if (!isOutgoingMessage(message) && (message.status === 'received' || !message.sent_by_user_id)) {
      playMessengerNotificationSound(messageIdentity)
    }

    queryClient.setQueryData(
      conversationKeys.messagesBase,
      (current) => upsertMessageIntoInfiniteData(current, message)
    )
  }, [
    conversationId,
    conversationKeys.info,
    conversationKeys.messagesBase,
    keys.leadConversation,
    queryClient,
    refreshConversationInfoQueries,
    refreshConversationMessagesQueries,
  ])

  const handleRealtimeNotification = useCallback((payload = {}) => {
    const data = payload.data || payload.notification?.data || {}
    const notificationConversationId = (
      payload.conversation_id ||
      data.conversation_id ||
      data.conversation?.id ||
      payload.conversation?.id
    )

    if (!notificationConversationId || String(notificationConversationId) === String(conversationId)) {
      refreshConversationInfoQueries()
      refreshConversationMessagesQueries()
    }
  }, [conversationId, refreshConversationInfoQueries, refreshConversationMessagesQueries])

  useMessengerRealtime({
    conversationId,
    enabled: Boolean(open),
    onNotification: handleRealtimeNotification,
    onMessageReceived: handleRealtimeMessage,
  })

  const foundConversation = Boolean(conversationId)
  const isLoading = leadConversationQuery.isLoading || conversationInfoQuery.isLoading || messagesQuery.isLoading
  const error = leadConversationQuery.error || conversationInfoQuery.error || messagesQuery.error || sendMutation.error
  const errorMessage = error?.response?.data?.message || error?.message || ''

  const loadMore = () => {
    if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) return
    messagesQuery.fetchNextPage()
  }

  return {
    conversation,
    conversationInfo,
    messages,
    foundConversation,
    isLoadingMessages: isLoading,
    isSending: sendMutation.isPending,
    isReacting: reactionMutation.isPending || removeReactionMutation.isPending,
    error: errorMessage || (!leadConversationQuery.isLoading && open && leadId && !foundConversation ? 'لا توجد محادثة ماسنجر مرتبطة بهذا العميل.' : ''),
    hasMoreMessages: Boolean(messagesQuery.hasNextPage),
    highlightedMessageId,
    loadMore,
    sendMessage: sendMutation.mutateAsync,
    reactToMessage: reactionMutation.mutateAsync,
    removeReaction: removeReactionMutation.mutateAsync,
  }
}
