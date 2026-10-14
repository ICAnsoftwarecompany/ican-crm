import { useCallback, useState } from 'react'

const PREFIX = 'ican:catalog:'

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : raw === 'true'
  } catch {
    return fallback
  }
}

/**
 * A boolean UI preference kept in this browser (tutorial on/off, templates hidden, guide dismissed), 2026-10-14.
 * Storage errors (private mode, blocked storage) fall back to in-memory state.
 */
export function usePersistentFlag(key, fallback = false) {
  const [value, setValue] = useState(() => read(key, fallback))
  const set = useCallback((next) => {
    setValue(next)
    try {
      window.localStorage.setItem(PREFIX + key, String(Boolean(next)))
    } catch {
      // Not persisted; the in-memory value still applies.
    }
  }, [key])
  return [value, set]
}
