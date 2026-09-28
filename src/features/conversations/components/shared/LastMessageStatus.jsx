import { CheckCheck } from 'lucide-react'

// Read/delivered ticks for an outgoing last message (Messenger list rows).
// WhatsappConversationsWorkspace keeps its own variant: it also treats 'sent' as outgoing.

function isOutgoingLastMessage(conversation) {
  const lastMessage = conversation?.last_message || {}
  const direction = String(lastMessage?.direction || '').toLowerCase()
  return direction === 'outbound' || direction === 'outgoing'
}

export function LastMessageStatus({ conversation }) {
  if (!isOutgoingLastMessage(conversation)) return null

  const status = String(conversation?.last_message?.status || '').toLowerCase()
  const isRead = status === 'read' || status === 'seen'
  const isDelivered = status === 'delivered'
  if (!isRead && !isDelivered) return null

  return (
    <CheckCheck
      size={14}
      className={isRead ? 'shrink-0 text-[#0A7CFF]' : 'shrink-0 text-[#94A3B8]'}
      aria-label={isRead ? 'seen' : 'delivered'}
    />
  )
}
