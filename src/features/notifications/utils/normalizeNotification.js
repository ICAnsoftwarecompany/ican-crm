import { getNotificationDefinition } from './notificationRegistry'
import { resolveNotificationIcon } from './notificationIcons'

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function asText(value) {
  return value === null || value === undefined || typeof value === 'object' ? '' : String(value).trim()
}

export function unwrapNotificationPayload(payload = {}) {
  const root = asObject(payload)
  const nested = asObject(root.notification)
  return nested.id ? nested : root
}

export function normalizeNotification(payload = {}) {
  const notification = unwrapNotificationPayload(payload)
  const data = asObject(notification.data)
  const type = asText(notification.type || data.type || 'general')
  const definition = getNotificationDefinition(type)
  const backendTarget = asText(notification.action_url || data.action_url)
  const registryTarget = definition.getTarget?.(data, notification) || ''
  const backendSeverity = asText(notification.severity || data.severity).toLowerCase()
  const severity = backendSeverity || 'info'
  const iconMeta = resolveNotificationIcon(data.icon || notification.icon, definition.icon, definition.tone, backendSeverity)
  const alertableType = asText(notification.alertable_type || data.alertable_type)
  const area = alertableType === 'App\\Models\\Lead' ? 'leads' : 'customers'

  return {
    id: asText(notification.id),
    type,
    category: definition.category,
    title: asText(data.title || notification.title),
    titleKey: definition.titleKey,
    message: asText(data.message || data.description || notification.message || notification.description),
    icon: iconMeta.icon,
    iconName: iconMeta.iconName,
    iconColor: iconMeta.color,
    iconTone: iconMeta.tone,
    severity,
    hasSeverity: Boolean(backendSeverity),
    alertableType,
    area,
    areaKey: `notifications.areas.${area}`,
    entityType: asText(data.entity_type || data.model_type),
    entityId: asText(data.entity_id || data.lead_id || data.deal_id || data.task_id),
    target: backendTarget.startsWith('/') ? backendTarget : registryTarget,
    isRead: Boolean(notification.read_at),
    readAt: notification.read_at || null,
    createdAt: notification.created_at || data.created_at || new Date().toISOString(),
    raw: notification,
  }
}

export function normalizeNotificationList(value) {
  const candidates = [value?.data?.data, value?.data?.notifications, value?.data?.items, value?.data, value?.notifications, value?.items, value]
  const list = candidates.find(Array.isArray) || []
  const unique = new Map()
  list.forEach((item) => {
    const normalized = normalizeNotification(item)
    if (normalized.id) unique.set(normalized.id, normalized)
  })
  return [...unique.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}
