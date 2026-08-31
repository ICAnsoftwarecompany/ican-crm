import { create } from 'zustand'

export const useMessengerNotificationsStore = create((set) => ({
  unreadCount: 0,
  lastNotification: null,
  incrementUnread: (amount = 1) =>
    set((state) => ({
      unreadCount: state.unreadCount + amount,
    })),
  setUnreadCount: (count) =>
    set({
      unreadCount: Math.max(0, Number(count) || 0),
    }),
  setLastNotification: (notification) =>
    set({
      lastNotification: notification,
    }),
  markAllRead: () =>
    set({
      unreadCount: 0,
    }),
}))
