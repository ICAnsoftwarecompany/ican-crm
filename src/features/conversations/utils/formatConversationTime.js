// Conversation list timestamp (moved verbatim from the WhatsApp/Gmail/Messenger list rows).
// Note: the 'ar-EG' locale is existing behavior, kept as-is (see plan §8).
export function formatConversationTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ar-EG', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
