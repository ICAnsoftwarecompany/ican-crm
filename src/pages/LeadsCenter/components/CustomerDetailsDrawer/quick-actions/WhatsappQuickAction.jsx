import { WhatsappLogoIcon } from '../../../../../features/conversations/components/WhatsappNavbarButton'
import { QuickActionButton } from './QuickActionButton'
import { useTranslation } from 'react-i18next'

export function WhatsappQuickAction({ onOpenChat }) {
  const { t } = useTranslation()
  return (
    <QuickActionButton
      icon={<WhatsappLogoIcon size={18} />}
      label={t('customers.socialMessaging.channels.whatsapp')}
      accentClassName="px-2"
      onClick={() => onOpenChat?.('whatsapp')}
      hideLabel
    />
  )
}
