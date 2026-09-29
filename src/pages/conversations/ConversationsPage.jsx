import { Suspense, lazy, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMessengerConversations } from '../../features/conversations/hooks/useConversations'
import { GmailConversationsWorkspace } from '../../features/conversations/components/GmailConversationsWorkspace'
import { GmailLogoIcon } from '../../features/conversations/components/GmailNavbarButton'
import { MessengerConversationsWorkspace } from '../../features/conversations/components/MessengerConversationsWorkspace'
import { MessengerLogoIcon } from '../../features/conversations/components/MessengerNavbarButton'
import { WhatsappConversationsWorkspace } from '../../features/conversations/components/WhatsappConversationsWorkspace'
import { WhatsappLogoIcon } from '../../features/conversations/components/WhatsappNavbarButton'
import { useGmailConversations, useGmailMailboxes } from '../../features/conversations/hooks/useGmailConversations'
import { useWhatsappConversations } from '../../features/conversations/hooks/useWhatsappConversations'
import { usePageHeader } from '../../shared/hooks/usePageHeader'

// Customer Service: "Create case" in every thread header (docs/4-CUSTOMER-SERVICE.md, F1).
// Lazy so the Service area stays out of the conversations chunk.
const CreateCaseFromConversationButton = lazy(() =>
  import('../../features/service').then((module) => ({ default: module.CreateCaseFromConversationButton }))
)
const renderThreadHeaderActions = (details) => (
  <Suspense fallback={null}>
    <CreateCaseFromConversationButton details={details} />
  </Suspense>
)

function getUnreadTotal(conversations = []) {
  return conversations.reduce((total, conversation) => total + Number(conversation?.unread_count || 0), 0)
}

function ChannelUnreadBadge({ count, active, color = 'messenger' }) {
  if (!count) return null

  const activeClassName = color === 'gmail'
    ? 'bg-[#D93025] text-white'
    : color === 'whatsapp'
      ? 'bg-[#25D366] text-white'
      : 'bg-[#00A8B0] text-white'

  return (
    <span
      className={[
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black leading-none shadow-sm',
        active ? activeClassName : 'bg-[#EF4444] text-white',
      ].join(' ')}
      title={`${count} unread`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

function ConversationChannelTabs({ activeChannel, onChange, unreadCounts = {} }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('messenger')}
        className={[
          'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black transition',
          activeChannel === 'messenger'
            ? 'border-[#00C2CB] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
        ].join(' ')}
      >
        <MessengerLogoIcon size={20} />
        <ChannelUnreadBadge count={unreadCounts.messenger} active={activeChannel === 'messenger'} />
        ماسنجر
      </button>
      <button
        type="button"
        onClick={() => onChange('gmail')}
        className={[
          'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black transition',
          activeChannel === 'gmail'
            ? 'border-[#D93025] bg-[#FCE8E6] text-[#B3261E] dark:bg-[#3b2024] dark:text-[#fca5a5]'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
        ].join(' ')}
      >
        <GmailLogoIcon size={20} />
        Gmail
        <ChannelUnreadBadge count={unreadCounts.gmail} active={activeChannel === 'gmail'} color="gmail" />
      </button>
      <button
        type="button"
        onClick={() => onChange('whatsapp')}
        className={[
          'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black transition',
          activeChannel === 'whatsapp'
            ? 'border-[#25D366] bg-[#E9FFF2] text-[#087D3E] dark:bg-[#153a2a] dark:text-[#86efac]'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
        ].join(' ')}
      >
        <WhatsappLogoIcon size={20} />
        WhatsApp
        <ChannelUnreadBadge count={unreadCounts.whatsapp} active={activeChannel === 'whatsapp'} color="whatsapp" />
      </button>
    </div>
  )
}

export function ConversationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const channelParam = searchParams.get('channel')
  const activeChannel = channelParam === 'gmail' || channelParam === 'whatsapp' ? channelParam : 'messenger'
  const messengerUnreadQuery = useMessengerConversations({ per_page: 30 })
  const gmailMailboxesQuery = useGmailMailboxes(undefined, { staleTime: 60 * 1000 })
  const gmailMailboxes = gmailMailboxesQuery.data || []
  const gmailUnreadQuery = useGmailConversations({ per_page: 30 }, {
    enabled: gmailMailboxes.length > 0,
    staleTime: 30 * 1000,
  })
  const whatsappUnreadQuery = useWhatsappConversations({ per_page: 30 }, { staleTime: 30 * 1000 })
  const unreadCounts = useMemo(() => ({
    messenger: getUnreadTotal(messengerUnreadQuery.data || []),
    gmail: getUnreadTotal(gmailUnreadQuery.data || []),
    whatsapp: getUnreadTotal(whatsappUnreadQuery.data || []),
  }), [gmailUnreadQuery.data, messengerUnreadQuery.data, whatsappUnreadQuery.data])
  const HeaderChannelIcon = activeChannel === 'gmail'
    ? GmailLogoIcon
    : activeChannel === 'whatsapp'
      ? WhatsappLogoIcon
      : MessengerLogoIcon
  const pageTitle = activeChannel === 'gmail'
    ? '\u0645\u062d\u0627\u062f\u062b\u0627\u062a Gmail'
    : activeChannel === 'whatsapp'
      ? '\u0645\u062d\u0627\u062f\u062b\u0627\u062a WhatsApp'
      : '\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0645\u0627\u0633\u0646\u062c\u0631'

  usePageHeader({
    title: pageTitle,
    icon: HeaderChannelIcon,
  })

  const setChannel = (channel) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (channel === 'gmail') {
        next.set('channel', 'gmail')
        next.delete('conversation')
        next.delete('whatsappConversation')
      } else if (channel === 'whatsapp') {
        next.set('channel', 'whatsapp')
        next.delete('conversation')
        next.delete('gmailConversation')
      } else {
        next.delete('channel')
        next.delete('gmailConversation')
        next.delete('whatsappConversation')
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <ConversationChannelTabs activeChannel={activeChannel} onChange={setChannel} unreadCounts={unreadCounts} />
      {activeChannel === 'gmail'
        ? <GmailConversationsWorkspace threadHeaderActions={renderThreadHeaderActions} />
        : activeChannel === 'whatsapp'
          ? <WhatsappConversationsWorkspace threadHeaderActions={renderThreadHeaderActions} />
          : <MessengerConversationsWorkspace threadHeaderActions={renderThreadHeaderActions} />}
    </div>
  )
}
