import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLocalStorage } from '../data-table/hooks/useLocalStorage'
import { SubSidebar } from './SubSidebar'
import { SubSidebarMobileDrawer } from './SubSidebarMobileDrawer'

/**
 * Page layout for any area with its own internal navigation: attached sub-sidebar on desktop,
 * a "menu" button + drawer on mobile, and the routed page (`<Outlet />`) in the main column.
 *
 * <SubSidebarLayout
 *   storageKey="calls-sidebar-collapsed"
 *   mobileId="calls-mobile-sidebar"
 *   mobileLabel={t('communication.calls.menu')}
 *   sidebar={{ header, groups, footerItems }}
 * />
 *
 * @param {object} props
 * @param {object} props.sidebar - Props forwarded to <SubSidebar> (header, groups, footerItems, ariaLabel, width, children).
 * @param {string} props.storageKey - localStorage key for the collapsed state (keep existing keys when migrating).
 * @param {string} props.mobileLabel - Translated label for the mobile menu button and drawer.
 * @param {string} [props.mobileId] - id of the mobile drawer (for aria-controls).
 * @param {React.ReactNode} [props.afterSidebar] - Extra desktop column right after the sidebar (e.g. a pinned bulk-actions rail).
 * @param {boolean} [props.fullBleed] - Render content without padding (full-height workspaces like chat inboxes).
 * @param {React.ReactNode} [props.children] - Content; defaults to <Outlet />.
 */
export function SubSidebarLayout({
  sidebar,
  storageKey,
  mobileLabel,
  mobileId,
  afterSidebar,
  fullBleed = false,
  className,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useLocalStorage(storageKey, false)
  const drawerId = mobileId || `${storageKey}-mobile`

  return (
    <div className={cn('flex min-h-0 flex-1 overflow-visible rounded-lg border border-[var(--border)] bg-[var(--surface)]', className)}>
      <SubSidebar
        {...sidebar}
        variant="attached"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />
      {afterSidebar}

      <SubSidebarMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} id={drawerId} label={mobileLabel}>
        <SubSidebar {...sidebar} variant="plain" onNavigate={() => setMobileOpen(false)} />
      </SubSidebarMobileDrawer>

      <main className="min-w-0 flex-1 bg-[var(--brand-bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
            aria-expanded={mobileOpen}
            aria-controls={drawerId}
          >
            <PanelLeft size={16} />
            {mobileLabel}
          </button>
        </div>

        <div className={cn('min-w-0', !fullBleed && 'p-4 lg:p-5')}>{children ?? <Outlet />}</div>
      </main>
    </div>
  )
}
