import { useCallback, useRef, useState } from 'react'

const MAX_HISTORY = 100

/**
 * Undo/redo over `{nodes, edges}` snapshots. Callers must call `commit()`
 * explicitly at meaningful boundaries (node add/delete, edge add/delete,
 * property update, drag END) — NOT on every intermediate change, or
 * dragging a node would produce hundreds of history entries (see docs
 * "History"). `useVisualFlowKeyboard` wires Ctrl+Z/Ctrl+Shift+Z to
 * `undo`/`redo` automatically.
 */
export function useVisualFlowHistory({ onRestore } = {}) {
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const past = useRef([])
  const future = useRef([])
  const current = useRef(null)

  const sync = () => {
    setCanUndo(past.current.length > 0)
    setCanRedo(future.current.length > 0)
  }

  const commit = useCallback((snapshot) => {
    if (current.current) past.current.push(current.current)
    if (past.current.length > MAX_HISTORY) past.current.shift()
    current.current = snapshot
    future.current = []
    sync()
  }, [])

  const undo = useCallback(() => {
    if (past.current.length === 0) return
    const previous = past.current.pop()
    if (current.current) future.current.push(current.current)
    current.current = previous
    onRestore?.(previous)
    sync()
  }, [onRestore])

  const redo = useCallback(() => {
    if (future.current.length === 0) return
    const next = future.current.pop()
    if (current.current) past.current.push(current.current)
    current.current = next
    onRestore?.(next)
    sync()
  }, [onRestore])

  const reset = useCallback((snapshot) => {
    past.current = []
    future.current = []
    current.current = snapshot || null
    sync()
  }, [])

  return { commit, undo, redo, canUndo, canRedo, reset }
}
