import { CalendarClock, Phone, StickyNote, Users } from 'lucide-react'

import { GmailLogoIcon } from '../../../conversations/components/GmailNavbarButton'
import { MessengerLogoIcon } from '../../../conversations/components/MessengerNavbarButton'
import { TruncatedText } from '../../../../shared/components/ui/TruncatedText'
import { cn } from '../../../../shared/utils/cn'

export function CardLine({ icon: Icon, label, text, dir, lines = 1 }) {
  if (!text) return null
  return (
    <div className="flex min-w-0 items-start gap-1.5 text-xs text-[var(--text-muted)]">
      {Icon ? <Icon size={12} className="mt-0.5 shrink-0" aria-hidden="true" /> : null}
      {label ? <span className="shrink-0 font-semibold">{label}:</span> : null}
      <TruncatedText text={text} lines={lines} dir={dir} className="text-[var(--text)]" />
    </div>
  )
}

export function NoteLine({ text }) {
  if (!text) return null
  return (
    <div className="flex min-w-0 items-start gap-1.5 rounded-md bg-[var(--surface-2)] px-1.5 py-1 text-xs text-[var(--text-muted)]">
      <StickyNote size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
      <TruncatedText text={text} lines={2} className="flex-1" />
    </div>
  )
}

export function NextActivityLine({ activity, text }) {
  if (!activity) return null
  const TypeIcon = activity.type === 'call' ? Phone : Users
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
      <CalendarClock size={12} className="shrink-0" aria-hidden="true" />
      <TypeIcon size={12} className="shrink-0" aria-hidden="true" />
      <TruncatedText text={activity.title ? `${text} · ${activity.title}` : text} className="flex-1" />
    </div>
  )
}

function ChannelButton({ icon, unreadCount, label, onClick, className }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={cn('relative inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--surface-2)]', className)}
      title={label}
      aria-label={label}
    >
      {icon}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -end-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#EF4444] px-0.5 text-[8px] font-black leading-none text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export function ChannelButtons({ channels, labels, onOpenMessenger, onOpenGmail }) {
  if (!channels?.messenger?.enabled && !channels?.gmail?.enabled) return null
  return (
    <span className="flex shrink-0 items-center gap-1">
      {channels.messenger?.enabled && (
        <ChannelButton
          icon={<MessengerLogoIcon size={13} />}
          unreadCount={channels.messenger.unreadCount}
          label={labels.messenger}
          onClick={onOpenMessenger}
          className="text-[#0A7CFF]"
        />
      )}
      {channels.gmail?.enabled && (
        <ChannelButton
          icon={<GmailLogoIcon size={13} />}
          unreadCount={channels.gmail.unreadCount}
          label={labels.gmail}
          onClick={onOpenGmail}
          className="text-[#D93025]"
        />
      )}
    </span>
  )
}

export function Chip({ text }) {
  if (!text) return null
  return (
    <span className="inline-flex max-w-[9rem] min-w-0 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-px text-[10px] font-bold text-[var(--text)]">
      <TruncatedText text={text} />
    </span>
  )
}
