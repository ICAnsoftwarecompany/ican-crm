/**
 * All /service/* routes, lazy-loaded so the Service area ships in its own
 * chunks. The app router spreads this object once; add new Service screens
 * HERE (not in app/router/index.jsx) to keep merges with other areas clean.
 *
 * Planned routes (add each when its phase ships):
 *   F5  portfolios + imports live in settings; the customer portal is a separate app (portal.html)
 */
const page = (loader, name) => () => loader().then((module) => ({ Component: module[name] }))

export const serviceRoutes = {
  path: 'service',
  lazy: page(() => import('./ServiceLayout'), 'ServiceLayout'),
  children: [
    // F1
    { index: true, lazy: page(() => import('./ServiceCenterPage'), 'ServiceCenterPage') },
    { path: 'cases', lazy: page(() => import('./ServiceCasesPage'), 'ServiceCasesPage') },
    { path: 'cases/:caseId', lazy: page(() => import('./ServiceCaseDetailPage'), 'ServiceCaseDetailPage') },
    { path: 'my-work', lazy: page(() => import('./ServiceMyWorkPage'), 'ServiceMyWorkPage') },
    // F2
    { path: 'reports', lazy: page(() => import('./ServiceReportsPage'), 'ServiceReportsPage') },
    { path: 'knowledge', lazy: page(() => import('./ServiceKnowledgePage'), 'ServiceKnowledgePage') },
    { path: 'knowledge/:articleId', lazy: page(() => import('./ServiceKnowledgeArticlePage'), 'ServiceKnowledgeArticlePage') },
    { path: 'settings/:section?', lazy: page(() => import('./ServiceSettingsPage'), 'ServiceSettingsPage') },
    // F3 — Services hub (one sidebar item, tabs in ServicesHubLayout)
    {
      lazy: page(() => import('./ServicesHubLayout'), 'ServicesHubLayout'),
      children: [
        { path: 'records/:recordType?', lazy: page(() => import('./ServiceRecordsPage'), 'ServiceRecordsPage') },
        { path: 'records/:recordType/:recordId', lazy: page(() => import('./ServiceRecordDetailPage'), 'ServiceRecordDetailPage') },
        { path: 'batches/:recordType?/:batchId?', lazy: page(() => import('./ServiceBatchesPage'), 'ServiceBatchesPage') },
        { path: 'assets/:assetId?', lazy: page(() => import('./ServiceAssetsPage'), 'ServiceAssetsPage') },
        { path: 'entitlements', lazy: page(() => import('./ServiceEntitlementsPage'), 'ServiceEntitlementsPage') },
        { path: 'contracts/:contractId?', lazy: page(() => import('./ServiceContractsPage'), 'ServiceContractsPage') },
        { path: 'handoffs/:handoffId?', lazy: page(() => import('./ServiceHandoffsPage'), 'ServiceHandoffsPage') },
        // F4
        { path: 'billing/:view?', lazy: page(() => import('./ServiceBillingPage'), 'ServiceBillingPage') },
        { path: 'deliveries', lazy: page(() => import('./ServiceDeliveriesPage'), 'ServiceDeliveriesPage') },
        { path: 'scheduling', lazy: page(() => import('./ServiceSchedulingPage'), 'ServiceSchedulingPage') },
        { path: 'work-orders/:workOrderId?', lazy: page(() => import('./ServiceWorkOrdersPage'), 'ServiceWorkOrdersPage') },
        { path: 'subscriptions/:subscriptionId?', lazy: page(() => import('./ServiceSubscriptionsPage'), 'ServiceSubscriptionsPage') },
        // F5
        { path: 'follow-ups', lazy: page(() => import('./ServiceFollowUpsPage'), 'ServiceFollowUpsPage') },
        { path: 'billing/schedules/:scheduleId', lazy: page(() => import('./ServiceBillingPage'), 'ServiceBillingPage') },
      ],
    },
    // F6 — major incidents
    { path: 'incidents/:incidentId?', lazy: page(() => import('./ServiceIncidentsPage'), 'ServiceIncidentsPage') },
    // F0 — capabilities, demo template switcher, roadmap
    { path: 'overview', lazy: page(() => import('./ServiceOverviewPage'), 'ServiceOverviewPage') },
  ],
}
