import { Link, createBrowserRouter } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { MainLayout } from '../../shared/components/layout/MainLayout'
import { LoginPage } from '../../pages/auth/LoginPage'
import { DashboardPage } from '../../pages/dashboard/DashboardPage'
import { LeadsPage } from '../../pages/leads/LeadsPage'
import { CustomersPage } from '../../pages/customers/CustomersPage'
import { CustomersLayout } from '../../pages/customers/layout/CustomersLayout'
import { NewCustomersPage } from '../../pages/customers/pages/NewCustomersPage'
import { FollowUpCustomersPage } from '../../pages/customers/pages/FollowUpCustomersPage'
import { InactiveCustomersPage } from '../../pages/customers/pages/InactiveCustomersPage'
import { CustomerSegmentsPage } from '../../pages/customers/pages/CustomerSegmentsPage'
import { CustomerAssignmentsPage } from '../../pages/customers/pages/CustomerAssignmentsPage'
import { CustomerTeamsPage } from '../../pages/customers/pages/SalesTeams/CustomerTeamsPage'
import { DuplicateCustomersPage } from '../../pages/customers/pages/DuplicateCustomersPage'
import { CustomerCustomizationPage } from '../../pages/customers/pages/customization/CustomerCustomizationPage'
import { CustomerImportExportPage } from '../../pages/customers/pages/CustomerImportExportPage'
import { DeletedCustomersPage } from '../../pages/customers/pages/TrashCustomer/DeletedCustomersPage'
import { CustomersSettingsPage } from '../../pages/customers/pages/CustomersSettingsPage'
import { CustomerStatusBoardPage } from '../../pages/customers/pages/statusBoard/CustomerStatusBoardPage'
import { CustomerLeadDetailsPage } from '../../pages/customers/pages/CustomerLeadDetailsPage'
import { CustomerProposalsPage } from '../../pages/customers/pages/proposals/CustomerProposalsPage'
import { CustomerProposalBuilderPage } from '../../pages/customers/pages/proposals/CustomerProposalBuilderPage'
import { CustomerProposalTemplatesPage } from '../../pages/customers/pages/proposals/CustomerProposalTemplatesPage'
import { ConversationsPage } from '../../pages/conversations/ConversationsPage'
import { CampaignsPage } from '../../pages/campaigns/CampaignsPage'
import { TasksPage } from '../../pages/tasks/TasksPage'
import { ProductsLayout } from '../../pages/products/layout/ProductsLayout'
import { ProductsPage } from '../../pages/products/ProductsPage/ProductsPage'
import { ProductCategoriesPage } from '../../pages/products/ProductsPage/ProductCategoriesPage'
import { ServicesPage } from '../../pages/products/ServicesPage/ServicesPage'
import { ServiceCategoriesPage } from '../../pages/products/ServicesPage/ServiceCategoriesPage'
import { TeamsPage } from '../../pages/teams/TeamsPage'
import { UsersPage } from '../../pages/users/UsersPage'
import { SettingsPage } from '../../pages/settings/SettingsPage'
import { TemplatesPage } from '../../pages/templates/TemplatesPage'
import { DataTableDemo } from '../../pages/playground/DataTableDemo'

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F9FA] text-2xl font-black text-[#007A80]">
        404
      </div>
      <h1 className="text-2xl font-black text-[var(--text)]">الصفحة غير موجودة</h1>
      <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">
        الرابط الذي تحاول فتحه غير متاح أو تم تغييره.
      </p>
      <Link
        to="/customers"
        className="mt-5 inline-flex items-center rounded-xl bg-[#00C2CB] px-4 py-2 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#007A80]"
      >
        الرجوع إلى العملاء
      </Link>
    </div>
  )
}

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
      {
        path: 'customers',
        element: <CustomersLayout />,
        children: [
          { index: true, element: <CustomersPage /> },
          { path: 'new', element: <NewCustomersPage /> },
          { path: 'follow-up', element: <FollowUpCustomersPage /> },
          { path: 'inactive', element: <InactiveCustomersPage /> },
          { path: 'segments', element: <CustomerSegmentsPage /> },
          { path: 'assignments', element: <CustomerAssignmentsPage /> },
          { path: 'teams', element: <CustomerTeamsPage /> },
          { path: 'duplicates', element: <DuplicateCustomersPage /> },
          { path: 'customization', element: <CustomerCustomizationPage /> },
          { path: 'import-export', element: <CustomerImportExportPage /> },
          { path: 'trash', element: <DeletedCustomersPage /> },
          { path: 'settings', element: <CustomersSettingsPage /> },
          { path: 'status-board', element: <CustomerStatusBoardPage /> },
          { path: 'proposals', element: <CustomerProposalsPage /> },
          { path: 'proposals/templates', element: <CustomerProposalTemplatesPage /> },
          { path: 'proposals/:proposalId/builder', element: <CustomerProposalBuilderPage /> },
        ],
      },
      { path: 'lead/:customerId', element: <CustomerLeadDetailsPage /> },
      { path: 'leads/:customerId', element: <CustomerLeadDetailsPage /> },
      { path: 'conversations', element: <ConversationsPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      { path: 'tasks', element: <TasksPage /> },
      {
        path: 'products',
        element: <ProductsLayout />,
        children: [
          { index: true, element: <ProductsPage /> },
          { path: 'categories', element: <ProductCategoriesPage /> },
          { path: 'services', element: <ServicesPage /> },
          { path: 'service-categories', element: <ServiceCategoriesPage /> },
        ],
      },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'playground/datatable', element: <DataTableDemo /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
