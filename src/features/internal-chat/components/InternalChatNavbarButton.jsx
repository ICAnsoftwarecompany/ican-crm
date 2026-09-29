import { MessagesSquare } from 'lucide-react'

import { cn } from '../../../shared/utils/cn'
import { useChatUnreadCount } from '../hooks/useChatUnreadCount'

export function InternalChatNavbarButton({ active = false, onClick }) {
  const unreadQuery = useChatUnreadCount({ per_page: 30 })
  const unreadCount = Number(unreadQuery.unreadCount || 0)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
      )}
      aria-label="الشات الداخلي"
      title="فتح الشات الداخلي"
    >
      <MessagesSquare size={16} className="text-[var(--text)]" />
      {unreadCount > 0 ? (
        <span className="absolute -top-1.5 -end-1.5 min-w-5 h-5 rounded-full bg-[#EF4444] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </button>
  )
}
