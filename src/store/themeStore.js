import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      toggleTheme: () => set({ isDark: !get().isDark }),

      initTheme: () => document.documentElement.classList.toggle('dark', get().isDark),
    }),
    { name: 'ican-theme', version: 1 }
  )
)
