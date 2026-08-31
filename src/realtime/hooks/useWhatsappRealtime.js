import { useCallback, useMemo } from 'react'

import { useNotificationCenterStore } from '../../features/notifications'
import { buildWhatsappMessageNotification } from '../../features/notifications/utils/notificationPayloads'
import { playWhatsappNotificationSound } from '../../features/conversations/utils/whatsappNotificationSound'
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

function resolveWhatsappMessage(payload = {}) {
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {}
  return payload.message || data.message || payload.whatsapp_message || data.whatsapp_message || null
}

function resolveWhatsappConversation(payload = {}) {
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {}
  return payload.conversation || data.conversation || null
}

function resolveWhatsappConversationId(payload = {}, fallback = '') {
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {}
  const conversation = resolveWhatsappConversation(payload)
  return (
    payload.conversation_id ||
    data.conversation_id ||
    payload.whatsapp_conversation_id ||
    data.whatsapp_conversation_id ||
    conversation?.id ||
    fallback ||
    ''
  )
}

function isNewIncomingWhatsappMessage(message = {}, eventName = '') {
  const normalizedEvent = String(eventName || '').toLowerCase()
  const direction = String(message?.direction || '').toLowerCase()
  const status = String(message?.status || '').toLowerCase()

  if (normalizedEvent.includes('reaction')) return false
  if (normalizedEvent.includes('read') || normalizedEvent.includes('seen') || normalizedEvent.includes('delivered')) return false
  if (normalizedEvent.includes('status')) return false
  if (direction === 'outbound' || direction === 'outgoing' || direction === 'sent') return false
  if (status === 'read' || status === 'seen' || status === 'delivered') return false

  return Boolean(message?.id || message?.message_id || message?.whatsapp_message_id || message?.body || message?.text || message?.attachments)
}

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
