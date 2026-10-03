import { DealWorkspaceLayout, DealsHubLayout } from '../../features/deals'
import { DealsContractsPage, DealsListPage, DealsPipelinesPage, DealsReportsPage } from './DealsHubPages'
import {
  DealAiSetupPage,
  DealAssistantPage,
  DealAutomationPage,
  DealCalendarPage,
  DealCallsPage,
  DealContractsPage,
  DealMeetingsPage,
  DealOverviewPage,
  DealPipelinePage,
  DealProductsPage,
  DealReportsPage,
  DealSettingsPage,
  DealTasksPage,
  DealTeamPage,
} from './DealWorkspacePages'

/**
 * Route objects of the deals area (2026-10-03), spread into the MainLayout children in app/router.
 * `/deals` keeps its URL; static hub paths (`contracts`, `reports`, `pipelines`) rank above `:dealId`.
 * Workspace child paths must match features/deals DEAL_WORKSPACE_PAGES[].path.
 */
export const dealRoutes = [
  {
    path: 'deals',
    element: <DealsHubLayout />,
    children: [
      { index: true, element: <DealsListPage /> },
      { path: 'contracts', element: <DealsContractsPage /> },
      { path: 'reports', element: <DealsReportsPage /> },
      { path: 'pipelines', element: <DealsPipelinesPage /> },
    ],
  },
  {
    path: 'deals/:dealId',
    element: <DealWorkspaceLayout />,
    children: [
      { index: true, element: <DealOverviewPage /> },
      { path: 'pipeline', element: <DealPipelinePage /> },
      { path: 'contracts', element: <DealContractsPage /> },
      { path: 'team', element: <DealTeamPage /> },
      { path: 'meetings', element: <DealMeetingsPage /> },
      { path: 'calls', element: <DealCallsPage /> },
      { path: 'tasks', element: <DealTasksPage /> },
      { path: 'products', element: <DealProductsPage /> },
      { path: 'reports', element: <DealReportsPage /> },
      { path: 'calendar', element: <DealCalendarPage /> },
      { path: 'automation', element: <DealAutomationPage /> },
      { path: 'assistant', element: <DealAssistantPage /> },
      { path: 'ai', element: <DealAiSetupPage /> },
      { path: 'settings', element: <DealSettingsPage /> },
    ],
  },
]
