import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { useNotificationCenterStore } from '../../notifications'

export function GmailNavbarButton({ active = false, onClick }) {
  const location = useLocation()
  const unreadCount = useNotificationCenterStore((state) => (
    state.items.filter((item) => item.channel === 'gmail' && !item.read).length
  ))
  const markChannelRead = useNotificationCenterStore((state) => state.markChannelRead)
  const isGmailConversationsPage = location.pathname.startsWith('/conversations')
    && new URLSearchParams(location.search).get('channel') === 'gmail'

  useEffect(() => {
    if (active || isGmailConversationsPage) {
      markChannelRead('gmail')
    }
  }, [active, isGmailConversationsPage, markChannelRead])

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[#D93025] bg-[#FCE8E6]'
          : 'border-[#E5E7EB] bg-white hover:bg-[#FCE8E6]'
      )}
      aria-label="محادثات Gmail"
      title="فتح Gmail السريع"
    >
      <GmailLogoIcon size={21} />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -end-1.5 min-w-5 h-5 rounded-full bg-[#EF4444] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export function GmailLogoIcon({ size = 22 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md bg-white"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Mail size={Math.max(14, size - 5)} className="text-[#D93025]" />
    </span>
  )
}
