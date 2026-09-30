import { useMemo } from 'react'
import { useMessengerConversations } from './useConversations'
import { useGmailConversations, useGmailMailboxes } from './useGmailConversations'
import { useWhatsappConversations } from './useWhatsappConversations'

// Same list params as ConversationsPage's channel tabs, so both read the same React Query cache.
const LIST_PARAMS = { per_page: 30 }

function sumUnread(conversations = []) {
  return conversations.reduce((total, conversation) => total + Number(conversation?.unread_count || 0), 0)
}

/**
 * Unread message counts per customer channel (added 2026-10-01 for features/my-work), plus the
 * loaded conversation lists per channel (used by the Conversations reports page).
 * Gmail is only queried when at least one mailbox is connected.
 */
export function useConversationUnreadSummary() {
  const messenger = useMessengerConversations(LIST_PARAMS)
  const mailboxes = useGmailMailboxes(undefined, { staleTime: 60 * 1000 })
  const hasGmail = (mailboxes.data || []).length > 0
  const gmail = useGmailConversations(LIST_PARAMS, { enabled: hasGmail, staleTime: 30 * 1000 })
  const whatsapp = useWhatsappConversations(LIST_PARAMS, { staleTime: 30 * 1000 })

  const counts = useMemo(() => {
    const byChannel = {
      whatsapp: sumUnread(whatsapp.data || []),
      messenger: sumUnread(messenger.data || []),
      gmail: hasGmail ? sumUnread(gmail.data || []) : 0,
    }
    return { ...byChannel, total: byChannel.whatsapp + byChannel.messenger + byChannel.gmail }
  }, [gmail.data, hasGmail, messenger.data, whatsapp.data])

  const lists = useMemo(() => ({
    whatsapp: whatsapp.data || [],
    messenger: messenger.data || [],
    gmail: hasGmail ? gmail.data || [] : [],
  }), [gmail.data, hasGmail, messenger.data, whatsapp.data])

  return {
    counts,
    lists,
    isLoading: messenger.isLoading || whatsapp.isLoading,
    error: messenger.error && whatsapp.error ? messenger.error : null,
    refetch: () => {
      messenger.refetch()
      whatsapp.refetch()
      if (hasGmail) gmail.refetch()
    },
  }
}
