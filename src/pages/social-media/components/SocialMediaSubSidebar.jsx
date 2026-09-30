import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Gauge, Users, Image as ImageIcon, CalendarRange, BarChart3 } from 'lucide-react'
import { SOCIAL_NAV_ITEMS } from '../../../features/social-media/config/socialCapabilities'
import { getVisibleSocialPlatforms } from '../../../features/social-media/config/socialPlatformsRegistry'
import { SubSidebar } from '../../../shared/components/sub-sidebar'

const NAV_ICONS = { overview: Gauge, profiles: Users, content: ImageIcon, planner: CalendarRange, analytics: BarChart3 }

/**
 * Social Media's own internal navigation — config-driven (`SOCIAL_NAV_ITEMS`
 * + `socialPlatformsRegistry`), rendered by the shared sub-sidebar (2026-10-01).
 * Two groups: cross-platform pages, then Platforms (every registered platform
 * shows here regardless of `available` — an unavailable one still routes, just
 * to its "not connected yet" page).
 */
export function SocialMediaSubSidebar({ enabledModules, collapsed = false, onToggleCollapse, onNavigate, framed = true }) {
  const { t, i18n } = useTranslation()
  const ChevronIcon = i18n.dir() === 'rtl' ? ChevronLeft : ChevronRight
  const platforms = getVisibleSocialPlatforms(enabledModules)

  const groups = [
    {
      id: 'overview',
      label: t('socialMedia.center.overviewGroup'),
      items: SOCIAL_NAV_ITEMS.map((item) => ({
        id: item.id,
        to: `/social-media${item.path ? `/${item.path}` : ''}`,
        end: !item.path,
        label: t(item.labelKey),
        icon: NAV_ICONS[item.id] || Gauge,
      })),
    },
    {
      id: 'platforms',
      label: t('socialMedia.center.platformsGroup'),
      items: platforms.map((platform) => ({
        id: platform.id,
        to: `/social-media/${platform.id}`,
        label: t(platform.labelKey),
        icon: platform.icon,
        badge: platform.available ? undefined : t('socialMedia.platforms.comingSoon'),
        trailing: <ChevronIcon size={13} className="shrink-0 text-[var(--text-light)]" />,
      })),
    },
  ]

  return (
    <SubSidebar
      variant={framed ? 'framed' : 'plain'}
      header={{
        title: t('socialMedia.center.title'),
        expandLabel: t('socialMedia.center.openNavigation'),
        collapseLabel: t('socialMedia.center.closeNavigation'),
      }}
      ariaLabel={t('socialMedia.center.navigation')}
      groups={groups}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      onNavigate={onNavigate}
    />
  )
}
