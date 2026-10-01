import { MessageSquareText } from 'lucide-react'

import { QuickActionButton } from './QuickActionButton'
import { useTranslation } from 'react-i18next'

export function SmsQuickAction({ onOpenChat }) {
  const { t } = useTranslation()
  return (
    <QuickActionButton
      icon={MessageSquareText}
      label={t('customers.socialMessaging.channels.sms')}
      accentClassName="text-[#B45309]"
      onClick={() => onOpenChat?.('sms')}
    />
  )
}
