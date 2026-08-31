import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { cn } from '../../../shared/utils/cn'
import { useNotificationCenterStore } from '../../notifications'

export function WhatsappNavbarButton({ active = false, onClick }) {
  const location = useLocation()
  const unreadCount = useNotificationCenterStore((state) => (
    state.items.filter((item) => item.channel === 'whatsapp' && !item.read).length
  ))
  const markChannelRead = useNotificationCenterStore((state) => state.markChannelRead)
  const isWhatsappConversationsPage = location.pathname.startsWith('/conversations')
    && new URLSearchParams(location.search).get('channel') === 'whatsapp'

  useEffect(() => {
    if (active || isWhatsappConversationsPage) {
      markChannelRead('whatsapp')
    }
  }, [active, isWhatsappConversationsPage, markChannelRead])

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[#25D366] bg-[#E9FFF2]'
          : 'border-[#E5E7EB] bg-white hover:bg-[#E9FFF2]'
      )}
      aria-label="\u0645\u062d\u0627\u062f\u062b\u0627\u062a WhatsApp"
      title="\u0641\u062a\u062d WhatsApp \u0627\u0644\u0633\u0631\u064a\u0639"
    >
      <WhatsappLogoIcon size={21} />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -end-1.5 min-w-5 h-5 rounded-full bg-[#EF4444] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export function WhatsappLogoIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <circle cx="32" cy="32" r="30" fill="#25D366" />
      <path
        fill="#fff"
        d="M32.2 13.6c-10.1 0-18.3 8.1-18.3 18.1 0 3.2.9 6.4 2.5 9.1l-2.7 9.8 10.1-2.6c2.6 1.4 5.5 2.1 8.4 2.1 10.1 0 18.3-8.1 18.3-18.1S42.3 13.6 32.2 13.6Zm0 33.4c-2.6 0-5.1-.7-7.3-2.1l-.5-.3-6 1.6 1.6-5.8-.4-.6c-1.6-2.4-2.5-5.2-2.5-8.1 0-8.3 6.8-15 15.1-15s15.1 6.7 15.1 15-6.8 15.3-15.1 15.3Z"
      />
      <path
        fill="#fff"
        d="M40.5 35.8c-.5-.2-2.8-1.4-3.2-1.5-.4-.2-.8-.2-1.1.2-.3.5-1.2 1.5-1.5 1.8-.3.3-.5.4-1 .1-.5-.2-1.9-.7-3.6-2.2-1.3-1.2-2.2-2.6-2.5-3.1-.3-.5 0-.7.2-1 .2-.2.5-.5.7-.8.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8-.1-.2-1.1-2.6-1.5-3.6-.4-1-.8-.8-1.1-.8h-.9c-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 3.8s1.7 4.4 1.9 4.7c.2.3 3.3 5 7.9 7 1.1.5 2 .8 2.7 1 .1 0 .2.1.4.1 1 .3 1.9.2 2.6.1.8-.1 2.8-1.1 3.2-2.2.4-1.1.4-2 .3-2.2-.1-.2-.4-.3-.9-.5Z"
      />
    </svg>
  )
}
