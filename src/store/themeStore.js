import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { deriveBrandTokens } from '../features/branding/utils/deriveBrandTokens'
import {
  DEFAULT_BRAND_TOKENS,
  clearBrandTokens,
  loadBrandTokens,
  saveBrandTokens as persistBrandTokens,
} from '../features/branding/api/brandingApi'

const savedBrandTokens = loadBrandTokens()

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      brandPrimary: savedBrandTokens?.brandPrimary ?? DEFAULT_BRAND_TOKENS.brandPrimary,
      brandAccent: savedBrandTokens?.brandAccent ?? DEFAULT_BRAND_TOKENS.brandAccent,

      toggleTheme: () => set({ isDark: !get().isDark }),

      initTheme: () => document.documentElement.classList.toggle('dark', get().isDark),

      // Live-apply only — does not persist. See saveBrandTokens/resetBrandTokens.
      setBrandPrimary: (hex) => {
        set({ brandPrimary: hex })
        get().applyBrandTokens()
      },
      setBrandAccent: (hex) => {
        set({ brandAccent: hex })
        get().applyBrandTokens()
      },

      saveBrandTokens: () => {
        const { brandPrimary, brandAccent } = get()
        persistBrandTokens({ brandPrimary, brandAccent })
      },

      resetBrandTokens: () => {
        set({
          brandPrimary: DEFAULT_BRAND_TOKENS.brandPrimary,
          brandAccent: DEFAULT_BRAND_TOKENS.brandAccent,
        })
        clearBrandTokens()
        get().applyBrandTokens()
      },

      // Recomputes every dependent token from brandPrimary/brandAccent and
      // writes them as CSS custom properties on the document root, so every
      // consumer (Tailwind's var()-backed color tokens, and any var(--x)
      // usage) picks up the change immediately, no reload required.
      applyBrandTokens: () => {
        const { brandPrimary, brandAccent, isDark } = get()
        const derived = deriveBrandTokens(brandPrimary, brandAccent, isDark ? 'dark' : 'light')
        const root = document.documentElement.style
        root.setProperty('--brand-primary', brandPrimary)
        root.setProperty('--brand-primary-l', derived.brandPrimaryL)
        root.setProperty('--brand-accent', brandAccent)
        root.setProperty('--brand-accent-soft', derived.brandAccentSoft)
        root.setProperty('--ai-color', derived.aiColor)
        root.setProperty('--ai-bg', derived.aiBg)
        root.setProperty('--ai-border', derived.aiBorder)
      },
    }),
    {
      name: 'ican-theme',
      version: 1,
      // brandPrimary/brandAccent are intentionally excluded: they persist
      // only through the explicit Save action (features/branding/api),
      // never as a side effect of dragging a picker.
      partialize: (state) => ({ isDark: state.isDark }),
    }
  )
)
