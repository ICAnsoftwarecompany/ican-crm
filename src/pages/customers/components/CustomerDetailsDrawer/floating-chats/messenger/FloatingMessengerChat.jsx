import { toast } from 'sonner'

import { MessengerLogoIcon } from '../../../../../../features/conversations/components/MessengerNavbarButton'
import { requestOpenMessengerSidebar } from '../../../../../../features/conversations/constants/messengerSidebarEvents'
import { FloatingCustomerChat } from '../shared/FloatingCustomerChat'
import { useMessengerFloatingChat } from './useMessengerFloatingChat'

export function FloatingMessengerChat({ open, customer, onClose, zIndex, onFocus }) {
  const chat = useMessengerFloatingChat(customer, open)

  const handleSend = async ({ text, attachment, replyToMessageId }) => {
    if (!chat.conversation?.id) {
      toast.info('لا توجد محادثة ماسنجر مرتبطة بهذا العميل.')
      return
    }

    await chat.sendMessage({ text, attachment, replyToMessageId })
  }

  const handleOpenInSidebar = () => {
    requestOpenMessengerSidebar({
      conversationId: chat.conversation?.id || '',
      source: 'floating-messenger-chat',
    })
  }

  return (
    <FloatingCustomerChat
      open={open}
      channel="messenger"
      channelLabel="ماسنجر"
      channelIcon={MessengerLogoIcon}
      channelColor="#0A7CFF"
      customer={chat.conversationInfo?.customer || customer}
      messages={chat.messages}
      isLoadingMessages={chat.isLoadingMessages}
      isSending={chat.isSending}
      error={chat.error}
      hasMoreMessages={chat.hasMoreMessages}
      highlightedMessageId={chat.highlightedMessageId}
      onLoadMore={chat.loadMore}
      onClose={onClose}
      onSend={handleSend}
      onReact={chat.reactToMessage}
      onRemoveReaction={chat.removeReaction}
      supportsAttachments={true}
      supportsReply={true}
      supportsReactions={true}
      onOpenSidebar={handleOpenInSidebar}
      openSidebarTitle="فتح المحادثة في اللوحة الجانبية"
      zIndex={zIndex}
      onFocus={onFocus}
    />
  )
}
