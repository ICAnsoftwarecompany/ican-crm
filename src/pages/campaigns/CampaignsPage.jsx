import { useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { resolveTenantId } from '../../services/tenantResolver'
import { useFacebookIntegrations } from '../../features/meta-integrations/hooks/useFacebookIntegrations'
import { CAMPAIGN_NAV_ITEMS, CampaignCenterProvider, getCampaignPlatform, getVisibleCampaignPlatforms, platformHasCapability, userHasCampaignPermission } from '../../features/campaigns'
import { AppDrawer } from '../../shared/components/overlays/AppDrawer'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { cn } from '../../shared/utils/cn'
import { CampaignSubSidebar } from './components/CampaignSubSidebar'
import { CampaignCenterHeader } from './components/CampaignCenterHeader'
import { CampaignUnavailableState } from './components/CampaignUnavailableState'

const LAST_PLATFORM_KEY = 'ican-campaign-center-platform'

export function CampaignsPage() {
  const { t } = useTranslation()
  const { platform: platformId } = useParams()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)
  const platforms = useMemo(() => getVisibleCampaignPlatforms(user?.modules), [user?.modules])
  const platform = getCampaignPlatform(platformId)
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const integrationsQuery = useFacebookIntegrations(tenantId, { enabled: platformId === 'meta' })
  const integrations = integrationsQuery.data || {}
  const accounts = platformId === 'meta' ? integrations.ad_accounts || [] : []
  const [accountId, setAccountId] = useState('')

  useEffect(() => {
    if (platformId) localStorage.setItem(LAST_PLATFORM_KEY, platformId)
  }, [platformId])

  useEffect(() => {
    const firstAccount = accounts[0]?.account_id || accounts[0]?.id || ''
    setAccountId((current) => current && accounts.some((account) => String(account.account_id || account.id) === String(current)) ? current : String(firstAccount))
  }, [accounts])

  if (!platformId) {
    const remembered = localStorage.getItem(LAST_PLATFORM_KEY)
    const target = platforms.some((entry) => entry.id === remembered) ? remembered : platforms[0]?.id
    return target ? <Navigate to={`/campaigns/${target}`} replace /> : <CampaignUnavailableState reason="package" />
  }

  if (!platform || !platforms.some((entry) => entry.id === platform.id)) return <CampaignUnavailableState reason="package" />

  const connectionStatus = platform.id === 'meta'
    ? integrationsQuery.isError ? 'needsAttention' : integrations.is_connected ? 'connected' : 'disconnected'
    : 'disconnected'
  const connectionByPlatform = Object.fromEntries(platforms.map((entry) => [entry.id, entry.id === platform.id ? connectionStatus : 'disconnected']))
  const context = { tenantId, platform, provider: platform.provider, accountId, accounts, connectionStatus, integrations, permissions: user?.permissions }
  const pageSegment = location.pathname.split('/').filter(Boolean)[2] || 'overview'
  const requestedNavItem = CAMPAIGN_NAV_ITEMS.find((item) => (item.path || 'overview') === pageSegment)
    || (pageSegment && !['create', 'list', 'analytics', 'billing'].includes(pageSegment) ? CAMPAIGN_NAV_ITEMS.find((item) => item.id === 'list') : null)
  const accessDenied = requestedNavItem && (!platformHasCapability(platform, requestedNavItem.capability) || !userHasCampaignPermission(requestedNavItem.permission, user?.permissions))

  const desktopNavigation = (
    <CampaignSubSidebar
      platforms={platforms}
      activePlatformId={platform.id}
      permissions={user?.permissions}
      connectionByPlatform={connectionByPlatform}
      onNavigate={() => setMobileNavigationOpen(false)}
      collapsed={sidebarCollapsed}
      onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
    />
  )
  const mobileNavigation = <CampaignSubSidebar platforms={platforms} activePlatformId={platform.id} permissions={user?.permissions} connectionByPlatform={connectionByPlatform} onNavigate={() => setMobileNavigationOpen(false)} />

  return (
    <CampaignCenterProvider value={context}>
      <div className={cn('-m-3 h-[calc(100vh-4rem)] overflow-hidden border-t border-[var(--border)] bg-[var(--surface-2)] sm:-m-4 lg:grid', sidebarCollapsed ? 'lg:grid-cols-[64px_minmax(0,1fr)]' : 'lg:grid-cols-[260px_minmax(0,1fr)]')}>
        <aside className="hidden h-full min-h-0 overflow-hidden lg:block">{desktopNavigation}</aside>
        <section className="flex min-h-0 min-w-0 flex-col bg-[var(--surface-2)]">
          <CampaignCenterHeader
            platform={platform}
            accounts={accounts}
            accountId={accountId}
            onAccountChange={setAccountId}
            connectionStatus={connectionStatus}
            onOpenNavigation={() => setMobileNavigationOpen(true)}
          />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {platform.id === 'meta' && integrationsQuery.isLoading
              ? <ResourceState isLoading />
              : accessDenied ? <CampaignUnavailableState reason="permission" /> : <Outlet context={context} />}
          </main>
        </section>
      </div>
      <AppDrawer open={mobileNavigationOpen} onClose={() => setMobileNavigationOpen(false)} title={t('campaigns.center.title')} size="sm">{mobileNavigation}</AppDrawer>
    </CampaignCenterProvider>
  )
}
