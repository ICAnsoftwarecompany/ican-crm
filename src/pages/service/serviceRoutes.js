/**
 * All /service/* routes, lazy-loaded so the Service area ships in its own
 * chunks. The app router spreads this object once; add new Service screens
 * HERE (not in app/router/index.jsx) to keep merges with other areas clean.
 *
 * Planned routes (add each when its phase ships):
 *   F3  /service/assets, /service/entitlements, /service/contracts, /service/handoffs (inside the Services hub)
 *   F4  /service/billing, /service/scheduling, /service/work-orders
 *   F5  /service/follow-ups, /service/portfolios, /service/imports  (+ separate portal app)
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
      ],
    },
    // F0 — capabilities, demo template switcher, roadmap
    { path: 'overview', lazy: page(() => import('./ServiceOverviewPage'), 'ServiceOverviewPage') },
  ],
}
