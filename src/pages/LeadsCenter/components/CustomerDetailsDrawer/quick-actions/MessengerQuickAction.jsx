import { MessengerLogoIcon } from '../../../../../features/conversations/components/MessengerNavbarButton'
import { useMessengerNotificationsStore } from '../../../../../features/conversations/store/messengerNotificationsStore'
import { QuickActionButton } from './QuickActionButton'
import { useTranslation } from 'react-i18next'

export function MessengerQuickAction({ onOpenChat }) {
  const { t } = useTranslation()
  const unreadCount = useMessengerNotificationsStore((state) => state.unreadCount)

  return (
    <QuickActionButton
      icon={<MessengerLogoIcon size={16} />}
      label={t('customers.socialMessaging.channels.messenger')}
      badgeContent={unreadCount > 99 ? '99+' : unreadCount || null}
      hideLabel={true}
      alert={unreadCount > 0}
      alertTitle={unreadCount > 0 ? t('customers.quickActions.messengerUnread', { count: unreadCount > 99 ? '99+' : unreadCount }) : undefined}

      accentClassName="text-[#0A7CFF]"
      onClick={() => onOpenChat?.('messenger')}
    />
  )
}
