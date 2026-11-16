import { Navigate } from 'react-router-dom'
import { CustomerManagementLayout } from './CustomerManagementLayout'
import { SalesTeamsChannelsPage, SalesTeamsPage, SalesTeamsReportsPage, SalesTeamsRuleBuilderPage, SalesTeamsRulesPage, SalesTeamsUsersPage } from './teams/SalesTeamsPages'
import { ShippingWorkspacePlaceholder } from './shipping/ShippingWorkspacePlaceholder'

const lazyPage = (loader, name, props) => async () => {
  const module = await loader()
  const Page = module[name]
  return {
    Component: props ? function CustomerManagementRoutePage() { return <Page {...props} /> } : Page,
  }
}

export const customerManagementRoutes = {
  path: 'customer-management',
  element: <CustomerManagementLayout />,
  children: [
    { index: true, element: <Navigate to="/LeadsCenter" replace /> },
    { path: 'teams', element: <SalesTeamsPage /> },
    { path: 'teams/users', element: <SalesTeamsUsersPage /> },
    { path: 'teams/channels', element: <SalesTeamsChannelsPage /> },
    { path: 'teams/rules', element: <SalesTeamsRulesPage /> },
    { path: 'teams/manual', element: <Navigate to="/LeadsCenter/teams/manual" replace /> },
    { path: 'teams/rules/new', element: <SalesTeamsRuleBuilderPage /> },
    { path: 'teams/rules/:ruleId/edit', element: <SalesTeamsRuleBuilderPage /> },
    { path: 'teams/reports', element: <SalesTeamsReportsPage /> },
    { path: 'shipping', element: <ShippingWorkspacePlaceholder /> },
    ...['shipments', 'claims', 'reports', 'settings'].map((path) => ({ path: `shipping/${path}`, element: <ShippingWorkspacePlaceholder /> })),
    { path: 'tickets', lazy: lazyPage(() => import('./service/ServiceCasesPage'), 'ServiceCasesPage') },
    { path: 'tickets/:caseId', lazy: lazyPage(() => import('./service/ServiceCaseDetailPage'), 'ServiceCaseDetailPage') },
    { path: 'tickets/my-work', lazy: lazyPage(() => import('./service/ServiceMyWorkPage'), 'ServiceMyWorkPage') },
    { path: 'tickets/reports', lazy: lazyPage(() => import('./service/ServiceReportsPage'), 'ServiceReportsPage') },
    { path: 'tickets/knowledge', lazy: lazyPage(() => import('./service/ServiceKnowledgePage'), 'ServiceKnowledgePage', { basePath: '/customer-management/tickets/knowledge' }) },
    { path: 'tickets/knowledge/:articleId', lazy: lazyPage(() => import('./service/ServiceKnowledgeArticlePage'), 'ServiceKnowledgeArticlePage', { basePath: '/customer-management/tickets/knowledge' }) },
    { path: 'tickets/settings/:section?', lazy: lazyPage(() => import('./service/ServiceSettingsPage'), 'ServiceSettingsPage', { basePath: '/customer-management/tickets/settings' }) },
  ],
}

export default customerManagementRoutes
