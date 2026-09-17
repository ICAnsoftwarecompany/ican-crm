import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { navigationConfig } from './navigation.config'
import { getVisibleNavigation, resolveActiveNavigation } from './navigation.utils'

/**
 * The single navigation pipeline: config -> module/permission/flag filters ->
 * empty-section removal -> active-route resolution. Both Sidebar and Header
 * read from this hook instead of Header depending on Sidebar's internals.
 *
 * `user.modules` / `user.permissions` do not exist on the backend yet, so
 * this resolves to "everything visible" today by design — see
 * navigation.utils#isModuleEnabled / #hasNavigationPermission.
 */
export function useNavigation() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  const sections = useMemo(() => (
    getVisibleNavigation(navigationConfig, {
      enabledModules: user?.modules,
      userPermissions: user?.permissions,
    })
  ), [user?.modules, user?.permissions])

  const { activeItem, activeSection } = useMemo(
    () => resolveActiveNavigation(sections, location.pathname),
    [sections, location.pathname]
  )

  return {
    sections,
    activeItem,
    activeSectionId: activeSection?.id ?? null,
  }
}
