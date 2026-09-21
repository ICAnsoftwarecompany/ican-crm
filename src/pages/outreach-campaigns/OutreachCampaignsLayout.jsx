import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, Plus } from 'lucide-react'
import { AppDrawer } from '../../shared/components/overlays/AppDrawer'
import { Button } from '../../shared/components/ui/Button'
import { useLocalStorage } from '../../shared/components/data-table/hooks/useLocalStorage'
import { cn } from '../../shared/utils/cn'
import { OutreachSidebar } from '../../features/outreach-campaigns/components/OutreachSidebar'

export function OutreachCampaignsLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useLocalStorage('outreach-sidebar-collapsed', false)
  const channel = /^\/outreach-campaigns\/channels\/(whatsapp|gmail|messenger)$/.exec(location.pathname)?.[1]
  const isCreatePage = location.pathname === '/outreach-campaigns/create'
  const showCreateButton = location.pathname === '/outreach-campaigns/all' || Boolean(channel)
  const createPath = `/outreach-campaigns/create${channel ? `?channel=${channel}` : ''}`
  return (
    <div className={cn('-m-3 h-[calc(100vh-4rem)] overflow-hidden border-t border-[var(--border)] bg-[var(--surface-2)] sm:-m-4 lg:grid', collapsed ? 'lg:grid-cols-[64px_minmax(0,1fr)]' : 'lg:grid-cols-[244px_minmax(0,1fr)]')}>
      <div className="hidden h-full min-h-0 overflow-hidden lg:block"><OutreachSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((value) => !value)} /></div>
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2">
          <div className="flex items-center lg:hidden">
            <button type="button" onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center text-[var(--text)]" aria-label={t('outreachCampaigns.navigation.openNavigation')}><Menu size={20} /></button>
            <span className="ms-2 text-sm font-bold text-[var(--text)]">{t('outreachCampaigns.pageTitle')}</span>
          </div>
          <div className="hidden lg:block" />
          {showCreateButton && <Button size="sm" onClick={() => navigate(createPath)}><Plus size={16} />{t('outreachCampaigns.createCampaign')}</Button>}
        </div>
        <main className={cn('min-h-0 min-w-0 flex-1 overflow-y-auto', isCreatePage ? 'p-0' : 'p-3 sm:p-4')}><Outlet /></main>
      </div>
      <AppDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} title={t('outreachCampaigns.pageTitle')} size="sm">
        <OutreachSidebar onNavigate={() => setMobileOpen(false)} />
      </AppDrawer>
    </div>
  )
}
