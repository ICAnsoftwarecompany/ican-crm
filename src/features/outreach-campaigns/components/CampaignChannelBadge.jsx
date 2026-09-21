import { useTranslation } from 'react-i18next'
import { getChannelDefinition, UNKNOWN_CHANNEL_ICON } from '../config/campaignChannels'

/**
 * Channel identification MUST NOT rely on color alone (accessibility
 * requirement in the spec) — always paired with the channel's brand icon
 * and its translated label.
 */
export function CampaignChannelBadge({ channel, size = 16 }) {
  const { t } = useTranslation()
  const definition = getChannelDefinition(channel)
  const Icon = definition?.icon || UNKNOWN_CHANNEL_ICON
  const label = definition ? t(definition.labelKey) : (channel || t('outreachCampaigns.channels.unknown'))

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium font-arabic"
      style={{
        borderColor: definition ? `${definition.accent}55` : 'var(--border)',
        color: definition ? definition.accent : 'var(--text-muted)',
        background: definition ? `${definition.accent}14` : 'var(--surface-2)',
      }}
    >
      <Icon size={size} />
      {label}
    </span>
  )
}
