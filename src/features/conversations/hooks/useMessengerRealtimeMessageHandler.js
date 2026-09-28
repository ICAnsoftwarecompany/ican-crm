import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import {
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  MESSENGER_CONVERSATION_INFO_QUERY_KEY,
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
  applyMessengerMessagePatchToCachedResponse,
  applyMessengerReactionToCachedResponse,
  getMessengerMessageId,
  getMessengerRealtimeConversation,
  getMessengerRealtimeConversationId,
  getMessengerRealtimeMessage,
  getMessengerRealtimeMessagePatch,
  getMessengerRealtimeReaction,
  getMessengerRealtimeReactionMessageId,
  isOutgoingMessage,
  upsertMessengerConversation,
} from '../utils/messengerConversations'
import { mergeInfoIntoCachedResponse, upsertMessageIntoCachedResponse } from '../utils/messengerCachedResponses'
import { playMessengerNotificationSound } from '../utils/notificationSound'

/**
 * Realtime Messenger message handler shared by MessengerConversationsWorkspace and
 * MessengerSidebarPanel: updates the workspace conversation/info/message caches,
 * highlights the message in the open conversation and plays the notification sound.
 * `canHighlight` lets the sidebar highlight only while its chat view is visible.
 */
export function useMessengerRealtimeMessageHandler({ selectedId, highlightMessage, canHighlight = true }) {
  const queryClient = useQueryClient()

  return useCallback((payload = {}, eventName = '') => {
    const incomingMessage = getMessengerRealtimeMessage(payload)
    const conversationPatch = getMessengerRealtimeConversation(payload)
    const eventConversationId = getMessengerRealtimeConversationId(payload) || conversationPatch?.id || selectedId

    if (conversationPatch) {
      queryClient.setQueryData(
        MESSENGER_CONVERSATIONS_QUERY_KEY,
        (current = []) => upsertMessengerConversation(current, conversationPatch)
      )
      queryClient.setQueryData(
        MESSENGER_CONVERSATION_INFO_QUERY_KEY(eventConversationId),
        (current) => mergeInfoIntoCachedResponse(current, conversationPatch)
      )
    }

    if (!eventConversationId) return

    if (!incomingMessage) {
      const messagePatch = getMessengerRealtimeMessagePatch(payload)
      const reaction = getMessengerRealtimeReaction(payload)
      const reactionMessageId = getMessengerRealtimeReactionMessageId(payload)
      if (messagePatch) {
        queryClient.setQueryData(
          MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId),
          (current) => applyMessengerMessagePatchToCachedResponse(current, messagePatch)
        )
      }

      if (reaction || reactionMessageId) {
        queryClient.setQueryData(
          MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId),
          (current) => applyMessengerReactionToCachedResponse(current, payload, eventName)
        )
      }

      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(eventConversationId) })
      return
    }

    const messageIdentity = getMessengerMessageId(incomingMessage)
    if (String(eventConversationId) === String(selectedId) && canHighlight) {
      highlightMessage(messageIdentity)
    }

    if (!isOutgoingMessage(incomingMessage) && (incomingMessage.status === 'received' || !incomingMessage.sent_by_user_id)) {
      playMessengerNotificationSound(messageIdentity)
    }

    queryClient.setQueryData(
      MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId),
      (current) => upsertMessageIntoCachedResponse(current, incomingMessage)
    )
  }, [canHighlight, highlightMessage, queryClient, selectedId])
}
