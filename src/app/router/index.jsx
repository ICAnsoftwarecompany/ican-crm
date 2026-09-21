import { Link, createBrowserRouter } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { CustomerActivitiesPage, MeetingDetailPage } from '../../pages/customers/pages/activities'
import { CustomerLeadDetailsPage } from '../../pages/customers/pages/lead-details'
import { CustomerProposalsPage } from '../../pages/customers/pages/proposals/CustomerProposalsPage'
import { CustomerProposalBuilderPage } from '../../pages/customers/pages/proposals/CustomerProposalBuilderPage'
import { CustomerProposalTemplatesPage } from '../../pages/customers/pages/proposals/CustomerProposalTemplatesPage'
import { ActivitiesPage } from '../../features/activities'
import { ConversationsPage } from '../../pages/conversations/ConversationsPage'
import { CampaignsPage } from '../../pages/campaigns/CampaignsPage'
import { CampaignOverviewPage } from '../../pages/campaigns/pages/CampaignOverviewPage'
import { CampaignCreatePage } from '../../pages/campaigns/pages/CampaignCreatePage'
import { CampaignListPage } from '../../pages/campaigns/pages/CampaignListPage'
import { CampaignAnalyticsPage } from '../../pages/campaigns/pages/CampaignAnalyticsPage'
import { CampaignBillingPage } from '../../pages/campaigns/pages/CampaignBillingPage'
import { CampaignDetailsPage } from '../../pages/campaigns/pages/CampaignDetailsPage'
import { OutreachCampaignsPage } from '../../pages/outreach-campaigns/OutreachCampaignsPage'
import { OutreachCampaignDetailsPage } from '../../pages/outreach-campaigns/OutreachCampaignDetailsPage'
import { OutreachCampaignsLayout } from '../../pages/outreach-campaigns/OutreachCampaignsLayout'
import { OutreachOverviewPage } from '../../pages/outreach-campaigns/OutreachOverviewPage'
import { OutreachWorkflowPage } from '../../pages/outreach-campaigns/OutreachWorkflowPage'
import { OutreachCalendarPage } from '../../pages/outreach-campaigns/OutreachCalendarPage'
import { OutreachCreatePage } from '../../pages/outreach-campaigns/OutreachCreatePage'
import { OpportunityCenterPage } from '../../pages/opportunities/OpportunityCenterPage'
import { DealsHubPage } from '../../pages/deals/DealsHubPage'
import { DealWorkspacePage } from '../../pages/deals/DealWorkspacePage'
import { SocialMediaPage } from '../../pages/social-media/SocialMediaPage'
import { SocialOverviewPage } from '../../pages/social-media/pages/SocialOverviewPage'
import { SocialProfilesPage } from '../../pages/social-media/pages/SocialProfilesPage'
import { SocialContentPage } from '../../pages/social-media/pages/SocialContentPage'
import { SocialPlannerPage } from '../../pages/social-media/pages/SocialPlannerPage'
import { SocialAnalyticsPage } from '../../pages/social-media/pages/SocialAnalyticsPage'
import { FacebookPage as SocialFacebookPage } from '../../pages/social-media/pages/platforms/FacebookPage'
import { FacebookProfilePage } from '../../pages/social-media/pages/platforms/FacebookProfilePage'
import { InstagramPage } from '../../pages/social-media/pages/platforms/InstagramPage'
import { TikTokPage } from '../../pages/social-media/pages/platforms/TikTokPage'
import { SnapchatPage } from '../../pages/social-media/pages/platforms/SnapchatPage'
import { AutomationCenterPage } from '../../pages/automation/AutomationCenterPage'
import { FacebookCallbackPage } from '../../pages/integrations/FacebookCallbackPage'
import { TasksPage } from '../../pages/tasks/TasksPage'
import { CalendarPage } from '../../pages/calendar/CalendarPage'
import { ProductsLayout } from '../../pages/products/layout/ProductsLayout'
import { ProductsPage } from '../../pages/products/ProductsPage/ProductsPage'
import { ProductCategoriesPage } from '../../pages/products/ProductsPage/ProductCategoriesPage'
import { ServicesPage } from '../../pages/products/ServicesPage/ServicesPage'
import { ServiceCategoriesPage } from '../../pages/products/ServicesPage/ServiceCategoriesPage'
import { TeamsPage } from '../../pages/teams/TeamsPage'
import { UsersPage } from '../../pages/users/UsersPage'
import { SettingsLayout } from '../../pages/settings/layout/SettingsLayout'
import { DefinitionsSettingsPage } from '../../pages/settings/pages/definitions/DefinitionsSettingsPage'
import { UsersSettingsPage } from '../../pages/settings/pages/users/UsersSettingsPage'
import { IntegrationsSettingsPage } from '../../pages/settings/pages/integrations/IntegrationsSettingsPage'
import { AppearanceSettingsPage } from '../../pages/settings/pages/appearance/AppearanceSettingsPage'
import { TemplatesPage } from '../../pages/templates/TemplatesPage'
import { DataTableDemo } from '../../pages/playground/DataTableDemo'
import { VisualFlowDemo } from '../../pages/playground/VisualFlowDemo'
import { InternalChatPage } from '../../pages/chat/InternalChatPage'

