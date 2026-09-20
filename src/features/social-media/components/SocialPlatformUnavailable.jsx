import { useTranslation } from 'react-i18next'
import { PackageX } from 'lucide-react'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { getSocialPlatform } from '../config/socialPlatformsRegistry'

/**
 * The honest state for a registered-but-not-yet-integrated platform (see
 * docs "Instagram / TikTok / Snapchat" — no fake posts, no fake metrics).
 * The moment a platform's registry entry flips `available: true` with a
 * real adapter, its route renders the real platform page instead — no
 * change needed here or in any shared component.
 */
export function SocialPlatformUnavailable({ platform }) {
  const { t } = useTranslation()
  const definition = getSocialPlatform(platform)
  const Icon = definition?.icon || PackageX

  return (
    <EmptyState
      icon={<Icon size={24} />}
      title={t('socialMedia.platformUnavailable.title', { platform: definition ? t(definition.labelKey) : platform })}
      description={t('socialMedia.platformUnavailable.description')}
    />
  )
}
