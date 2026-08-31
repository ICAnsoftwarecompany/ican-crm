import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, UsersRound } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { customerNavigationGroups, customerSettingsItem } from '../constants/customerNavigation'

function CustomersNavItem({ item, onNavigate, collapsed }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-md text-sm font-arabic transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
          collapsed ? 'h-10 justify-center px-0' : 'gap-2.5 px-2.5 py-2',
          isActive
            ? 'bg-[var(--surface-2)] font-semibold text-[var(--text)]'
            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
        )
      }
      aria-label={item.label}
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute inset-y-2 w-0.5 rounded-full bg-[#00C2CB] opacity-0 transition-opacity',
              'start-0',
              isActive && 'opacity-100'
            )}
            aria-hidden="true"
          />
          <Icon
            size={16}
            className={cn(
              'shrink-0',
              isActive ? 'text-[#00A8B0]' : 'text-[var(--text-muted)]'
            )}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

export function CustomersSidebar({
  onNavigate,
  className,
  collapsed = false,
  onToggleCollapse,
}) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-e border-[var(--border)] bg-[var(--surface)] lg:flex',
        'sticky top-[4.5rem] h-[calc(100vh-4.5rem)] self-start flex-col overflow-hidden',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-16' : 'w-[260px]',
        className
      )}
      aria-label="قائمة العملاء"
    >
      <div className={cn('border-b border-[var(--border)] p-3', collapsed && 'px-2')}>
        <div className={cn('flex items-center gap-3', collapsed && 'flex-col justify-center gap-2')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
            <UsersRound size={18} />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-[var(--text)]">إدارة العملاء</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                العملاء، التصنيفات، المتابعة والإعدادات
              </p>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                'text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
              )}
              aria-label={collapsed ? 'فتح قائمة العملاء' : 'غلق قائمة العملاء'}
              title={collapsed ? 'فتح قائمة العملاء' : 'غلق قائمة العملاء'}
            >
              <ToggleIcon size={16} />
            </button>
          )}
        </div>
      </div>

      <nav className={cn('flex-1 overflow-y-auto scrollbar-thin', collapsed ? 'space-y-3 px-2 py-14' : 'space-y-5 p-3')}>
        {customerNavigationGroups.map((group) => (
          <section key={group.id} className="space-y-1">
            {!collapsed && (
              <h3 className="px-2 text-[11px] font-bold text-[var(--text-light)]">
                {group.label}
              </h3>
            )}
            {group.items.map((item) => (
              <CustomersNavItem
                key={item.to}
                item={item}
                onNavigate={onNavigate}
                collapsed={collapsed}
              />
            ))}
          </section>
        ))}
      </nav>

      <div className={cn('border-t border-[var(--border)] p-3', collapsed && 'px-2')}>
        <CustomersNavItem
          item={customerSettingsItem}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />
      </div>
    </aside>
  )
}
