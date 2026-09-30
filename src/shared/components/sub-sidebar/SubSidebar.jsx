import { SubSidebarFrame } from './SubSidebarFrame'
import { SubSidebarHeader } from './SubSidebarHeader'
import { SubSidebarFooter, SubSidebarNav } from './SubSidebarGroup'
import { getVisibleSubSidebarGroups } from './subSidebarUtils'

/**
 * The config-driven sub-sidebar. Every module sidebar should be this component with its own
 * `groups` — see README.md in this folder.
 *
 * <SubSidebar
 *   header={{ icon: Phone, title: t('...'), description: t('...') }}
 *   groups={getCallsNavigation(t)}
 *   footerItems={[settingsItem]}
 *   collapsed={collapsed}
 *   onToggleCollapse={toggle}
 * />
 */
export function SubSidebar({
  variant = 'attached',
  header = {},
  groups = [],
  footerItems = [],
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  ariaLabel,
  width,
  className,
  children,
}) {
  const visibleGroups = getVisibleSubSidebarGroups(groups)
  const visibleFooter = footerItems.filter((item) => item && !item.hidden)

  return (
    <SubSidebarFrame
      variant={variant}
      collapsed={collapsed}
      width={width}
      ariaLabel={ariaLabel || header.title}
      className={className}
    >
      <SubSidebarHeader {...header} collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      <SubSidebarNav groups={visibleGroups} collapsed={collapsed} onNavigate={onNavigate} ariaLabel={ariaLabel || header.title}>
        {children}
      </SubSidebarNav>
      <SubSidebarFooter items={visibleFooter} collapsed={collapsed} onNavigate={onNavigate} />
    </SubSidebarFrame>
  )
}
