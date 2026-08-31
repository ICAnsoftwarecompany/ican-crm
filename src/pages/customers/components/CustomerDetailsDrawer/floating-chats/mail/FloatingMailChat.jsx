import { Mail } from 'lucide-react'

import { FloatingCustomerChat } from '../shared/FloatingCustomerChat'
import { useFloatingChatDraft } from '../shared/useFloatingChatDraft'

export function FloatingMailChat({ open, customer, onClose, zIndex, onFocus }) {
  const chat = useFloatingChatDraft('mail', 'ميل', customer, open)

  return (
    <FloatingCustomerChat
      open={open}
      channel="mail"
      channelLabel="ميل"
      channelIcon={Mail}
      channelColor="#1D4ED8"
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
