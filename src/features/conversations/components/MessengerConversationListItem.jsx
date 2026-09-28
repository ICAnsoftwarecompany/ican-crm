import { useState } from 'react'
import { CheckCheck, UserPlus, UserRound } from 'lucide-react'
import {
  getMessengerConversationId,
  getMessengerConversationSubtitle,
  getMessengerConversationTitle,
  getMessengerProfilePicture,
} from '../utils/messengerConversations'
import { MessengerConversationHoverPreview } from './MessengerConversationHoverPreview'

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ar-EG', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function isOutgoingLastMessage(conversation) {
  const lastMessage = conversation?.last_message || {}
  const direction = String(lastMessage?.direction || '').toLowerCase()
  return direction === 'outbound' || direction === 'outgoing'
}

function LastMessageStatus({ conversation }) {
  if (!isOutgoingLastMessage(conversation)) return null

  const status = String(conversation?.last_message?.status || '').toLowerCase()
  const isRead = status === 'read' || status === 'seen'
  const isDelivered = status === 'delivered'
  if (!isRead && !isDelivered) return null

  return (
    <CheckCheck
      size={14}
      className={isRead ? 'shrink-0 text-[#0A7CFF]' : 'shrink-0 text-[#94A3B8]'}
      aria-label={isRead ? 'seen' : 'delivered'}
    />
  )
}

function MessengerConversationAvatar({ conversation, className = 'h-10 w-10 rounded-lg' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getMessengerProfilePicture(conversation)
  const title = getMessengerConversationTitle(conversation)

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className={`${className} shrink-0 object-cover shadow-sm`}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <span className={`${className} inline-flex shrink-0 items-center justify-center bg-white text-[#00878D] shadow-sm`}>
      <UserRound size={18} />
    </span>
  )
}

export function MessengerConversationListItem({ conversation, isActive, onSelect, onConvertToLead, onToggleStatus }) {
  const id = getMessengerConversationId(conversation)
  const unreadCount = Number(conversation.unread_count || 0)
  const hasLinkedCustomer = Boolean(conversation?.customer)
  const assignedUserName = conversation?.assigned_user?.name || ''
  const isClosed = String(conversation?.status || '').toLowerCase() === 'closed'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(id)
        }
      }}
      className={[
        'group relative mb-2 w-full rounded-lg border p-3 text-start transition-colors',
        isActive
          ? 'border-[#00C2CB] bg-[#E8F9FA]'
          : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[#B8EFF2]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <MessengerConversationAvatar conversation={conversation} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-black text-[var(--text)]">
              {getMessengerConversationTitle(conversation)}
            </span>
            {isClosed ? (
              <span className="shrink-0 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-black text-[#B91C1C]">
                {'\u0645\u0646\u062a\u0647\u064a\u0629'}
              </span>
            ) : null}
            <span className="shrink-0 text-[10px] font-semibold text-[var(--text-muted)]">
              {formatTime(conversation.last_message_at)}
            </span>
          </span>
          <span className="mt-1 flex min-w-0 items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
            <LastMessageStatus conversation={conversation} />
            <span className="min-w-0 truncate">
              {getMessengerConversationSubtitle(conversation) || 'لا توجد معاينة للرسالة'}
            </span>
          </span>
          {assignedUserName ? (
            <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-[#475569]">
              <UserRound size={11} />
              <span className="truncate">المسؤول: {assignedUserName}</span>
            </span>
          ) : null}
        </span>
        {unreadCount > 0 && (
          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      {!hasLinkedCustomer ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onConvertToLead(conversation)
          }}
          className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-[11px] font-black text-[#007A80] transition hover:border-[#00C2CB] hover:bg-[#E8F9FA]"
        >
          <UserPlus size={13} />
          تحويل عميل محتمل
        </button>
      ) : null}
      {isClosed ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleStatus(conversation)
          }}
          className="mt-2 ms-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-[11px] font-black text-[#007A80] transition hover:border-[#00C2CB] hover:bg-[#E8F9FA]"
        >
          {'\u0641\u062a\u062d \u0645\u0631\u0629 \u0623\u062e\u0631\u0649'}
        </button>
      ) : null}
      <MessengerConversationHoverPreview conversation={conversation} />
    </div>
  )
}
