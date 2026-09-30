import { useTranslation } from 'react-i18next'
import { Mail, MessageCircle, MessagesSquare, Send } from 'lucide-react'
import { useConversationUnreadSummary } from '../../conversations'
import { useChatUnreadCount } from '../../internal-chat'
import { MyWorkSectionCard } from '../components/MyWorkSectionCard'
import { MyWorkItemList, MyWorkItemRow } from '../components/MyWorkItemRow'

/** Unread customer messages per channel + unread team chat, each linking to its inbox. */
export function MessagesSection() {
  const { t } = useTranslation()
  const conversations = useConversationUnreadSummary()
  const chat = useChatUnreadCount()

  const rows = [
    { id: 'whatsapp', icon: MessageCircle, count: conversations.counts.whatsapp, to: '/conversations?channel=whatsapp' },
    { id: 'messenger', icon: Send, count: conversations.counts.messenger, to: '/conversations' },
    { id: 'gmail', icon: Mail, count: conversations.counts.gmail, to: '/conversations?channel=gmail' },
    { id: 'teamChat', icon: MessagesSquare, count: chat.unreadCount, to: '/team-chat' },
  ]
  const total = rows.reduce((sum, row) => sum + row.count, 0)

  return (
    <MyWorkSectionCard
      id="messages"
      icon={MessagesSquare}
      title={t('myWork.sections.messages.title')}
      count={total}
      isLoading={conversations.isLoading && chat.isLoading}
      error={conversations.error && chat.error ? conversations.error : null}
      onRetry={() => {
        conversations.refetch()
        chat.refetch()
      }}
    >
      <MyWorkItemList>
        {rows.map((row) => (
          <MyWorkItemRow
            key={row.id}
            to={row.to}
            icon={row.icon}
            title={t(`myWork.sections.messages.channels.${row.id}`)}
            meta={row.count ? t('myWork.sections.messages.unread', { count: row.count }) : t('myWork.sections.messages.none')}
            time={row.count ? String(row.count) : ''}
            overdue={row.count > 0}
          />
        ))}
      </MyWorkItemList>
    </MyWorkSectionCard>
  )
}
