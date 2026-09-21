import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { AppDrawer } from '../../shared/components/overlays/AppDrawer'
import { Button } from '../../shared/components/ui/Button'
import { cn } from '../../shared/utils/cn'
import { SocialMediaSubSidebar } from './components/SocialMediaSubSidebar'

/**
 * Social Media module shell — mirrors `pages/campaigns/CampaignsPage.jsx`'s
 * established shell pattern (desktop aside + mobile AppDrawer, both
 * rendering the same sub-sidebar). Unlike Campaign Center, there is no
 * `:platform` route param / provider context here: cross-platform pages
 * (Overview/Profiles/Content/...) need no platform selection at all, and
 * each platform-specific route (`/social-media/facebook`, ...) is its own
 * literal path rather than a shared `:platform` route — see docs
 * "Routing" for why that's simpler and sufficient for this module's shape.
 */
export function SocialMediaPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div
      className={cn(
        '-m-6 grid h-[calc(100vh-var(--layout-header-height,48px))] overflow-hidden border-t border-[var(--border)] bg-[var(--surface-2)] lg:grid',
        sidebarCollapsed ? 'lg:grid-cols-[64px_minmax(0,1fr)]' : 'lg:grid-cols-[260px_minmax(0,1fr)]'
      )}
    >
      <aside className="hidden h-full min-h-0 overflow-hidden lg:block">
        <SocialMediaSubSidebar
          enabledModules={user?.modules}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
        />
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col bg-[var(--surface)]">
        <header className="flex items-center gap-2 border-b border-[var(--border)] p-3 lg:hidden">
          <Button variant="outline" size="icon" onClick={() => setMobileNavigationOpen(true)} aria-label={t('socialMedia.center.openNavigation')}>
            <Menu size={16} />
          </Button>
          <h1 className="text-sm font-bold text-[var(--text)]">{t('socialMedia.center.title')}</h1>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </section>

      <AppDrawer open={mobileNavigationOpen} onClose={() => setMobileNavigationOpen(false)} title={t('socialMedia.center.title')} size="sm">
        <SocialMediaSubSidebar enabledModules={user?.modules} onNavigate={() => setMobileNavigationOpen(false)} />
      </AppDrawer>
    </div>
  )
}
