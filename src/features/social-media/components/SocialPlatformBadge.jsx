import { useTranslation } from 'react-i18next'
import { getSocialPlatform } from '../config/socialPlatformsRegistry'

/**
 * Platform-agnostic badge — reads everything (icon, label) from the
 * registry by id. Never a Facebook-specific component; works for any
 * registered platform, available or not. See docs "Reusability".
 */
export function SocialPlatformBadge({ platform, className }) {
  const { t } = useTranslation()
  const definition = getSocialPlatform(platform)
  const Icon = definition?.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-bold text-[var(--text-muted)] ${className || ''}`}>
      {Icon && <Icon size={12} />}
      {definition ? t(definition.labelKey) : platform}
    </span>
  )
}
