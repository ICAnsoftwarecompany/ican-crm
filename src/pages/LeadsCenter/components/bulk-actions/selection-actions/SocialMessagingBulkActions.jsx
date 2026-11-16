import { SocialChannelsList } from '../social-messaging/SocialChannelsList'
import { cn } from '../../../../../shared/utils/cn'

export function SocialMessagingBulkActions({ selectedCount = 0, disabled = false, onOpenChannel, compact = false }) {
  return (
    <div className={cn('border-[var(--border)]', compact ? 'border-t pt-2' : 'border-s ps-2')}>
      <SocialChannelsList disabled={disabled} onOpenChannel={onOpenChannel} compact={compact} />
    </div>
  )
}
