import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'
import { resolveTenantId } from '../../services/tenantResolver'
import { useNotificationCenterStore } from '../../features/notifications'
import { buildNotificationFromPayload, detectNotificationChannel } from '../../features/notifications/utils/notificationPayloads'
import { playWhatsappNotificationSound } from '../../features/conversations/utils/whatsappNotificationSound'
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

function getNotificationTitle(payload = {}) {
  return (
    payload.title ||
    payload.notification?.title ||
    payload.data?.title ||
    payload.message ||
    'إشعار جديد'
  )
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getNotificationDescription(payload = {}) {
  const data = payload.data || {}
  const details = [
    data.lead_name ? `العميل: ${data.lead_name}` : '',
    data.source ? `المصدر: ${data.source}` : '',
    payload.type ? `النوع: ${payload.type}` : '',
    payload.created_at ? `الوقت: ${formatDateTime(payload.created_at)}` : '',
  ].filter(Boolean)

  if (details.length) return details.join(' - ')

  return (
    payload.body ||
    payload.description ||
    payload.notification?.body ||
    payload.notification?.description ||
    payload.data?.body ||
    payload.data?.description ||
    ''
  )
}

function getNotificationActionUrl(payload = {}) {
  return payload.action_url || payload.notification?.action_url || payload.data?.action_url || ''
}

function getWhatsappSoundKey(payload = {}) {
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {}
  const message = payload.message || data.message || payload.whatsapp_message || data.whatsapp_message || {}
  return (
    message.id ||
    message.message_id ||
    message.whatsapp_message_id ||
    payload.message_id ||
    payload.whatsapp_message_id ||
    data.message_id ||
    data.whatsapp_message_id ||
    payload.id ||
    data.id ||
    ''
  )
}

function shouldPlayWhatsappSound(payload = {}) {
  if (detectNotificationChannel(payload) !== 'whatsapp') return false

  const data = payload.data && typeof payload.data === 'object' ? payload.data : {}
  const eventText = [
    payload.type,
    payload.event,
    payload.action,
    data.type,
    data.event,
    data.action,
  ].filter(Boolean).join(' ').toLowerCase()

  return !(
    eventText.includes('reaction') ||
    eventText.includes('read') ||
    eventText.includes('seen') ||
    eventText.includes('delivered') ||
    eventText.includes('status')
  )
}

export function useTenantNotificationsRealtime({
  tenantId = '',
  userId = '',
  enabled = true,
  showToast = true,
  shouldToast,
  onNotification,
} = {}) {
  const user = useAuthStore((state) => state.user)
  const addNotification = useNotificationCenterStore((state) => state.addNotification)
  const resolvedTenantId = useMemo(
    () => resolveTenantId(user, tenantId),
    [tenantId, user]
  )
  const resolvedUserId = useMemo(
    () => resolveUserId(user, userId),
    [user, userId]
  )
  const channelName = useMemo(() => {
    if (!resolvedTenantId || !resolvedUserId) return ''
    return `tenant.${resolvedTenantId}.notifications.${resolvedUserId}`
  }, [resolvedTenantId, resolvedUserId])

  const handleNotification = useCallback(
    (payload = {}) => {
      console.log('Notification received:', payload)
      addNotification(buildNotificationFromPayload(payload, { persistent: true }))
      if (shouldPlayWhatsappSound(payload)) {
        playWhatsappNotificationSound(getWhatsappSoundKey(payload))
      }
      onNotification?.(payload)

      if (!showToast) return
      if (shouldToast && !shouldToast(payload)) return

      const title = getNotificationTitle(payload)
      const description = getNotificationDescription(payload)
      const actionUrl = getNotificationActionUrl(payload)

      toast.info(title, {
        description: description || undefined,
        action: actionUrl
          ? {
              label: 'فتح',
              onClick: () => {
                window.location.assign(actionUrl)
              },
            }
          : undefined,
      })
    },
    [addNotification, onNotification, shouldToast, showToast]
  )

  const realtime = useRealtimeChannel({
    channelName,
    eventName: '.notification.created',
    enabled: Boolean(enabled && resolvedTenantId && resolvedUserId),
    isPrivate: true,
    onEvent: handleNotification,
  })

  return {
    ...realtime,
    channelName,
    tenantId: resolvedTenantId,
    userId: resolvedUserId,
  }
}
