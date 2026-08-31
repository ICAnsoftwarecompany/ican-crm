import { WhatsappLogoIcon } from '../../../../../features/conversations/components/WhatsappNavbarButton'
import { QuickActionButton } from './QuickActionButton'

export function WhatsappQuickAction({ onOpenChat }) {
  return (
    <QuickActionButton
      icon={<WhatsappLogoIcon size={18} />}
      label="واتساب"
      accentClassName="px-2"
      onClick={() => onOpenChat?.('whatsapp')}
      hideLabel
    />
  )
}
