// Pure WhatsApp realtime payload resolvers, moved verbatim from
// realtime/hooks/useWhatsappRealtime.js so the channel adapter can reuse them.

export function resolveWhatsappMessage(payload = {}) {
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {}
  return payload.message || data.message || payload.whatsapp_message || data.whatsapp_message || null
}

export function resolveWhatsappConversation(payload = {}) {
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {}
  return payload.conversation || data.conversation || null
}

export function resolveWhatsappConversationId(payload = {}, fallback = '') {
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {}
  const conversation = resolveWhatsappConversation(payload)
  return (
    payload.conversation_id ||
    data.conversation_id ||
    payload.whatsapp_conversation_id ||
    data.whatsapp_conversation_id ||
    conversation?.id ||
    fallback ||
    ''
  )
}

export function isNewIncomingWhatsappMessage(message = {}, eventName = '') {
  const normalizedEvent = String(eventName || '').toLowerCase()
  const direction = String(message?.direction || '').toLowerCase()
  const status = String(message?.status || '').toLowerCase()

  if (normalizedEvent.includes('reaction')) return false
  if (normalizedEvent.includes('read') || normalizedEvent.includes('seen') || normalizedEvent.includes('delivered')) return false
  if (normalizedEvent.includes('status')) return false
  if (direction === 'outbound' || direction === 'outgoing' || direction === 'sent') return false
  if (status === 'read' || status === 'seen' || status === 'delivered') return false

  return Boolean(message?.id || message?.message_id || message?.whatsapp_message_id || message?.body || message?.text || message?.attachments)
}
