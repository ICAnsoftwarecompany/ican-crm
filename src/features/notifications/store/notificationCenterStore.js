import { create } from 'zustand'
import { buildNotificationFromPayload } from '../utils/notificationPayloads'

const STORAGE_KEY = 'ican-notification-center-items'
const MAX_ITEMS = 150

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function loadItems() {
  if (!canUseStorage()) return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistItems(items = []) {
  if (!canUseStorage()) return
  try {
    const persistentItems = items.filter((item) => item.persistent !== false).slice(0, MAX_ITEMS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentItems))
  } catch {
    // Storage can be disabled; the in-memory center still works.
  }
}

function normalizeNotification(notification = {}) {
  const normalized = notification.title || notification.channel
    ? notification
    : buildNotificationFromPayload(notification)

  return {
    ...normalized,
    id: String(normalized.id || `${normalized.channel || 'system'}:${Date.now()}`),
    channel: normalized.channel || 'system',
    title: normalized.title || 'إشعار جديد',
    description: normalized.description || '',
    createdAt: normalized.createdAt || new Date().toISOString(),
    read: Boolean(normalized.read),
    persistent: normalized.persistent !== false,
  }
}

function upsert(items, notification) {
  const normalized = normalizeNotification(notification)
  const existingIndex = items.findIndex((item) => String(item.id) === String(normalized.id))
  const nextItems = existingIndex >= 0
    ? [
        { ...items[existingIndex], ...normalized, read: normalized.read },
        ...items.slice(0, existingIndex),
        ...items.slice(existingIndex + 1),
      ]
    : [normalized, ...items]

  return nextItems.slice(0, MAX_ITEMS)
}

export const useNotificationCenterStore = create((set, get) => ({
  items: loadItems(),
  open: false,
  lastNotification: null,

  addNotification: (notification) => {
    const normalized = normalizeNotification(notification)
    set((state) => {
      const items = upsert(state.items, normalized)
      persistItems(items)
      return {
        items,
        lastNotification: normalized,
      }
    })
    return normalized
  },

  addTemporaryNotification: (notification) => {
    return get().addNotification({
      ...notification,
      persistent: false,
      temporary: true,
    })
  },

  markAsRead: (id) =>
    set((state) => {
      const items = state.items.map((item) => (
        String(item.id) === String(id) ? { ...item, read: true } : item
      ))
      persistItems(items)
      return { items }
    }),

  markAllRead: () =>
    set((state) => {
      const items = state.items.map((item) => ({ ...item, read: true }))
      persistItems(items)
      return { items }
    }),

  markChannelRead: (channel) =>
    set((state) => {
      const normalizedChannel = String(channel || '').toLowerCase()
      const items = state.items.map((item) => (
        String(item.channel || '').toLowerCase() === normalizedChannel
          ? { ...item, read: true }
          : item
      ))
      persistItems(items)
      return { items }
    }),

  removeNotification: (id) =>
    set((state) => {
      const items = state.items.filter((item) => String(item.id) !== String(id))
      persistItems(items)
      return { items }
    }),

  clearAll: () =>
    set(() => {
      persistItems([])
      return { items: [], lastNotification: null }
    }),

  setOpen: (open) => set({ open: Boolean(open) }),
  toggleOpen: () => set((state) => ({ open: !state.open })),
}))

export function selectNotificationUnreadCount(state) {
  return state.items.filter((item) => !item.read).length
}
