import { cn } from '../../../../../shared/utils/cn'
import { SocialChannelBadge } from './SocialChannelBadge'

export function SocialChannelButton({ channel, disabled = false, onClick, compact = false }) {
  const label = disabled ? 'اختر عميلا محتملا واحدا على الأقل لفتح صندوق الرسالة' : `كتابة رسالة ${channel.label}`

  return (
    <button
      type="button"
      onClick={() => onClick?.(channel.id)}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        'border-[#D7EEF0] bg-white text-[var(--text)] hover:bg-[#F8FEFF]',
        compact && 'w-full justify-center px-2'
      )}
      title={label}
      aria-label={label}
    >
      <SocialChannelBadge channel={channel} />
      <span>{channel.label}</span>
    </button>
  )
}
