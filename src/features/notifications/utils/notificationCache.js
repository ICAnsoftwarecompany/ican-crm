export function upsertNotification(items = [], notification) {
  if (!notification?.id) return items
  const next = items.filter((item) => String(item.id) !== String(notification.id))
  return [notification, ...next].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function mergeNotifications(...collections) {
  const unique = new Map()
  collections.flat().forEach((notification) => {
    if (notification?.id) unique.set(String(notification.id), notification)
  })
  return [...unique.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function markNotificationsRead(items = [], ids = []) {
  const idSet = new Set(ids.map(String))
  const readAt = new Date().toISOString()
  return items.map((item) => idSet.has(String(item.id)) ? { ...item, isRead: true, readAt } : item)
}
