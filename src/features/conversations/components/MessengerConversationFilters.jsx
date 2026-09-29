import { EyeOff, Link2Off, Lock, RotateCcw, UserRound } from 'lucide-react'
import { filterConversations } from '../utils/conversationHelpers'

export const DEFAULT_MESSENGER_CONVERSATION_FILTERS = {
  unreadOnly: false,
  unlinkedOnly: false,
  assignedUserId: 'all',
  closedOnly: false,
}

function normalizeSearch(value = '') {
  return String(value || '').trim().toLowerCase()
}

function getAssignedUserId(conversation = {}) {
  return String(
    conversation.assigned_user?.id ||
    conversation.assignedUser?.id ||
    conversation.assigned_user_id ||
    ''
  )
}

function getAssignedUserName(conversation = {}) {
  return (
    conversation.assigned_user?.name ||
    conversation.assignedUser?.name ||
    conversation.assigned_user_name ||
    ''
  )
}

function isConversationClosed(conversation = {}) {
  return String(conversation.status || '').toLowerCase() === 'closed'
}

function hasLinkedCustomer(conversation = {}) {
  return Boolean(conversation.customer || conversation.customer_id || conversation.customerId)
}

export function getMessengerAssignedUserOptions(conversations = []) {
  const users = new Map()

  conversations.forEach((conversation) => {
    const id = getAssignedUserId(conversation)
    const name = getAssignedUserName(conversation)
    if (!id && !name) return

    const key = id || name
    if (!users.has(key)) {
      users.set(key, {
        id: key,
        name: name || `User #${id}`,
      })
    }
  })

  return Array.from(users.values())
}

export function filterMessengerConversations(conversations = [], query = '', filters = DEFAULT_MESSENGER_CONVERSATION_FILTERS) {
  return filterConversations(conversations, query, filters, {
    isLinked: hasLinkedCustomer,
    isClosed: isConversationClosed,
    getAssignedUser: (conversation) => ({
      id: getAssignedUserId(conversation),
      name: getAssignedUserName(conversation),
    }),
    matchesQuery: (conversation, normalizedQuery) => {
      const title = normalizeSearch(
        conversation.contact?.name ||
        conversation.customer?.name ||
        conversation.name ||
        conversation.contact?.phone ||
        conversation.customer?.phone
      )
      const subtitle = normalizeSearch(
        conversation.last_message?.body ||
        conversation.last_message?.text ||
        conversation.contact?.email ||
        conversation.customer?.email ||
        conversation.assigned_user?.name
      )

      return title.includes(normalizedQuery) || subtitle.includes(normalizedQuery)
    },
  })
}

function FilterButton({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex h-8 items-center gap-1 rounded-lg border px-2 text-[11px] font-black transition',
        active
          ? 'border-[#00A8B0] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--brand-accent)] hover:bg-[var(--surface-2)]',
      ].join(' ')}
    >
      <Icon size={13} />
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span className={active ? 'text-[var(--brand-accent)]' : 'text-[var(--text-muted)]'}>{count}</span>
      ) : null}
    </button>
  )
}

export function MessengerConversationFilters({
  conversations = [],
  filters,
  onChange,
  resultCount = 0,
  className = '',
}) {
  const value = { ...DEFAULT_MESSENGER_CONVERSATION_FILTERS, ...(filters || {}) }
  const assignedUsers = getMessengerAssignedUserOptions(conversations)
  const unreadCount = conversations.filter((conversation) => Number(conversation.unread_count || 0) > 0).length
  const unlinkedCount = conversations.filter((conversation) => !hasLinkedCustomer(conversation)).length
  const closedCount = conversations.filter(isConversationClosed).length
  const hasActiveFilters = value.unreadOnly || value.unlinkedOnly || value.closedOnly || value.assignedUserId !== 'all'

  const update = (patch) => onChange?.({ ...value, ...patch })
  const reset = () => onChange?.(DEFAULT_MESSENGER_CONVERSATION_FILTERS)

  return (
    <div className={`space-y-2 border-b border-[var(--border)] bg-[var(--surface)] p-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <FilterButton
          active={value.unreadOnly}
          icon={EyeOff}
          label="غير مرئي"
          count={unreadCount}
          onClick={() => update({ unreadOnly: !value.unreadOnly })}
        />
        <FilterButton
          active={value.unlinkedOnly}
          icon={Link2Off}
          label="بدون عميل"
          count={unlinkedCount}
          onClick={() => update({ unlinkedOnly: !value.unlinkedOnly })}
        />
        <FilterButton
          active={value.closedOnly}
          icon={Lock}
          label="مغلقة"
          count={closedCount}
          onClick={() => update({ closedOnly: !value.closedOnly })}
        />
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 text-[11px] font-black text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            <RotateCcw size={13} />
            مسح
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <label className="relative block">
          <UserRound size={14} className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <select
            value={value.assignedUserId}
            onChange={(event) => update({ assignedUserId: event.target.value })}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] ps-8 pe-2 text-xs font-black text-[var(--text)] outline-none transition focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
          >
            <option value="all">كل المستخدمين</option>
            {assignedUsers.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>
        <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-[10px] font-black text-[var(--text-muted)]">
          {resultCount}/{conversations.length}
        </span>
      </div>
    </div>
  )
}
