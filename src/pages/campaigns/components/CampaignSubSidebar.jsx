import { useMemo, useState } from 'react'
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Megaphone,
  PlusCircle,
  Settings,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CAMPAIGN_NAV_ITEMS, platformHasCapability, userHasCampaignPermission } from '../../../features/campaigns'
import {
  SubSidebarFooter,
  SubSidebarFrame,
  SubSidebarHeader,
  SubSidebarNav,
  SubSidebarNavItem,
} from '../../../shared/components/sub-sidebar'
import { cn } from '../../../shared/utils/cn'

const NAV_ICONS = {
  overview: Gauge,
  create: PlusCircle,
  list: Megaphone,
  analytics: BarChart3,
  billing: WalletCards,
}

const CONNECTION_DOT = {
  connected: 'bg-emerald-500',
  expired: 'bg-amber-500',
  needsAttention: 'bg-amber-500',
}

/**
 * Campaign Center navigation: expandable platform rows (with connection dot) over the shared
 * sub-sidebar building blocks (2026-10-01). The expandable rows are the only custom part.
 */
export function CampaignSubSidebar({ platforms, activePlatformId, permissions, connectionByPlatform, onNavigate, collapsed = false, onToggleCollapse, framed = true }) {
  const { t, i18n } = useTranslation()
  const [expanded, setExpanded] = useState(activePlatformId || platforms[0]?.id)
  const CollapseIcon = i18n.dir() === 'rtl' ? ChevronLeft : ChevronRight
  const visibleNavByPlatform = useMemo(() => Object.fromEntries(platforms.map((platform) => [
    platform.id,
    CAMPAIGN_NAV_ITEMS.filter((item) => platformHasCapability(platform, item.capability) && userHasCampaignPermission(item.permission, permissions)),
  ])), [permissions, platforms])

  const settingsItem = {
    id: 'integration-settings',
    to: '/settings/integrations',
    label: t('campaigns.center.integrationSettings'),
    icon: Settings,
  }

  return (
    <SubSidebarFrame variant={framed ? 'framed' : 'plain'} collapsed={collapsed} ariaLabel={t('campaigns.center.title')}>
      <SubSidebarHeader
        icon={Megaphone}
        title={t('campaigns.center.title')}
        description={t('campaigns.center.sidebarDescription')}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse || onNavigate}
        expandLabel={t('campaigns.center.openNavigation')}
        collapseLabel={t('campaigns.center.closeNavigation')}
      />

      <SubSidebarNav collapsed={collapsed} ariaLabel={t('campaigns.center.platformNavigation')}>
        <section className="space-y-1">
          {!collapsed && <h3 className="px-2 text-[11px] font-bold text-[var(--text-light)]">{t('campaigns.center.platforms')}</h3>}
          {platforms.map((platform) => {
            const Icon = platform.icon
            const isExpanded = expanded === platform.id
            const isActive = activePlatformId === platform.id
            const connection = connectionByPlatform[platform.id] || 'disconnected'
            return (
              <div key={platform.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => (collapsed && onToggleCollapse ? onToggleCollapse() : setExpanded((current) => (current === platform.id ? null : platform.id)))}
                  title={collapsed ? t(platform.labelKey) : undefined}
                  className={cn(
                    'group flex w-full items-center rounded-md text-start text-sm transition-colors',
                    collapsed ? 'h-10 justify-center px-0' : 'gap-2.5 px-2.5 py-2',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]',
                    isActive ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                  )}
                  aria-expanded={isExpanded}
                >
                  <Icon size={16} className={isActive ? 'text-brand-accent' : 'text-[var(--text-muted)]'} />
                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1 truncate">{t(platform.labelKey)}</span>
                      <span className={cn('h-2 w-2 rounded-full', CONNECTION_DOT[connection] || 'bg-slate-400')} title={t(`campaigns.connection.${connection}`)} />
                      {isExpanded ? <ChevronDown size={15} /> : <CollapseIcon size={15} />}
                    </>
                  )}
                </button>

                {isExpanded && !collapsed && (
                  <div className="space-y-1">
                    {visibleNavByPlatform[platform.id].map((item) => (
                      <SubSidebarNavItem
                        key={item.id}
                        onNavigate={onNavigate}
                        item={{
                          id: `${platform.id}-${item.id}`,
                          to: `/campaigns/${platform.id}${item.path ? `/${item.path}` : ''}`,
                          end: !item.path,
                          label: t(item.labelKey),
                          icon: NAV_ICONS[item.id] || Megaphone,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </SubSidebarNav>

      <SubSidebarFooter items={[settingsItem]} collapsed={collapsed} onNavigate={onNavigate} />
    </SubSidebarFrame>
  )
}
