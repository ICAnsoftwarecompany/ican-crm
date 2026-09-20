import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Settings,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CAMPAIGN_NAV_ITEMS, platformHasCapability, userHasCampaignPermission } from '../../../features/campaigns'
import { cn } from '../../../shared/utils/cn'

const NAV_ICONS = {
  overview: Gauge,
  create: PlusCircle,
  list: Megaphone,
  analytics: BarChart3,
  billing: WalletCards,
}

export function CampaignSubSidebar({ platforms, activePlatformId, permissions, connectionByPlatform, onNavigate, collapsed = false, onToggleCollapse }) {
  const { t, i18n } = useTranslation()
  const [expanded, setExpanded] = useState(activePlatformId || platforms[0]?.id)
  const isRtl = i18n.dir() === 'rtl'
  const CollapseIcon = isRtl ? ChevronLeft : ChevronRight
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose
  const visibleNavByPlatform = useMemo(() => Object.fromEntries(platforms.map((platform) => [
    platform.id,
    CAMPAIGN_NAV_ITEMS.filter((item) => platformHasCapability(platform, item.capability) && userHasCampaignPermission(item.permission, permissions)),
  ])), [permissions, platforms])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-e border-[var(--border)] bg-[var(--surface)]">
      <div className={cn('border-b border-[var(--border)] p-3', collapsed && 'px-2')}>
        <div className={cn('flex items-center gap-3', collapsed && 'flex-col justify-center gap-2')}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80] dark:bg-cyan-950 dark:text-cyan-200">
            <Megaphone size={19} />
          </div>
          {!collapsed && <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-[var(--text)]">{t('campaigns.center.title')}</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{t('campaigns.center.sidebarDescription')}</p>
          </div>}
          <button type="button" onClick={onToggleCollapse || onNavigate} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label={t(collapsed ? 'campaigns.center.openNavigation' : 'campaigns.center.closeNavigation')}>
            <ToggleIcon size={16} />
          </button>
        </div>
      </div>

      <nav className={cn('scrollbar-thin flex-1 overflow-y-auto', collapsed ? 'space-y-3 px-2 py-10' : 'space-y-5 p-3')} aria-label={t('campaigns.center.platformNavigation')}>
        <section className="space-y-1">
          {!collapsed && <h3 className="px-2 text-[11px] font-bold text-[var(--text-light)]">{t('campaigns.center.platforms')}</h3>}
          {platforms.map((platform) => {
            const Icon = platform.icon
            const isExpanded = expanded === platform.id
            const connection = connectionByPlatform[platform.id] || 'disconnected'
            return (
              <div key={platform.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => collapsed && onToggleCollapse ? onToggleCollapse() : setExpanded((current) => current === platform.id ? null : platform.id)}
                  title={collapsed ? t(platform.labelKey) : undefined}
                  className={cn(
                    'group flex w-full items-center rounded-md text-start text-sm transition-colors',
                    collapsed ? 'h-10 justify-center px-0' : 'gap-2.5 px-2.5 py-2',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
                    activePlatformId === platform.id ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                  )}
                  aria-expanded={isExpanded}
                >
                  <Icon size={16} className={activePlatformId === platform.id ? 'text-[#00A8B0]' : 'text-[var(--text-muted)]'} />
                  {!collapsed && <><span className="min-w-0 flex-1 truncate">{t(platform.labelKey)}</span><span className={cn('h-2 w-2 rounded-full', connection === 'connected' ? 'bg-emerald-500' : connection === 'expired' || connection === 'needsAttention' ? 'bg-amber-500' : 'bg-slate-400')} title={t(`campaigns.connection.${connection}`)} />{isExpanded ? <ChevronDown size={15} /> : <CollapseIcon size={15} />}</>}
                </button>

                {isExpanded && !collapsed && (
                  <div className="space-y-1">
                    {visibleNavByPlatform[platform.id].map((item) => {
                      const ItemIcon = NAV_ICONS[item.id] || Megaphone
                      return (
                        <NavLink
                          key={item.id}
                          to={`/campaigns/${platform.id}${item.path ? `/${item.path}` : ''}`}
                          end={!item.path}
                          onClick={onNavigate}
                          className={({ isActive }) => cn(
                            'group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
                            isActive ? 'bg-[var(--surface-2)] font-semibold text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                          )}
                        >
                          {({ isActive }) => <><span className={cn('absolute inset-y-2 start-0 w-0.5 rounded-full bg-[#00C2CB] opacity-0', isActive && 'opacity-100')} /><ItemIcon size={16} className={isActive ? 'text-[#00A8B0]' : 'text-[var(--text-muted)]'} /><span className="truncate">{t(item.labelKey)}</span></>}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </nav>

      <div className={cn('border-t border-[var(--border)] p-3', collapsed && 'px-2')}>
        <NavLink to="/settings/integrations" onClick={onNavigate} title={collapsed ? t('campaigns.center.integrationSettings') : undefined} className={cn('group relative flex items-center rounded-md text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]', collapsed ? 'h-10 justify-center px-0' : 'gap-2.5 px-2.5 py-2')}>
          <Settings size={16} />
          {!collapsed && <span className="truncate">{t('campaigns.center.integrationSettings')}</span>}
        </NavLink>
      </div>
    </div>
  )
}
