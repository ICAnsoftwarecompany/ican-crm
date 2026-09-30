import { cn } from '../../utils/cn'

/**
 * Outer shell of every sub-sidebar.
 *
 * - `attached`: glued to the page edge inside a bordered page card (Leads Center, Products,
 *   Settings, Communication hub). Desktop only — mobile uses SubSidebarMobileDrawer.
 * - `framed`: a rounded card that fills a grid column (Campaigns, Social Media, Outreach).
 * - `plain`: no border or shadow; used inside the mobile drawer.
 */
export function SubSidebarFrame({
  variant = 'attached',
  collapsed = false,
  width = 260,
  ariaLabel,
  className,
  children,
}) {
  const style = variant === 'attached' ? { width: collapsed ? 64 : width } : undefined

  return (
    <aside
      aria-label={ariaLabel}
      style={style}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden bg-[var(--surface)]',
        variant === 'attached' && [
          'hidden shrink-0 border-e border-[var(--border)] lg:flex',
          'sticky top-[4.5rem] h-[calc(100vh-4.5rem)] self-start',
          'transition-[width] duration-200 ease-out',
        ],
        variant === 'framed' && 'h-full rounded-md border border-[var(--border)] shadow-sm',
        variant === 'plain' && 'h-full w-full',
        className
      )}
    >
      {children}
    </aside>
  )
}
