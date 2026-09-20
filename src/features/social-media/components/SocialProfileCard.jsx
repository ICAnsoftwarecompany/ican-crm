import { useTranslation } from 'react-i18next'
import { RefreshCcw } from 'lucide-react'
import { Avatar } from '../../../shared/components/ui/Avatar'
import { Badge } from '../../../shared/components/ui/Badge'
import { SocialPlatformBadge } from './SocialPlatformBadge'
import { formatMetric, formatContentDateTime } from '../utils/socialFormatters'

const CONNECTION_VARIANT = {
  connected: 'success',
  disconnected: 'default',
  expired: 'warning',
  error: 'danger',
}

/**
 * Platform-agnostic — takes a normalized `SocialProfile` (see
 * socialAdapterContract.js), never a raw Facebook page object. Works
 * identically once Instagram/TikTok/Snapchat adapters exist.
 */
export function SocialProfileCard({ profile, onOpen }) {
  const { t, i18n } = useTranslation()

  return (
    <button
      type="button"
      onClick={() => onOpen?.(profile)}
      className="flex w-full flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-start transition-colors hover:bg-[var(--surface-2)]"
    >
      <div className="flex items-center gap-3">
        <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[var(--text)]">{profile.name}</p>
          <SocialPlatformBadge platform={profile.platform} />
        </div>
        <Badge variant={CONNECTION_VARIANT[profile.connectionStatus] || 'default'}>
          {t(`socialMedia.connectionStatus.${profile.connectionStatus}`)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[var(--text-muted)]">{t('socialMedia.profile.followers')}</p>
          <p className="font-bold text-[var(--text)]" dir="ltr">{formatMetric(profile.followers, i18n.language)}</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)]">{t('socialMedia.profile.contentCount')}</p>
          <p className="font-bold text-[var(--text)]" dir="ltr">{formatMetric(profile.contentCount, i18n.language)}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-light)]">
        <RefreshCcw size={11} />
        {t('socialMedia.profile.lastSync')}: <span dir="ltr">{formatContentDateTime(profile.lastSyncAt, i18n.language)}</span>
      </div>
    </button>
  )
}
