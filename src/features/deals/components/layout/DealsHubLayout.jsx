import { useTranslation } from 'react-i18next'
import { SubSidebarLayout } from '../../../../shared/components/sub-sidebar'
import { getDealsHubSidebarConfig } from '../../navigation/dealNavigation'

/** Route shell of the deals hub: every deal (workspace list), all contracts, reports and pipeline templates. */
export function DealsHubLayout() {
  const { t } = useTranslation()
  return (
    <SubSidebarLayout
      storageKey="deals-hub-sidebar-collapsed"
      mobileId="deals-hub-mobile-sidebar"
      mobileLabel={t('dealWorkspace.hub.menu')}
      sidebar={getDealsHubSidebarConfig(t)}
    />
  )
}
