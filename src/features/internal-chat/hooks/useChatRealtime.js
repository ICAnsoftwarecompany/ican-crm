import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '../../../store/authStore'
import { resolveTenantId } from '../../../services/tenantResolver'
import { useRealtimeChannel } from '../../../realtime/hooks/useRealtimeChannel'
import { chatKeys } from '../constants/chatConstants'
import { normalizeMessage, upsertMessage } from '../utils/messageCacheHelpers'

function normalizeValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return ''
  return String(value).trim()
}

function resolveUserId(user) {
  const candidates = [user?.id, user?.user_id, user?.userId, user?.admin_id, user?.adminId]
  return candidates.map(normalizeValue).find(Boolean) || ''
}

function getConversationIdFromPayload(payload = {}) {
  return payload?.conversation_id || payload?.conversation?.id || payload?.data?.conversation_id || payload?.data?.conversation?.id || ''
}

function getMessageFromPayload(payload = {}) {
  return payload?.message || payload?.data?.message || payload?.data || null
}

function isInternalChatPayload(payload = {}, eventName = '') {
  const text = [
    eventName,
    payload?.type,
    payload?.event,
    payload?.channel,
    payload?.data?.type,
    payload?.data?.event,
    payload?.data?.channel,
  ].filter(Boolean).join(' ').toLowerCase()

  return text.includes('internal') && text.includes('chat')
}

export function useChatRealtime({ activeConversationId = '', enabled = true } = {}) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const tenantId = useMemo(() => resolveTenantId(user), [user])
  const userId = useMemo(() => resolveUserId(user), [user])
  const channelName = useMemo(() => (
    tenantId && userId ? `tenant.${tenantId}.notifications.${userId}` : ''
  ), [tenantId, userId])

  const onRealtimeEvent = useCallback((payload = {}, eventName = '') => {
    if (!isInternalChatPayload(payload, eventName)) return

    const conversationId = String(getConversationIdFromPayload(payload) || '')
    const messagePayload = getMessageFromPayload(payload)

    if (conversationId && messagePayload && String(activeConversationId || '') === conversationId) {
      const normalized = normalizeMessage(messagePayload)
      queryClient.setQueryData(chatKeys.messages(conversationId, { page: 1 }), (current = []) => (
        upsertMessage(Array.isArray(current) ? current : [], normalized)
      ))
    }

    queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    queryClient.invalidateQueries({ queryKey: chatKeys.unread() })
  }, [activeConversationId, queryClient])

  const realtime = useRealtimeChannel({
    channelName,
    eventName: '.notification.created',
    enabled: Boolean(enabled && channelName),
    isPrivate: true,
    onEvent: onRealtimeEvent,
  })

  return {
    ...realtime,
    channelName,
    tenantId,
    userId,
  }
}
