import { useTranslation } from 'react-i18next'
import { SubSidebarLayout } from '../../shared/components/sub-sidebar'
import { getSalesTeamsSidebarConfig } from './salesTeamsNavigation'

/** /LeadsCenter/teams/* — the sales teams area with its own sub-sidebar (2026-10-16). */
export function SalesTeamsLayout() {
  const { t } = useTranslation()
  return (
    <SubSidebarLayout
      storageKey="sales-teams-sidebar-collapsed"
      mobileId="sales-teams-mobile-sidebar"
      mobileLabel={t('salesTeams.nav.menu')}
      sidebar={getSalesTeamsSidebarConfig(t)}
    />
  )
}
