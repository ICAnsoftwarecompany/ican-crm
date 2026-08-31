import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { cn } from '../../../shared/utils/cn'
import { useMessengerNotificationsStore } from '../store/messengerNotificationsStore'

export function MessengerNavbarButton({ active = false, onClick }) {
  const location = useLocation()
  const unreadCount = useMessengerNotificationsStore((state) => state.unreadCount)
  const markAllRead = useMessengerNotificationsStore((state) => state.markAllRead)

  useEffect(() => {
    if (location.pathname.startsWith('/conversations')) {
      markAllRead()
    }
  }, [location.pathname, markAllRead])

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[#00C2CB] bg-[#E8F9FA]'
          : 'border-[#E5E7EB] bg-white hover:bg-[#E8F9FA]'
      )}
      aria-label="محادثات ماسنجر"
      title="فتح شات ماسنجر السريع"
    >
      <MessengerLogoIcon />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -end-1.5 min-w-5 h-5 rounded-full bg-[#EF4444] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export function MessengerLogoIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="messengerNavbarGradient" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#12C7FF" />
          <stop offset="0.52" stopColor="#2E88FF" />
          <stop offset="1" stopColor="#5A45FF" />
        </linearGradient>
        <linearGradient id="messengerNavbarBolt" x1="17" y1="21" x2="48" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F7FCFF" />
          <stop offset="1" stopColor="#D7ECFF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#messengerNavbarGradient)"
        d="M32 0C13.9 0 0 13.2 0 31.1c0 9.4 3.9 17.5 10.2 23L6.7 64l10.9-5.9A35.2 35.2 0 0 0 32 61.9c18.1 0 32-13.2 32-31.1S50.1 0 32 0Z"
      />
      <path
        fill="url(#messengerNavbarBolt)"
        d="M13.7 37.1 27.5 22c1.9-2.1 5.1-2.2 7.1-.1l8.1 8.5 11.5-6.2c2.9-1.6 6 1.9 3.8 4.4L44.2 43.7c-1.9 2.1-5.1 2.2-7.1.1L29 35.3l-11.5 6.2c-2.9 1.6-6-1.9-3.8-4.4Z"
      />
    </svg>
  )
}
