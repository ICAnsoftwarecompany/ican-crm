import { MessengerLogoIcon } from '../../../../../features/conversations/components/MessengerNavbarButton'
import { useMessengerNotificationsStore } from '../../../../../features/conversations/store/messengerNotificationsStore'
import { QuickActionButton } from './QuickActionButton'

export function MessengerQuickAction({ onOpenChat }) {
  const unreadCount = useMessengerNotificationsStore((state) => state.unreadCount)

  return (
    <QuickActionButton
      icon={<MessengerLogoIcon size={16} />}
      label="ماسنجر"
      badgeContent={unreadCount > 99 ? '99+' : unreadCount || null}
      hideLabel={true}
      alert={unreadCount > 0}
      alertTitle={unreadCount > 0 ? `لديك ${unreadCount > 99 ? '99+' : unreadCount} رسالة غير مقروءة في ماسنجر` : undefined}

      accentClassName="text-[#0A7CFF]"
      onClick={() => onOpenChat?.('messenger')}
    />
  )
}
