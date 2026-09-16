import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { buildSocialMessageRecipients } from './customerSocialMessagingUtils'
import { SOCIAL_MESSAGE_CHANNELS } from './socialMessageChannels'
import { SocialMessageComposer } from './SocialMessageComposer'
import { SocialMessageDialogFooter } from './SocialMessageDialogFooter'
import { SocialMessageHelpText } from './SocialMessageHelpText'
import { SocialMessageRecipientsPreview } from './SocialMessageRecipientsPreview'

export function CustomerSocialMessagingPanel({
  customers = [],
  channelId,
  isOpen = false,
  onClose,
  onSendMessage,
}) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const activeChannel = useMemo(
    () => SOCIAL_MESSAGE_CHANNELS.find((channel) => channel.id === channelId) || SOCIAL_MESSAGE_CHANNELS[0],
    [channelId]
  )

  const recipients = useMemo(
    () => buildSocialMessageRecipients(customers),
    [customers]
  )

  if (!isOpen) return null

  const handleSend = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      toast.error('اكتب رسالة أولا.')
      return
    }

    if (!recipients.length) {
      toast.error('لا يوجد عملاء صالحون للإرسال.')
      return
    }

    const payload = {
      channel: activeChannel.id,
      recipients,
      message: trimmedMessage,
      source: 'customers_bulk_actions',
      status: 'draft',
    }

    try {
      setIsSending(true)

      if (typeof onSendMessage === 'function') {
        await onSendMessage(payload)
        toast.success(`تم تجهيز الرسالة للإرسال إلى ${recipients.length} عميل.`)
      } else {
        toast.info(`واجهة الرسائل جاهزة للربط بالـ API لاحقا (${recipients.length} عميل).`)
      }

      setMessage('')
      onClose?.()
    } catch (error) {
      toast.error(error?.message || 'تعذر تجهيز الرسالة.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`إرسال رسالة عبر ${activeChannel.label}`}
      description={`سيتم إرسال نفس الرسالة إلى ${recipients.length} عميل`}
      size="lg"
      className="max-w-2xl"
      footer={(
        <SocialMessageDialogFooter
          canSend={Boolean(message.trim() && recipients.length)}
          isSending={isSending}
          onCancel={onClose}
          onSend={handleSend}
        />
      )}
    >
      <div className="space-y-3">
        <SocialMessageRecipientsPreview recipients={recipients} />
        <SocialMessageComposer channel={activeChannel} value={message} onChange={setMessage} />
        <SocialMessageHelpText />
      </div>
    </AppModal>
  )
}
