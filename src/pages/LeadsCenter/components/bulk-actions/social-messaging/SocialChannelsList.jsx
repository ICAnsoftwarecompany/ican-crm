import { SOCIAL_MESSAGE_CHANNELS } from './socialMessageChannels'
import { SocialChannelButton } from './SocialChannelButton'
import { cn } from '../../../../../shared/utils/cn'

export function SocialChannelsList({ disabled = false, onOpenChannel, compact = false }) {
  return (
    <div className={cn(compact ? 'grid grid-cols-2 gap-1.5' : 'flex flex-wrap items-center gap-1.5')}>
      {SOCIAL_MESSAGE_CHANNELS.map((channel) => (
        <SocialChannelButton
          key={channel.id}
          channel={channel}
          disabled={disabled}
          onClick={onOpenChannel}
          compact={compact}
        />
      ))}
    </div>
  )
}
