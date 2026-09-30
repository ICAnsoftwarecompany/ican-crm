import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

const baseClass = cn(
  'group relative flex items-center rounded-md text-sm font-arabic transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]'
)

function ItemBody({ item, collapsed, isActive }) {
  const Icon = item.icon
  return (
    <>
      <span
        className={cn(
          'absolute inset-y-2 start-0 w-0.5 rounded-full bg-[var(--brand-accent)] opacity-0 transition-opacity',
          isActive && 'opacity-100'
        )}
        aria-hidden="true"
      />
      {Icon && <Icon size={16} className={cn('shrink-0', isActive ? 'text-brand-accent' : 'text-[var(--text-muted)]')} />}
      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-light)]">
          {item.badge}
        </span>
      )}
      {!collapsed && item.trailing}
    </>
  )
}

/** One link. Disabled items render as a non-interactive row (plan-gated or "coming soon"). */
export function SubSidebarNavItem({ item, collapsed = false, onNavigate }) {
  const layoutClass = collapsed ? 'h-10 justify-center px-0' : 'gap-2.5 px-2.5 py-2'
  const title = collapsed ? item.label : undefined

  if (item.disabled) {
    return (
      <span
        aria-disabled="true"
        title={item.label}
        className={cn(baseClass, layoutClass, 'cursor-not-allowed text-[var(--text-light)] opacity-60')}
      >
        <ItemBody item={item} collapsed={collapsed} isActive={false} />
      </span>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={title}
      aria-label={item.label}
      className={({ isActive }) =>
        cn(
          baseClass,
          layoutClass,
          isActive
            ? 'bg-[var(--surface-2)] font-semibold text-[var(--text)]'
            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
        )
      }
    >
      {({ isActive }) => <ItemBody item={item} collapsed={collapsed} isActive={isActive} />}
    </NavLink>
  )
}
