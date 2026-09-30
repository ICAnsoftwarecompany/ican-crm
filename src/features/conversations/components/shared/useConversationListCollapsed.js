import { useEffect, useState } from 'react'

export function useConversationListCollapsed(channel) {
  const storageKey = `conversations:list-collapsed:${channel}`
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(storageKey) === 'true')

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(collapsed))
  }, [collapsed, storageKey])

  return [collapsed, setCollapsed]
}
