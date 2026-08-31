import { GmailLogoIcon } from '../../../../../features/conversations/components/GmailNavbarButton'
import { QuickActionButton } from './QuickActionButton'

export function EmailQuickAction({ onOpenChat }) {
  return (
    <QuickActionButton
      icon={<GmailLogoIcon size={18} />}
      label="ميل"
      accentClassName="px-2"
      onClick={() => onOpenChat?.('mail')}
      hideLabel
    />
  )
}
