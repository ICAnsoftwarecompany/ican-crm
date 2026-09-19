// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    useThemeStore.setState({ isDark: false })
  })

  it('defaults to light mode', () => {
    expect(useThemeStore.getState().isDark).toBe(false)
  })

  it('toggleTheme flips isDark', () => {
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().isDark).toBe(true)
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().isDark).toBe(false)
  })

  it('initTheme applies the dark class to the document root when isDark is true', () => {
    useThemeStore.setState({ isDark: true })
    useThemeStore.getState().initTheme()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('initTheme removes the dark class when isDark is false, so restoring light mode is not a one-way street', () => {
    document.documentElement.classList.add('dark')
    useThemeStore.setState({ isDark: false })
    useThemeStore.getState().initTheme()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
