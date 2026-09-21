import { useEffect } from 'react'
import { useThemeStore } from '../../store/themeStore'

export function ThemeProvider({ children }) {
  const initTheme = useThemeStore((s) => s.initTheme)
  const applyBrandTokens = useThemeStore((s) => s.applyBrandTokens)
  const isDark = useThemeStore((s) => s.isDark)
  const brandPrimary = useThemeStore((s) => s.brandPrimary)
  const brandAccent = useThemeStore((s) => s.brandAccent)

  useEffect(() => {
    initTheme()
  }, [initTheme, isDark])

  useEffect(() => {
    // Re-derive on theme change too: brand-accent-soft/ai-border target a
    // different lightness in light vs dark mode.
    applyBrandTokens()
  }, [applyBrandTokens, isDark, brandPrimary, brandAccent])

  return <>{children}</>
}
