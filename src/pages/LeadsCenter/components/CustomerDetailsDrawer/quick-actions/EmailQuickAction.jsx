import { GmailLogoIcon } from '../../../../../features/conversations/components/GmailNavbarButton'
import { QuickActionButton } from './QuickActionButton'
import { useTranslation } from 'react-i18next'

export function EmailQuickAction({ onOpenChat }) {
  const { t } = useTranslation()
  return (
    <QuickActionButton
      icon={<GmailLogoIcon size={18} />}
      label={t('customers.quickActions.email')}
      accentClassName="px-2"
      onClick={() => onOpenChat?.('mail')}
      hideLabel
    />
  )
}
