import { cn } from '../../../../../shared/utils/cn'
import { SocialChannelBadge } from './SocialChannelBadge'
import { useTranslation } from 'react-i18next'

export function SocialChannelButton({ channel, disabled = false, onClick, compact = false }) {
  const { t } = useTranslation()
  const label = disabled ? t('customers.socialMessaging.selectAtLeastOne') : t('customers.socialMessaging.writeChannelMessage', { channel: channel.label })

  return (
    <button
      type="button"
      onClick={() => onClick?.(channel.id)}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]',
        compact && 'justify-self-center'
      )}
      title={label}
      aria-label={label}
    >
      <SocialChannelBadge channel={channel} />
      <span className="sr-only">{channel.label}</span>
    </button>
  )
}
