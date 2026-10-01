import { useCallback, useEffect, useState } from 'react'

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * State for the login showcase slider.
 *
 * Timing is driven by the CSS progress bar, not a JS timer: the active dot's
 * bar animates for SHOWCASE_INTERVAL_MS and its `animationend` calls
 * `next()`. So hover/focus pause (animation-play-state) and the visible
 * progress can never drift apart.
 *
 * Auto-play starts paused for people who ask their OS for reduced motion
 * (WCAG 2.2.2); they can still press play or move manually.
 */
export function useShowcase(count) {
  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(prefersReducedMotion)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const goTo = useCallback((target) => setIndex(((target % count) + count) % count), [count])
  const next = useCallback(() => setIndex((current) => (current + 1) % count), [count])
  const prev = useCallback(() => setIndex((current) => (current - 1 + count) % count), [count])

  return {
    index,
    goTo,
    next,
    prev,
    userPaused,
    togglePaused: () => setUserPaused((value) => !value),
    /** Effective pause: user choice, pointer/keyboard inside, or a hidden tab. */
    paused: userPaused || hoverPaused || tabHidden,
    pauseHandlers: {
      onMouseEnter: () => setHoverPaused(true),
      onMouseLeave: () => setHoverPaused(false),
      onFocus: () => setHoverPaused(true),
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHoverPaused(false)
      },
    },
  }
}
