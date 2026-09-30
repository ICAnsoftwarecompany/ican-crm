import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Portal-only UI preferences (dark mode). Language is i18next's own `i18nextLng`. */
export const usePortalPreferences = create(
  persist((set, get) => ({ isDark: false, toggleDark: () => set({ isDark: !get().isDark }) }), { name: 'ican-portal-preferences' })
)
