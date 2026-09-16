function getMessageId(message) {
  return message?.id ?? message?.message_id ?? message?.client_id ?? null
}

export function extractMessagesList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.messages)) return response.messages
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

export function normalizeMessage(message) {
  return {
    ...message,
    id: getMessageId(message),
    text: message?.body || message?.text || message?.message || '',
    createdAt: message?.created_at || message?.createdAt || message?.sent_at || '',
    raw: message,
  }
}

export function sortMessagesAscending(messages = []) {
  return [...messages].sort((a, b) => {
    const first = new Date(a?.createdAt || a?.raw?.created_at || 0).getTime()
    const second = new Date(b?.createdAt || b?.raw?.created_at || 0).getTime()
    return first - second
  })
}

export function upsertMessage(existing = [], incoming) {
  const incomingId = String(getMessageId(incoming) || '')
  if (!incomingId) return [...existing, incoming]

  const index = existing.findIndex((item) => String(getMessageId(item) || '') === incomingId)
  if (index === -1) return [...existing, incoming]

  const next = [...existing]
  next[index] = { ...next[index], ...incoming }
  return next
}
