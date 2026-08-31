import { toast } from 'sonner'
import { useState } from 'react'

import { WhatsappLogoIcon } from '../../../../../../features/conversations/components/WhatsappNavbarButton'
import { WhatsappTemplatesDialog } from '../../../../../../features/conversations/components/WhatsappTemplatesDialog'
import { requestOpenWhatsappSidebar } from '../../../../../../features/conversations/constants/whatsappSidebarEvents'
import { FloatingCustomerChat } from '../shared/FloatingCustomerChat'
import { useWhatsappFloatingChat } from './useWhatsappFloatingChat'

const TEXT = {
  noConversation: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062d\u0627\u062f\u062b\u0629 WhatsApp \u0645\u0631\u062a\u0628\u0637\u0629 \u0628\u0647\u0630\u0627 \u0627\u0644\u0639\u0645\u064a\u0644.',
  missingRecipient: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0631\u0642\u0645 \u0645\u0633\u062a\u0644\u0645 \u0648\u0627\u0636\u062d \u0644\u0645\u062d\u0627\u062f\u062b\u0629 WhatsApp.',
  missingPhoneNumberId: '\u0636\u0639 VITE_WHATSAPP_PHONE_NUMBER_ID \u0641\u064a .env \u0623\u0648 \u0623\u0631\u062c\u0639 phone_number_id \u0645\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629.',
  sendFailed: '\u062a\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 WhatsApp',
  reactionFailed: '\u062a\u0639\u0630\u0631 \u062d\u0641\u0638 \u062a\u0641\u0627\u0639\u0644 WhatsApp',
  sidebarTitle: '\u0641\u062a\u062d \u0645\u062d\u0627\u062f\u062b\u0629 WhatsApp \u0641\u064a \u0627\u0644\u0644\u0648\u062d\u0629 \u0627\u0644\u062c\u0627\u0646\u0628\u064a\u0629',
}

function resolveCustomer(customer, conversationInfo) {
  return {
    ...(customer || {}),
    ...(conversationInfo?.customer || {}),
    name: conversationInfo?.customer?.name || conversationInfo?.contact?.name || customer?.name || customer?.lead?.name || 'WhatsApp',
    phone: conversationInfo?.customer?.phone || conversationInfo?.contact?.phone || conversationInfo?.contact?.wa_id || customer?.phone || customer?.lead?.phone || '',
    email: conversationInfo?.customer?.email || customer?.email || customer?.lead?.email || '',
    profile_picture: conversationInfo?.contact?.profile_picture || customer?.profile_picture || customer?.avatar || '',
    conversation_id: conversationInfo?.id || customer?.conversation_id || customer?.conversationId || '',
  }
}

export function FloatingWhatsappChat({ open, customer, onClose, zIndex, onFocus }) {
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false)
  const chat = useWhatsappFloatingChat(customer, open)
  const resolvedCustomer = resolveCustomer(customer, chat.conversationInfo)

  const handleSend = async ({ text, attachment, replyToMessageId }) => {
    if (!chat.foundConversation) {
      setTemplatesDialogOpen(true)
      toast.info('ابدأ المحادثة بإرسال قالب WhatsApp معتمد أولا')
      return
    }

    if (!chat.recipient) {
      toast.error(TEXT.missingRecipient)
      return
    }

    if (!chat.phoneNumberId) {
      toast.error(TEXT.missingPhoneNumberId)
      return
    }

    try {
      await chat.sendMessage({ text, attachment, replyToMessageId })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || TEXT.sendFailed)
    }
  }

  const handleReact = async ({ messageId, reaction }) => {
    if (!messageId || !reaction) return

    try {
      await chat.reactToMessage({ messageId, reaction })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || TEXT.reactionFailed)
    }
  }

  const handleOpenSidebar = () => {
    requestOpenWhatsappSidebar({
      conversationId: chat.conversation?.id || chat.conversationInfo?.id || '',
      source: 'floating-whatsapp-chat',
    })
  }

  return (
    <>
      <FloatingCustomerChat
        open={open}
        channel="whatsapp"
        channelLabel="WhatsApp"
        channelIcon={WhatsappLogoIcon}
        channelColor="#25D366"
        customer={resolvedCustomer}
        messages={chat.messages}
        isLoadingMessages={chat.isLoadingMessages}
        isSending={chat.isSending}
        error={chat.error}
        hasMoreMessages={chat.hasMoreMessages}
        highlightedMessageId={chat.highlightedMessageId}
        onLoadMore={chat.loadMore}
        onClose={onClose}
        onSend={handleSend}
        onReact={handleReact}
        supportsAttachments
        supportsReply
        supportsReactions
        onOpenSidebar={handleOpenSidebar}
        openSidebarTitle={TEXT.sidebarTitle}
        zIndex={zIndex}
        onFocus={onFocus}
      />

      <WhatsappTemplatesDialog
        open={templatesDialogOpen}
        onClose={() => setTemplatesDialogOpen(false)}
        defaultPhoneNumberId={chat.phoneNumberId}
        defaultTo={resolvedCustomer.phone}
      />
    </>
  )
}
