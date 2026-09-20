import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Gauge, Users, Image as ImageIcon, CalendarRange, BarChart3, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { SOCIAL_NAV_ITEMS } from '../../../features/social-media/config/socialCapabilities'
import { getVisibleSocialPlatforms } from '../../../features/social-media/config/socialPlatformsRegistry'
import { cn } from '../../../shared/utils/cn'

const NAV_ICONS = { overview: Gauge, profiles: Users, content: ImageIcon, planner: CalendarRange, analytics: BarChart3 }

/**
 * Social Media's own internal navigation — config-driven (`SOCIAL_NAV_ITEMS`
 * + `socialPlatformsRegistry`), not hardcoded JSX (see docs "Social Media
 * Internal Navigation"). Two groups: cross-platform pages, then Platforms
 * (every registered platform shows here regardless of `available` — an
 * unavailable one still routes, just to its "not connected yet" page).
 */
export function SocialMediaSubSidebar({ enabledModules, collapsed = false, onToggleCollapse, onNavigate }) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  const CollapseIcon = isRtl ? ChevronLeft : ChevronRight
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose
  const platforms = getVisibleSocialPlatforms(enabledModules)

  const linkClass = ({ isActive }) =>
    cn(
      'group relative flex items-center rounded-md text-start text-sm transition-colors',
      collapsed ? 'h-10 justify-center px-0' : 'gap-2.5 px-2.5 py-2',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
      isActive ? 'bg-[var(--surface-2)] font-semibold text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
    )

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-e border-[var(--border)] bg-[var(--surface)]">
      <div className={cn('flex items-center border-b border-[var(--border)] p-3', collapsed ? 'justify-center px-2' : 'justify-between')}>
        {!collapsed && <h2 className="truncate text-sm font-bold text-[var(--text)]">{t('socialMedia.center.title')}</h2>}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          aria-label={t(collapsed ? 'socialMedia.center.openNavigation' : 'socialMedia.center.closeNavigation')}
        >
          <ToggleIcon size={16} />
        </button>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-3" aria-label={t('socialMedia.center.navigation')}>
        <section className="space-y-1">
          {!collapsed && <h3 className="px-2 text-[11px] font-bold text-[var(--text-light)]">{t('socialMedia.center.overviewGroup')}</h3>}
          {SOCIAL_NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.id] || Gauge
            return (
              <NavLink key={item.id} to={`/social-media${item.path ? `/${item.path}` : ''}`} end={!item.path} onClick={onNavigate} className={linkClass} title={collapsed ? t(item.labelKey) : undefined}>
                {({ isActive }) => (
                  <>
                    <span className={cn('absolute inset-y-2 start-0 w-0.5 rounded-full bg-[#00C2CB] opacity-0', isActive && 'opacity-100')} />
                    <Icon size={16} className={isActive ? 'text-[#00A8B0]' : 'text-[var(--text-muted)]'} />
                    {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                  </>
                )}
              </NavLink>
            )
          })}
        </section>

        <section className="space-y-1">
          {!collapsed && <h3 className="px-2 text-[11px] font-bold text-[var(--text-light)]">{t('socialMedia.center.platformsGroup')}</h3>}
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <NavLink key={platform.id} to={`/social-media/${platform.id}`} className={linkClass} title={collapsed ? t(platform.labelKey) : undefined}>
                {({ isActive }) => (
                  <>
                    <span className={cn('absolute inset-y-2 start-0 w-0.5 rounded-full bg-[#00C2CB] opacity-0', isActive && 'opacity-100')} />
                    <Icon size={16} className={isActive ? 'text-[#00A8B0]' : 'text-[var(--text-muted)]'} />
                    {!collapsed && (
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-1.5">
                        <span className="truncate">{t(platform.labelKey)}</span>
                        {!platform.available && <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-light)]">{t('socialMedia.platforms.comingSoon')}</span>}
                      </span>
                    )}
                    {collapsed ? null : <CollapseIcon size={13} className="shrink-0 text-[var(--text-light)]" />}
                  </>
                )}
              </NavLink>
            )
          })}
        </section>
      </nav>
    </div>
  )
}
