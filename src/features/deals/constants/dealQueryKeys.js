/**
 * React Query keys of the deals feature. `['deals']` stays the root so one invalidation refreshes the
 * whole area (no realtime handler updates these keys today).
 */
export const dealKeys = {
  all: ['deals'],
  list: (params) => ['deals', 'list', params],
  detail: (id) => ['deals', 'detail', id],
  templates: ['deals', 'pipeline-templates'],
  template: (id) => ['deals', 'pipeline-templates', id],
  leads: (id, params) => ['deals', id, 'leads', params],
  leadProducts: (dealLeadId) => ['deals', 'lead-products', dealLeadId],
  team: (id) => ['deals', id, 'team'],
  products: (id) => ['deals', id, 'products'],
  contracts: (params) => ['deals', 'contracts', params],
  contract: (id) => ['deals', 'contracts', 'detail', id],
  analytics: (id, kind) => ['deals', id, 'analytics', kind],
}
