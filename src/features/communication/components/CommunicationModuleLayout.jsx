import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SubSidebarLayout } from '../../../shared/components/sub-sidebar'
import { getCommunicationModule } from '../constants/communicationModules'
import { getCommunicationSidebarConfig } from '../navigation/communicationNavigation'

/**
 * Route shell for /conversations, /calls, /meetings and /team-chat: the shared sub-sidebar +
 * the routed page. Chat inboxes (conversations, team chat) render their index view full-bleed.
 */
export function CommunicationModuleLayout({ moduleId }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const module = getCommunicationModule(moduleId)
  const sidebar = getCommunicationSidebarConfig(moduleId, t)
  const isIndex = pathname.replace(/\/+$/, '') === module.basePath

  return (
    <SubSidebarLayout
      storageKey={`${module.id}-sidebar-collapsed`}
      mobileId={`${module.id}-mobile-sidebar`}
      mobileLabel={t(`communication.modules.${module.id}.menu`)}
      sidebar={sidebar}
      fullBleed={isIndex && module.fullBleedIndex}
    />
  )
}
