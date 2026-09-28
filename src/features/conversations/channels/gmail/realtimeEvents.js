// Pure Gmail realtime payload resolvers, moved verbatim from
// realtime/hooks/useGmailRealtime.js so the channel adapter can reuse them.

export function resolveGmailMessage(payload = {}) {
  return payload.message || payload.data?.message || payload
}

export function resolveGmailConversationId(payload = {}, fallback = '') {
  return payload.conversation_id || payload.conversation?.id || fallback
}
