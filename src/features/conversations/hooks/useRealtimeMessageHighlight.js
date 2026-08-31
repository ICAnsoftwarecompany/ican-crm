import { useCallback, useEffect, useRef, useState } from 'react'

export function useRealtimeMessageHighlight(duration = 2600) {
  const [highlightedMessageId, setHighlightedMessageId] = useState('')
  const timeoutRef = useRef(null)

  const highlightMessage = useCallback((messageId) => {
    if (!messageId) return

    setHighlightedMessageId(String(messageId))
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setHighlightedMessageId('')
      timeoutRef.current = null
    }, duration)
  }, [duration])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    highlightedMessageId,
    highlightMessage,
  }
}
