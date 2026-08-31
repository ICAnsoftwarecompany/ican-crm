import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useTenantNotificationsRealtime } from '../../../realtime/hooks/useTenantNotificationsRealtime'
import { useMessengerNotificationsStore } from '../store/messengerNotificationsStore'
import {
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  MESSENGER_CONVERSATION_INFO_QUERY_KEY,
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
  extractMessengerConversations,
  getMessengerConversationId,
  getMessengerMessageId,
  getMessengerConversationTitle,
  getMessengerNotificationData,
  getMessengerNotificationDescription,
  getMessengerNotificationTitle,
  isMessengerNotification,
  upsertMessengerConversation,
} from '../utils/messengerConversations'
import { playMessengerNotificationSound } from '../utils/messengerNotificationSound'

export function useGlobalMessengerNotifications() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const incrementUnread = useMessengerNotificationsStore((state) => state.incrementUnread)
  const setLastNotification = useMessengerNotificationsStore((state) => state.setLastNotification)

  const handleNotification = useCallback((payload = {}) => {
    if (!isMessengerNotification(payload)) return

    const data = getMessengerNotificationData(payload)
    const conversation = payload.conversation || data.conversation
    const conversationId = (
      payload.conversation_id ||
      data.conversation_id ||
      conversation?.id
    )
    const cachedConversations = extractMessengerConversations(
      queryClient.getQueryData(MESSENGER_CONVERSATIONS_QUERY_KEY)
    )
    const cachedConversation = cachedConversations.find((item) => (
      String(getMessengerConversationId(item)) === String(conversationId)
    ))
    const displayConversation = conversation || cachedConversation
    const displayName = displayConversation ? getMessengerConversationTitle(displayConversation) : ''
    const title = displayName ? `رسالة ماسنجر من ${displayName}` : getMessengerNotificationTitle(payload)
    const description = getMessengerNotificationDescription(payload)
    const soundKey = getMessengerMessageId(payload.message || data.message || {}) || String(conversationId || '')

    incrementUnread(1)
    setLastNotification(payload)
    playMessengerNotificationSound(soundKey)

    if (conversation?.id) {
      queryClient.setQueryData(
        MESSENGER_CONVERSATIONS_QUERY_KEY,
        (current = []) => upsertMessengerConversation(current, conversation)
      )
    }

    queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(conversationId) })
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(conversationId) })
    }

    toast.info(title, {
      description: description || undefined,
      action: {
        label: 'فتح',
        onClick: () => navigate(conversationId ? `/conversations?conversation=${encodeURIComponent(conversationId)}` : '/conversations'),
      },
    })
  }, [incrementUnread, navigate, queryClient, setLastNotification])

  return useTenantNotificationsRealtime({
    showToast: false,
    onNotification: handleNotification,
  })
}
