import { useCallback } from 'react'
import { useNotificationCenterStore } from '../../features/notifications'
import { buildGmailMessageNotification } from '../../features/notifications/utils/notificationPayloads'
import { resolveGmailConversationId, resolveGmailMessage } from '../../features/conversations/channels/gmail/realtimeEvents'
import { useRealtimeChannel } from './useRealtimeChannel'

export function useGmailRealtime({
  conversationId = '',
  enabled = true,
  onMessageReceived,
} = {}) {
  const addNotification = useNotificationCenterStore((state) => state.addNotification)

  const handleEvent = useCallback(
    (payload = {}) => {
      const message = resolveGmailMessage(payload)
      const eventConversationId = resolveGmailConversationId(payload, conversationId)

      addNotification(buildGmailMessageNotification(message, {
        id: `gmail:${eventConversationId || 'conversation'}:${message.id || message.gmail_message_id || message.received_at || Date.now()}`,
        actionUrl: eventConversationId
          ? `/conversations?channel=gmail&gmailConversation=${encodeURIComponent(eventConversationId)}`
          : '/conversations?channel=gmail',
      }))

      onMessageReceived?.({
        ...payload,
        message,
        conversationId: eventConversationId,
      })
    },
    [addNotification, conversationId, onMessageReceived]
  )

  return useRealtimeChannel({
    channelName: conversationId ? `gmail.conversation.${conversationId}` : '',
    eventName: '.gmail.message.received',
    enabled: Boolean(enabled && conversationId),
    isPrivate: true,
    onEvent: handleEvent,
  })
}
