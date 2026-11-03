// API-boundary adapter: keep unknown server shapes visible as an empty list.
export function extractMentions(response) {
  const payload = response?.data ?? response
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.mentions)) return payload.mentions
  if (Array.isArray(payload?.items)) return payload.items
  return []
}
