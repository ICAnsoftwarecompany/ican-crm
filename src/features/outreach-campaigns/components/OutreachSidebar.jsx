import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, ChartNoAxesCombined, List, Mail, MessageCircle, PanelLeftClose, PanelLeftOpen, Plus, Radio, Workflow } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { CAMPAIGN_CHANNEL_LIST } from '../config/campaignChannels'

const primary = [
  { path: '', key: 'overview', icon: ChartNoAxesCombined, end: true },
  { path: 'live', key: 'live', icon: Radio },
  { path: 'all', key: 'all', icon: List },
  { path: 'create', key: 'create', icon: Plus },
]
const future = [
  { path: 'tiktok', key: 'tiktok', icon: Radio },
  { path: 'telegram', key: 'telegram', icon: MessageCircle },
  { path: 'snapchat', key: 'snapchat', icon: Mail },
]
const tools = [
  { path: 'calendar', key: 'calendar', icon: CalendarDays },
  { path: 'workflow', key: 'workflow', icon: Workflow },
]

function SidebarLink({ path, label, icon: Icon, end, onNavigate, disabled = false, collapsed = false }) {
  if (disabled) return <span aria-disabled="true" title={label} className={cn('flex items-center rounded-md py-2 text-sm text-[var(--text-light)] opacity-60', collapsed ? 'justify-center' : 'gap-2.5 px-3')}><Icon size={16} />{!collapsed && label}</span>
  return (
    <NavLink to={`/outreach-campaigns${path ? `/${path}` : ''}`} end={end} onClick={onNavigate} className={({ isActive }) => cn(
      'flex items-center rounded-md py-2 text-sm transition-colors hover:bg-[var(--surface-2)]',
      collapsed ? 'justify-center' : 'gap-2.5 px-3',
      isActive ? 'bg-[var(--surface-2)] font-semibold text-[#007a80] dark:text-cyan-300' : 'text-[var(--text-muted)]'
    )} title={collapsed ? label : undefined} aria-label={label}>
      <Icon size={16} />{!collapsed && label}
    </NavLink>
  )
}

export function OutreachSidebar({ onNavigate, collapsed = false, onToggleCollapse }) {
  const { t } = useTranslation()
  return (
    <aside className="flex h-full min-h-0 flex-col border-e border-[var(--border)] bg-[var(--surface)]">
      <div className={cn('flex items-center border-b border-[var(--border)] py-4', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        {!collapsed && <h2 className="text-sm font-bold text-[var(--text)]">{t('outreachCampaigns.pageTitle')}</h2>}
        {onToggleCollapse && <button type="button" onClick={onToggleCollapse} title={t(collapsed ? 'outreachCampaigns.navigation.expandNavigation' : 'outreachCampaigns.navigation.collapseNavigation')} aria-label={t(collapsed ? 'outreachCampaigns.navigation.expandNavigation' : 'outreachCampaigns.navigation.collapseNavigation')} className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]">{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>}
      </div>
      <nav className={cn('min-h-0 flex-1 space-y-5 overflow-y-auto', collapsed ? 'p-2' : 'p-3')} aria-label={t('outreachCampaigns.pageTitle')}>
        <section className="space-y-1">
          {primary.map((item) => <SidebarLink key={item.key} {...item} label={t(`outreachCampaigns.navigation.${item.key}`)} onNavigate={onNavigate} collapsed={collapsed} />)}
        </section>
        <section className="space-y-1">
          {!collapsed && <h3 className="px-3 text-xs font-bold text-[var(--text-light)]">{t('outreachCampaigns.navigation.channels')}</h3>}
          {CAMPAIGN_CHANNEL_LIST.map((channel) => <SidebarLink key={channel.key} path={`channels/${channel.key}`} label={t(channel.labelKey)} icon={channel.icon} onNavigate={onNavigate} collapsed={collapsed} />)}
          {future.map((item) => <SidebarLink key={item.key} path={`channels/${item.path}`} label={t(`outreachCampaigns.navigation.${item.key}`)} icon={item.icon} disabled collapsed={collapsed} />)}
          {!collapsed && <p className="px-3 text-xs text-[var(--text-light)]">{t('outreachCampaigns.navigation.comingSoon')}</p>}
        </section>
        <section className="space-y-1 border-t border-[var(--border)] pt-4">
          {!collapsed && <h3 className="px-3 text-xs font-bold text-[var(--text-light)]">{t('outreachCampaigns.navigation.tools')}</h3>}
          {tools.map((item) => <SidebarLink key={item.key} {...item} label={t(`outreachCampaigns.navigation.${item.key}`)} onNavigate={onNavigate} collapsed={collapsed} />)}
        </section>
      </nav>
    </aside>
  )
}
