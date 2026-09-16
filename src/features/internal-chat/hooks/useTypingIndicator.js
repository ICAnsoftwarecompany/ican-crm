import { useCallback, useMemo, useState } from 'react'

export function useTypingIndicator() {
  const [typingUsers, setTypingUsers] = useState({})

  const setUserTyping = useCallback((conversationId, user) => {
    const key = String(conversationId || '')
    if (!key || !user) return

    setTypingUsers((current) => {
      const next = { ...current }
      const existing = Array.isArray(next[key]) ? next[key] : []
      const userId = String(user?.id || user?.user_id || user?.userId || user?.name || Math.random())
      const deduped = [...existing.filter((item) => String(item?.id || item?.name) !== userId), { ...user, id: userId }]
      next[key] = deduped
      return next
    })

    window.setTimeout(() => {
      setTypingUsers((current) => {
        const next = { ...current }
        next[key] = (next[key] || []).filter((item) => String(item?.id || item?.name) !== String(user?.id || user?.user_id || user?.userId || user?.name))
        return next
      })
    }, 3000)
  }, [])

  const getTypingText = useCallback((conversationId) => {
    const key = String(conversationId || '')
    const users = Array.isArray(typingUsers[key]) ? typingUsers[key] : []
    if (!users.length) return ''
    if (users.length === 1) return `${users[0]?.name || 'User'} is typing...`
    return `${users[0]?.name || 'User'} and ${users.length - 1} others are typing...`
  }, [typingUsers])

  return useMemo(() => ({ typingUsers, setUserTyping, getTypingText }), [getTypingText, setUserTyping, typingUsers])
}
