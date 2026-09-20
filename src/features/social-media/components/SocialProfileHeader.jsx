import { useTranslation } from 'react-i18next'
import { ExternalLink, RefreshCcw } from 'lucide-react'
import { Avatar } from '../../../shared/components/ui/Avatar'
import { Badge } from '../../../shared/components/ui/Badge'
import { Button } from '../../../shared/components/ui/Button'
import { SocialPlatformBadge } from './SocialPlatformBadge'
import { formatContentDateTime } from '../utils/socialFormatters'

const CONNECTION_VARIANT = {
  connected: 'success',
  disconnected: 'default',
  expired: 'warning',
  error: 'danger',
}

/**
 * Only shows fields the current integration actually provides (id,
 * status, last sync). Does not assume cover photo / follower count /
 * category exist — see docs section "Facebook Profile Header": those
 * require API fields this integration does not confirm today.
 */
export function SocialProfileHeader({ profile, permalink, onRefresh, isRefreshing }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={profile?.name} src={profile?.avatarUrl} size="xl" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-black text-[var(--text)]">{profile?.name}</h2>
            <SocialPlatformBadge platform={profile?.platform} />
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]" dir="ltr">{profile?.externalId}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant={CONNECTION_VARIANT[profile?.connectionStatus] || 'default'}>
              {t(`socialMedia.connectionStatus.${profile?.connectionStatus}`)}
            </Badge>
            <span className="text-[11px] text-[var(--text-light)]">
              {t('socialMedia.profile.lastSync')}: <span dir="ltr">{formatContentDateTime(profile?.lastSyncAt, i18n.language)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} loading={isRefreshing}>
            <RefreshCcw size={14} />
            {t('socialMedia.profile.refresh')}
          </Button>
        )}
        {permalink && (
          <Button variant="outline" size="sm" onClick={() => window.open(permalink, '_blank', 'noopener,noreferrer')}>
            <ExternalLink size={14} />
            {t('socialMedia.profile.openOnPlatform')}
          </Button>
        )}
      </div>
    </div>
  )
}