function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F9FA] text-2xl font-black text-[#007A80]">
        404
      </div>
      <h1 className="text-2xl font-black text-[var(--text)]">{t('app.notFoundTitle')}</h1>
      <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">{t('app.notFoundDescription')}</p>
      <Link
        to="/LeadsCenter"
        className="mt-5 inline-flex items-center rounded-xl bg-[#00C2CB] px-4 py-2 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#007A80]"
      >
        {t('app.backToLeads')}
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
        path: 'LeadsCenter',
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
          { path: 'activities', element: <CustomerActivitiesPage /> },
          { path: 'activities/meeting/:meetingId', element: <MeetingDetailPage /> },
          { path: 'proposals', element: <CustomerProposalsPage /> },
          { path: 'proposals/templates', element: <CustomerProposalTemplatesPage /> },
          { path: 'proposals/:proposalId/builder', element: <CustomerProposalBuilderPage /> },
        ],
      },
      { path: 'lead/:customerId', element: <CustomerLeadDetailsPage /> },
      { path: 'leads/:customerId', element: <CustomerLeadDetailsPage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'activities/calls', element: <ActivitiesPage defaultType="call" /> },
      { path: 'activities/meetings', element: <ActivitiesPage defaultType="meeting" /> },
      { path: 'activities/calendar', element: <ActivitiesPage defaultView="calendar" /> },
      { path: 'conversations', element: <ConversationsPage /> },
      {
        path: 'campaigns',
        element: <CampaignsPage />,
        children: [
          { index: true, element: null },
          { path: ':platform', element: <CampaignOverviewPage /> },
          { path: ':platform/create', element: <CampaignCreatePage /> },
          { path: ':platform/list', element: <CampaignListPage /> },
          { path: ':platform/analytics', element: <CampaignAnalyticsPage /> },
          { path: ':platform/billing', element: <CampaignBillingPage /> },
          { path: ':platform/:campaignId', element: <CampaignDetailsPage /> },
        ],
      },
      {
        path: 'outreach-campaigns', element: <OutreachCampaignsLayout />,
        children: [
          { index: true, element: <OutreachOverviewPage /> },
          { path: 'live', element: <OutreachCampaignsPage view="live" /> },
          { path: 'all', element: <OutreachCampaignsPage /> },
          { path: 'create', element: <OutreachCreatePage /> },
          { path: 'channels/messenger', element: <OutreachCampaignsPage channel="messenger" /> },
          { path: 'channels/whatsapp', element: <OutreachCampaignsPage channel="whatsapp" /> },
          { path: 'channels/gmail', element: <OutreachCampaignsPage channel="gmail" /> },
          { path: 'calendar', element: <OutreachCalendarPage /> },
          { path: 'workflow', element: <OutreachWorkflowPage /> },
          { path: ':campaignId', element: <OutreachCampaignDetailsPage /> },
        ],
      },
      { path: 'opportunities', element: <OpportunityCenterPage /> },
      { path: 'deals', element: <DealsHubPage /> },
      { path: 'deals/:dealId', element: <DealWorkspacePage /> },
      {
        path: 'social-media',
        element: <SocialMediaPage />,
        children: [
          { index: true, element: <SocialOverviewPage /> },
          { path: 'profiles', element: <SocialProfilesPage /> },
          { path: 'content', element: <SocialContentPage /> },
          { path: 'planner', element: <SocialPlannerPage /> },
          { path: 'analytics', element: <SocialAnalyticsPage /> },
          { path: 'facebook', element: <SocialFacebookPage /> },
          { path: 'facebook/:pageId', element: <FacebookProfilePage /> },
          { path: 'instagram', element: <InstagramPage /> },
          { path: 'tiktok', element: <TikTokPage /> },
          { path: 'snapchat', element: <SnapchatPage /> },
        ],
      },
      { path: 'automation', element: <AutomationCenterPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'team-chat', element: <InternalChatPage /> },
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
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <DefinitionsSettingsPage /> },
          { path: 'definitions', element: <DefinitionsSettingsPage /> },
          { path: 'users', element: <UsersSettingsPage /> },
          { path: 'integrations', element: <IntegrationsSettingsPage /> },
          { path: 'appearance', element: <AppearanceSettingsPage /> },
        ],
      },
      { path: 'integrations/facebook/callback', element: <FacebookCallbackPage /> },
      { path: 'playground/datatable', element: <DataTableDemo /> },
      { path: 'playground/visual-flow', element: <VisualFlowDemo /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
