import { useTenantNotificationsRealtime } from './hooks/useTenantNotificationsRealtime'
import { isMessengerNotification } from '../features/conversations/utils/messengerConversations'

export function TenantNotificationsRealtime() {
  useTenantNotificationsRealtime({
    shouldToast: (payload) => !isMessengerNotification(payload),
  })

  return null
}
