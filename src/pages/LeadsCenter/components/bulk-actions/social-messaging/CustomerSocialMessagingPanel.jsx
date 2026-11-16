import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { buildSocialMessageRecipients } from './customerSocialMessagingUtils'
import { SOCIAL_MESSAGE_CHANNELS } from './socialMessageChannels'
import { SocialMessageComposer } from './SocialMessageComposer'
import { SocialMessageDialogFooter } from './SocialMessageDialogFooter'
import { SocialMessageHelpText } from './SocialMessageHelpText'
import { SocialMessageRecipientsPreview } from './SocialMessageRecipientsPreview'
import { useTranslation } from 'react-i18next'

export function CustomerSocialMessagingPanel({
  customers = [],
  channelId,
  isOpen = false,
  onClose,
  onSendMessage,
}) {
  const { t } = useTranslation()
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
      toast.error(t('customers.socialMessaging.writeMessageFirst'))
      return
    }

    if (!recipients.length) {
      toast.error(t('customers.socialMessaging.noValidRecipients'))
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
        toast.success(t('customers.socialMessaging.prepared', { count: recipients.length }))
      } else {
        toast.info(t('customers.socialMessaging.notConnected', { count: recipients.length }))
      }

      setMessage('')
      onClose?.()
    } catch (error) {
      toast.error(error?.message || t('customers.socialMessaging.prepareFailed'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('customers.socialMessaging.dialogTitle', { channel: activeChannel.label })}
      description={t('customers.socialMessaging.dialogDescription', { count: recipients.length })}
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
