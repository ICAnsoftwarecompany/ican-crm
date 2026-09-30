// Public API of the shared sub-sidebar. Import from here, never from internal files.
// Rule (CLAUDE.md, docs/1-ARCHITECTURE.md#sub-sidebar): every internal/sub sidebar in the app is built
// from these components — do not write a new *Sidebar.jsx with its own NavLink styling.

export { SubSidebar } from './SubSidebar'
export { SubSidebarLayout } from './SubSidebarLayout'
export { SubSidebarFrame } from './SubSidebarFrame'
export { SubSidebarHeader } from './SubSidebarHeader'
export { SubSidebarNav, SubSidebarGroup, SubSidebarFooter } from './SubSidebarGroup'
export { SubSidebarNavItem } from './SubSidebarNavItem'
export { SubSidebarMobileDrawer } from './SubSidebarMobileDrawer'
export { getVisibleSubSidebarGroups, flattenSubSidebarItems, getSubSidebarItemKey } from './subSidebarUtils'
