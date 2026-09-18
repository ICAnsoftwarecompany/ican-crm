import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Dirty-state tracking only — see docs "Unsaved Changes" and "Autosave".
 * VisualFlow does NOT confirm route navigation and does NOT call any save
 * API itself; it only tells the consumer "this changed" via `isDirty`/
 * `onDirtyChange`, and exposes `markClean()` for after a successful save.
 */
export function useVisualFlowPersistence({ nodes, edges, onDirtyChange, onFlowChange } = {}) {
  const [isDirty, setIsDirty] = useState(false)
  const baselineRef = useRef(JSON.stringify({ nodes, edges }))
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    const snapshot = JSON.stringify({ nodes, edges })
    const dirty = snapshot !== baselineRef.current
    setIsDirty(dirty)
    onDirtyChange?.(dirty)
    if (dirty) onFlowChange?.({ nodes, edges })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  const markClean = useCallback(() => {
    baselineRef.current = JSON.stringify({ nodes, edges })
    setIsDirty(false)
    onDirtyChange?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  return { isDirty, markClean }
}
