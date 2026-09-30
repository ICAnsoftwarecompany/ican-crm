import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Portal session — completely separate from the staff `authStore` (spec §43.2: portal token ≠ staff session).
 * Holds only the opaque portal token and the last `/me` snapshot for a fast first paint.
 */
export const usePortalSession = create(
  persist(
    (set) => ({
      token: null,
      me: null,
      setSession: ({ token, ...me }) => set({ token, me }),
      setMe: (me) => set({ me }),
      clear: () => set({ token: null, me: null }),
    }),
    { name: 'ican-portal-session', partialize: (state) => ({ token: state.token, me: state.me }) }
  )
)
