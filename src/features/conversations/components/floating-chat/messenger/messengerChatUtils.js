// Floating Messenger chat response helpers. Message normalization/sorting and
// conversation-info extraction come from channels/messenger/adapter.js.

export function getLeadId(customer) {
  return customer?.lead?.id || customer?.lead_id || customer?.id
}

export function getConversationFromResponse(response) {
  const data = response?.data ?? response
  return data?.conversation || data?.data?.conversation || null
}

export function getMessagesFromResponse(response) {
  const data = response?.data ?? response
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.messages)) return data.messages
  if (Array.isArray(data?.items)) return data.items
  return []
}

export function getMetaFromResponse(response) {
  const data = response?.data ?? response
  return data?.meta || data?.data?.meta || {}
}
