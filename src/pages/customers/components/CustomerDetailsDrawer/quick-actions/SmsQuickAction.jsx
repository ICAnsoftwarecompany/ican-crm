import { MessageSquareText } from 'lucide-react'

import { QuickActionButton } from './QuickActionButton'

export function SmsQuickAction({ onOpenChat }) {
  return (
    <QuickActionButton
      icon={MessageSquareText}
      label="SMS"
      accentClassName="text-[#B45309]"
      onClick={() => onOpenChat?.('sms')}
    />
  )
}
