import { useEffect } from 'react'

function isTypingTarget(target) {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable
}

/**
 * Wires the standard graph-editor shortcuts (see docs "Keyboard
 * Shortcuts"). Never intercepts while focus is inside an input/textarea —
 * e.g. deleting text in a Properties panel field must not delete the
 * selected node. Pass only the callbacks relevant to the current mode
 * (readonly/live modes typically pass none of the mutating ones).
 */
export function useVisualFlowKeyboard({ enabled = true, onDelete, onCopy, onPaste, onCut, onUndo, onRedo, onSelectAll, onEscape }) {
  useEffect(() => {
    if (!enabled) return undefined

    function handleKeyDown(event) {
      if (isTypingTarget(event.target)) return
      const isMeta = event.ctrlKey || event.metaKey

      if ((event.key === 'Delete' || event.key === 'Backspace') && onDelete) {
        event.preventDefault()
        onDelete()
        return
      }
      if (isMeta && event.key.toLowerCase() === 'c' && onCopy) {
        onCopy()
        return
      }
      if (isMeta && event.key.toLowerCase() === 'v' && onPaste) {
        onPaste()
        return
      }
      if (isMeta && event.key.toLowerCase() === 'x' && onCut) {
        onCut()
        return
      }
      if (isMeta && event.shiftKey && event.key.toLowerCase() === 'z' && onRedo) {
        event.preventDefault()
        onRedo()
        return
      }
      if (isMeta && event.key.toLowerCase() === 'z' && onUndo) {
        event.preventDefault()
        onUndo()
        return
      }
      if (isMeta && event.key.toLowerCase() === 'a' && onSelectAll) {
        event.preventDefault()
        onSelectAll()
        return
      }
      if (event.key === 'Escape' && onEscape) {
        onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onDelete, onCopy, onPaste, onCut, onUndo, onRedo, onSelectAll, onEscape])
}
