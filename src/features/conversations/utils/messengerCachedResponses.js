import { extractMessengerMessages, upsertMessengerMessage } from './messengerConversations'

// React Query cache updaters shared by the Messenger workspace and sidebar
// (moved verbatim; previously duplicated in both components).

export function upsertMessageIntoCachedResponse(current, message) {
  const messages = upsertMessengerMessage(extractMessengerMessages(current), message)

  if (Array.isArray(current)) return messages
  if (Array.isArray(current?.data)) return { ...current, data: messages }
  if (Array.isArray(current?.messages)) return { ...current, messages }
  if (Array.isArray(current?.data?.data)) {
    return {
      ...current,
      data: {
        ...current.data,
        data: messages,
      },
    }
  }

  return messages
}

export function mergeInfoIntoCachedResponse(current, conversation) {
  if (!conversation) return current
  if (!current) return { success: true, data: conversation }
  if (current.data && typeof current.data === 'object' && !Array.isArray(current.data)) {
    return {
      ...current,
      data: {
        ...current.data,
        ...conversation,
      },
    }
  }

  return { ...current, ...conversation }
}
