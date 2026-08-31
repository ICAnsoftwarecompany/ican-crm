import { MessageSquareText } from 'lucide-react'

import { FloatingCustomerChat } from '../shared/FloatingCustomerChat'
import { useFloatingChatDraft } from '../shared/useFloatingChatDraft'

export function FloatingSmsChat({ open, customer, onClose, zIndex, onFocus }) {
  const chat = useFloatingChatDraft('sms', 'SMS', customer, open)

  return (
    <FloatingCustomerChat
      open={open}
      channel="sms"
      channelLabel="SMS"
      channelIcon={MessageSquareText}
      channelColor="#B45309"
      customer={customer}
      messages={chat.messages}
      isSending={chat.isSending}
      onClose={onClose}
      onSend={chat.sendMessage}
      zIndex={zIndex}
      onFocus={onFocus}
    />
  )
}
