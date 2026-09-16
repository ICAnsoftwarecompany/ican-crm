import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      sessionRefreshNeeded: false,

      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      setSessionRefreshNeeded: (value) =>
        set({ sessionRefreshNeeded: value }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false, sessionRefreshNeeded: false }),
    }),
    { name: 'ican-auth', version: 1 }
  )
)
