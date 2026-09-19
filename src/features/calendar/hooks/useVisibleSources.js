import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ican-crm:calendar:visible-sources'

function readStored(allIds) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set(allIds)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed) : new Set(allIds)
  } catch {
    return new Set(allIds)
  }
}

/**
 * Per-viewer "which calendar sources are checked in the sidebar" — a UI
 * preference, not server data, so plain localStorage (same try/catch
 * convention as AppDrawer's width persistence) is enough; no backend field
 * exists for this and none should be invented.
 */
export function useVisibleSources(allIds) {
  const [visibleIds, setVisibleIds] = useState(() => readStored(allIds))

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visibleIds)))
    } catch {
      // Ignore storage errors and keep the in-memory selection.
    }
  }, [visibleIds])

  const toggleSource = (id) => {
    setVisibleIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return [visibleIds, toggleSource]
}
