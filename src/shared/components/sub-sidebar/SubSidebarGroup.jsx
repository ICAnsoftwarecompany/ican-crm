import { cn } from '../../utils/cn'
import { SubSidebarNavItem } from './SubSidebarNavItem'
import { getSubSidebarItemKey } from './subSidebarUtils'

const CHILDREN_SCROLL_AFTER = 6

export function SubSidebarGroup({ group, collapsed = false, onNavigate, children }) {
  return (
    <section className={cn('space-y-1', group.divider && 'border-t border-[var(--border)] pt-4')}>
      {!collapsed && group.label && (
        <h3 className="px-2 text-[11px] font-bold text-[var(--text-light)]">{group.label}</h3>
      )}
      {(group.items || []).map((item) => (
        <div key={getSubSidebarItemKey(item)}>
          <SubSidebarNavItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
          {/* Sub-pages (2026-10-15): one level, indented, hidden in the collapsed rail. A long list (more than
              CHILDREN_SCROLL_AFTER) scrolls inside its own box so the rest of the sidebar stays in reach. */}
          {!collapsed && item.children?.length > 0 && (
            <div
              className={cn(
                'ms-4 mt-0.5 space-y-0.5 border-s border-[var(--border)] ps-1.5',
                item.children.length > CHILDREN_SCROLL_AFTER && 'max-h-60 overflow-y-auto overscroll-contain pe-1 [scrollbar-gutter:stable]'
              )}
              role="group"
              aria-label={item.label}
            >
              {item.children.map((child) => (
                <SubSidebarNavItem key={getSubSidebarItemKey(child)} item={child} collapsed={false} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      ))}
      {children}
      {!collapsed && group.note && <p className="px-2 text-xs text-[var(--text-light)]">{group.note}</p>}
    </section>
  )
}

/** Scrollable body. Pass `groups` for config-driven items, and/or `children` for custom rows. */
export function SubSidebarNav({ groups = [], collapsed = false, onNavigate, ariaLabel, children }) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]', collapsed ? 'space-y-3 px-2 py-4' : 'space-y-5 p-3')}
    >
      {groups.map((group) => (
        <SubSidebarGroup key={group.id} group={group} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
      {children}
    </nav>
  )
}

/** Pinned bottom area (settings link, etc.). */
export function SubSidebarFooter({ items = [], collapsed = false, onNavigate, children }) {
  if (!items.length && !children) return null
  return (
    <div className={cn('space-y-1 border-t border-[var(--border)] p-3', collapsed && 'px-2')}>
      {items.map((item) => (
        <SubSidebarNavItem key={getSubSidebarItemKey(item)} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
      {children}
    </div>
  )
}
