import { Outlet, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { SubSidebarLayout } from '../../../../shared/components/sub-sidebar'
import { DealWorkspaceProvider, useDealWorkspace } from '../../hooks/useDealWorkspace'
import { getDealWorkspaceSidebarConfig } from '../../navigation/dealNavigation'
import { DealWorkspaceHeader } from './DealWorkspaceHeader'

function DealWorkspaceShell() {
  const { t } = useTranslation()
  const { deal, dealId, dealQuery } = useDealWorkspace()
  const sidebar = getDealWorkspaceSidebarConfig({ dealId, deal, t })

  return (
    <SubSidebarLayout
      storageKey="deal-workspace-sidebar-collapsed"
      mobileId="deal-workspace-mobile-sidebar"
      mobileLabel={t('dealWorkspace.workspace.menu')}
      sidebar={sidebar}
    >
      <ResourceState
        isLoading={dealQuery.isLoading}
        error={dealQuery.error}
        onRetry={dealQuery.refetch}
        empty={!dealQuery.isLoading && !dealQuery.error && !deal}
        emptyTitle={t('dealWorkspace.workspace.notFound')}
      >
        <DealWorkspaceHeader />
        <Outlet />
      </ResourceState>
    </SubSidebarLayout>
  )
}

/**
 * Route shell of `/deals/:dealId/*`: loads the deal once (DealWorkspaceProvider) and renders the shared
 * sub-sidebar + the deal header + the routed page. One workspace per deal; each keeps its own data.
 */
export function DealWorkspaceLayout() {
  const { dealId } = useParams()
  return (
    <DealWorkspaceProvider dealId={dealId}>
      <DealWorkspaceShell />
    </DealWorkspaceProvider>
  )
}
