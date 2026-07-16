import { createBrowserRouter } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { MainLayout } from '../../shared/components/layout/MainLayout'
import { LoginPage } from '../../pages/auth/LoginPage'
import { DashboardPage } from '../../pages/dashboard/DashboardPage'
import { LeadsPage } from '../../pages/leads/LeadsPage'
import { CustomersPage } from '../../pages/customers/CustomersPage'
import { ConversationsPage } from '../../pages/conversations/ConversationsPage'
import { CampaignsPage } from '../../pages/campaigns/CampaignsPage'
import { ProductsPage } from '../../pages/products/ProductsPage'
import { TeamsPage } from '../../pages/teams/TeamsPage'
import { SettingsPage } from '../../pages/settings/SettingsPage'
import { DataTableDemo } from '../../pages/playground/DataTableDemo'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'leads', element: <LeadsPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'conversations', element: <ConversationsPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'playground/datatable', element: <DataTableDemo /> },
    ],
  },
])
