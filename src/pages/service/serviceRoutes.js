/**
 * All /service/* routes, lazy-loaded so the Service area ships in its own
 * chunks. The app router spreads this object once; add new Service screens
 * HERE (not in app/router/index.jsx) to keep merges with other areas clean.
 *
 * Route map (planned — add each when its phase ships):
 *   F1  /service/center, /service/cases, /service/cases/:caseId
 *   F2  /service/knowledge, /service/reports, /service/settings/*
 *   F3  /service/records/:recordType, /service/assets, /service/contracts, /service/handoffs
 *   F4  /service/billing, /service/scheduling, /service/work-orders
 *   F5  /service/follow-ups, /service/portfolios, /service/imports  (+ separate portal app)
 */
export const serviceRoutes = {
  path: 'service',
  lazy: () => import('./ServiceLayout').then((module) => ({ Component: module.ServiceLayout })),
  children: [
    {
      index: true,
      lazy: () => import('./ServiceOverviewPage').then((module) => ({ Component: module.ServiceOverviewPage })),
    },
  ],
}
