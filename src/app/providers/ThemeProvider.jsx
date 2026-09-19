import { useEffect } from 'react'
import { useThemeStore } from '../../store/themeStore'

export function ThemeProvider({ children }) {
  const initTheme = useThemeStore((s) => s.initTheme)
  const isDark = useThemeStore((s) => s.isDark)

  useEffect(() => {
    initTheme()
  }, [initTheme, isDark])

  return <>{children}</>
}
