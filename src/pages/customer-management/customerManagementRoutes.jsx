import { Navigate } from 'react-router-dom'
import { CustomerManagementLayout } from './CustomerManagementLayout'
import { ShippingWorkspacePlaceholder } from './industry-shipping/ShippingWorkspacePlaceholder'
import { serviceRoutes } from './service/serviceRoutes'

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
    { index: true, lazy: lazyPage(() => import('./service/ServiceCenterPage'), 'ServiceCenterPage') },
    { path: 'shipping', element: <ShippingWorkspacePlaceholder /> },
    ...['shipments', 'claims', 'reports', 'settings'].map((path) => ({ path: `shipping/${path}`, element: <ShippingWorkspacePlaceholder /> })),
    { path: 'tickets', lazy: lazyPage(() => import('./ticket-module/ServiceCasesPage'), 'ServiceCasesPage') },
    { path: 'tickets/:caseId', lazy: lazyPage(() => import('./ticket-module/ServiceCaseDetailPage'), 'ServiceCaseDetailPage') },
    { path: 'tickets/my-work', lazy: lazyPage(() => import('./my-work/ServiceMyWorkPage'), 'ServiceMyWorkPage') },
    { path: 'tickets/reports', lazy: lazyPage(() => import('./reports/ServiceReportsPage'), 'ServiceReportsPage') },
    { path: 'tickets/knowledge', lazy: lazyPage(() => import('./knowledge-base/ServiceKnowledgePage'), 'ServiceKnowledgePage', { basePath: '/customer-management/tickets/knowledge' }) },
    { path: 'tickets/knowledge/:articleId', lazy: lazyPage(() => import('./knowledge-base/ServiceKnowledgeArticlePage'), 'ServiceKnowledgeArticlePage', { basePath: '/customer-management/tickets/knowledge' }) },
    { path: 'tickets/settings/sla', element: <Navigate to="/customer-management/service/settings/sla-policies" replace /> },
    { path: 'tickets/settings/:section?', lazy: lazyPage(() => import('./operations-settings/ServiceSettingsPage'), 'ServiceSettingsPage', { basePath: '/customer-management/tickets/settings' }) },
    { path: 'service/settings/:section?', lazy: lazyPage(() => import('./operations-settings/ServiceSettingsPage'), 'ServiceSettingsPage', { basePath: '/customer-management/service/settings' }) },
    serviceRoutes,
  ],
}

export default customerManagementRoutes
