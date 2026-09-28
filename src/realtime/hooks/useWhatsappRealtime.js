import { useCallback, useMemo } from 'react'

import { useNotificationCenterStore } from '../../features/notifications'
import { buildWhatsappMessageNotification } from '../../features/notifications/utils/notificationPayloads'
import { playWhatsappNotificationSound } from '../../features/conversations/utils/whatsappNotificationSound'
import {
  isNewIncomingWhatsappMessage,
  resolveWhatsappConversation,
  resolveWhatsappConversationId,
  resolveWhatsappMessage,
} from '../../features/conversations/channels/whatsapp/realtimeEvents'
import { useRealtimeChannel } from './useRealtimeChannel'

const DEFAULT_WHATSAPP_CONVERSATION_EVENTS = [
  '.whatsapp.message.received',
  '.whatsapp.message.sent',
  '.whatsapp.message.created',
  '.whatsapp.message.updated',
  '.whatsapp.message.read',
  '.whatsapp.message.seen',
  '.whatsapp.message.delivered',
  '.whatsapp.message.status.updated',
  '.whatsapp.message.reaction.created',
  '.whatsapp.message.reaction.updated',
  '.whatsapp.message.reaction.deleted',
  '.whatsapp.conversation.updated',
]

export function useWhatsappRealtime({
  conversationId = '',
  enabled = true,
  onMessageReceived,
  onConversationEvent,
} = {}) {
  const addNotification = useNotificationCenterStore((state) => state.addNotification)
  const conversationEventNames = useMemo(() => DEFAULT_WHATSAPP_CONVERSATION_EVENTS, [])

  const handleConversationEvent = useCallback((payload = {}, eventName = '') => {
    const message = resolveWhatsappMessage(payload)
    const conversation = resolveWhatsappConversation(payload)
    const eventConversationId = resolveWhatsappConversationId(payload, conversationId)

    if (message) {
      if (isNewIncomingWhatsappMessage(message, eventName)) {
        playWhatsappNotificationSound(message.id || message.message_id || message.whatsapp_message_id || message.sent_at || eventConversationId)
      }

      addNotification(buildWhatsappMessageNotification(
        { ...message, conversation_id: eventConversationId, conversation },
        {
          id: `whatsapp:${eventConversationId || 'conversation'}:${message.id || message.message_id || message.sent_at || Date.now()}`,
          actionUrl: eventConversationId
            ? `/conversations?channel=whatsapp&whatsappConversation=${encodeURIComponent(eventConversationId)}`
            : '/conversations?channel=whatsapp',
        }
      ))
    }

    onConversationEvent?.(payload, eventName)
    onMessageReceived?.({
      ...payload,
      message,
      conversation,
      conversationId: eventConversationId,
      eventName,
    })
  }, [addNotification, conversationId, onConversationEvent, onMessageReceived])

  const conversationRealtime = useRealtimeChannel({
    channelName: conversationId ? `whatsapp.conversation.${conversationId}` : '',
    eventNames: conversationEventNames,
    enabled: Boolean(enabled && conversationId),
    isPrivate: true,
    listenToAll: true,
    onEvent: handleConversationEvent,
  })

  return {
    conversationChannelName: conversationId ? `whatsapp.conversation.${conversationId}` : '',
    conversationConnectionStatus: conversationRealtime.connectionStatus,
    conversationEventNames,
  }
}
