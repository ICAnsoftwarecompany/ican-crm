import { useCallback, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { resolveTenantId } from '../../services/tenantResolver'
import { useRealtimeChannel } from './useRealtimeChannel'

function normalizeValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return ''
  return String(value).trim()
}

function resolveUserId(user, explicitUserId = '') {
  const candidates = [
    explicitUserId,
    user?.id,
    user?.user_id,
    user?.userId,
    user?.admin_id,
    user?.adminId,
  ]

  return candidates.map(normalizeValue).find(Boolean) || ''
}

const DEFAULT_MESSENGER_CONVERSATION_EVENTS = [
  '.messenger.message.received',
  '.messenger.message.sent',
  '.messenger.message.created',
  '.messenger.message.updated',
  '.messenger.message.read',
  '.messenger.message.seen',
  '.messenger.message.delivered',
  '.messenger.message.status.updated',
  '.messenger.message.status.changed',
  '.messenger.message.replied',
  '.messenger.message.reaction.created',
  '.messenger.message.reaction.updated',
  '.messenger.message.reaction.deleted',
  '.messenger.message.reacted',
  '.messenger.reaction.created',
  '.messenger.reaction.updated',
  '.messenger.reaction.deleted',
  '.messenger.conversation.updated',
]

export function useMessengerRealtime({
  tenantId = '',
  userId = '',
  conversationId = '',
  enabled = true,
  onNotification,
  onMessageReceived,
  onConversationEvent,
} = {}) {
  const user = useAuthStore((state) => state.user)
  const resolvedTenantId = useMemo(() => resolveTenantId(user, tenantId), [tenantId, user])
  const resolvedUserId = useMemo(() => resolveUserId(user, userId), [user, userId])

  const notificationsChannelName = useMemo(() => {
    if (!resolvedTenantId || !resolvedUserId) return ''
    return `tenant.${resolvedTenantId}.notifications.${resolvedUserId}`
  }, [resolvedTenantId, resolvedUserId])

  const conversationChannelName = useMemo(() => {
    if (!conversationId) return ''
    return `messenger.conversation.${conversationId}`
  }, [conversationId])

  const handleNotification = useCallback((payload = {}) => {
    console.info('[Realtime diagnostic] Messenger notification received', payload)
    onNotification?.(payload)
  }, [onNotification])

  const conversationEventNames = useMemo(() => DEFAULT_MESSENGER_CONVERSATION_EVENTS, [])

  const handleConversationEvent = useCallback((payload = {}, eventName = '') => {
    console.info('[Realtime diagnostic] Messenger conversation event received', { eventName, payload })
    onConversationEvent?.(payload, eventName)
    onMessageReceived?.(payload, eventName)
  }, [onConversationEvent, onMessageReceived])

  const notificationsRealtime = useRealtimeChannel({
    channelName: notificationsChannelName,
    eventName: '.notification.created',
    enabled: Boolean(enabled && resolvedTenantId && resolvedUserId && onNotification),
    isPrivate: true,
    onEvent: handleNotification,
  })

  const conversationRealtime = useRealtimeChannel({
    channelName: conversationChannelName,
    eventNames: conversationEventNames,
    enabled: Boolean(enabled && conversationId),
    isPrivate: true,
    listenToAll: true,
    onEvent: handleConversationEvent,
  })

  return {
    tenantId: resolvedTenantId,
    userId: resolvedUserId,
    notificationsChannelName,
    conversationChannelName,
    notificationsConnectionStatus: notificationsRealtime.connectionStatus,
    conversationConnectionStatus: conversationRealtime.connectionStatus,
    conversationEventNames,
  }
}
