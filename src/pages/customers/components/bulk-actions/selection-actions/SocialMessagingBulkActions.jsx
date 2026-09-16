import { SocialChannelsList } from '../social-messaging/SocialChannelsList'
import { cn } from '../../../../../shared/utils/cn'

export function SocialMessagingBulkActions({ selectedCount = 0, disabled = false, onOpenChannel, compact = false }) {
  return (
    <div className={cn('rounded-xl border border-[#D7EEF0] bg-white p-3', compact && 'p-2')}>
      <SocialChannelsList disabled={disabled} onOpenChannel={onOpenChannel} compact={compact} />
    </div>
  )
}
