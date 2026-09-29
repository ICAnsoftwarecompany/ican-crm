/**
 * All /service/* routes, lazy-loaded so the Service area ships in its own
 * chunks. The app router spreads this object once; add new Service screens
 * HERE (not in app/router/index.jsx) to keep merges with other areas clean.
 *
 * Planned routes (add each when its phase ships):
 *   F2  /service/knowledge, /service/reports, /service/settings/*
 *   F3  /service/records/:recordType, /service/assets, /service/contracts, /service/handoffs
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
    // F0 — capabilities, demo template switcher, roadmap
    { path: 'overview', lazy: page(() => import('./ServiceOverviewPage'), 'ServiceOverviewPage') },
  ],
}
