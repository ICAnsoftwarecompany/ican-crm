/**
 * React Query keys for the whole Service Operations area.
 * Every sub-module adds its keys here under `serviceKeys.all` so one
 * invalidation (e.g. after switching the mock industry template) refreshes
 * everything that belongs to Customer Service — and nothing else.
 */
export const serviceKeys = {
  all: ['service'],
  capabilities: () => [...serviceKeys.all, 'capabilities'],

  // Cases (F1)
  cases: () => [...serviceKeys.all, 'cases'],
  caseList: (params) => [...serviceKeys.cases(), 'list', params ?? {}],
  caseSummary: () => [...serviceKeys.cases(), 'summary'],
  caseDetail: (caseId) => [...serviceKeys.cases(), 'detail', String(caseId)],
  caseActivities: (caseId) => [...serviceKeys.cases(), 'activities', String(caseId)],
  caseSetup: () => [...serviceKeys.cases(), 'setup'],
  customerLookup: (search) => [...serviceKeys.all, 'customer-lookup', search ?? ''],

  // My Work (F1) — read model of everything assigned to the current user.
  myWork: () => [...serviceKeys.all, 'my-work'],

  // Contacts (F1)
  contacts: (customerId) => [...serviceKeys.all, 'contacts', String(customerId)],
  contactsSetup: () => [...serviceKeys.all, 'contacts-setup'],

  // Settings (F2) — one list per configuration resource (caseTypes, queues, slaPolicies…)
  settings: (resourceKey) => [...serviceKeys.all, 'settings', resourceKey],

  // Knowledge base (F2)
  kb: () => [...serviceKeys.all, 'kb'],
  kbArticles: (params) => [...serviceKeys.kb(), 'articles', params ?? {}],
  kbArticle: (articleId) => [...serviceKeys.kb(), 'article', String(articleId)],
  caseSuggestedArticles: (caseId) => [...serviceKeys.kb(), 'suggested', String(caseId)],

  // Reports & feedback (F2)
  reportOverview: (period) => [...serviceKeys.all, 'reports', 'overview', period],
  feedbackResponses: (params) => [...serviceKeys.all, 'feedback', params ?? {}],

  // Catalog (F3)
  catalog: () => [...serviceKeys.all, 'catalog'],
  capabilityRegistry: () => [...serviceKeys.catalog(), 'capabilities'],
  serviceModels: () => [...serviceKeys.catalog(), 'service-models'],
  catalogItems: (params) => [...serviceKeys.catalog(), 'items', params ?? {}],

  // Service records & batches (F3)
  records: () => [...serviceKeys.all, 'records'],
  recordsSetup: () => [...serviceKeys.records(), 'setup'],
  recordList: (params) => [...serviceKeys.records(), 'list', params ?? {}],
  recordSummary: (params) => [...serviceKeys.records(), 'summary', params ?? {}],
  recordDetail: (recordId) => [...serviceKeys.records(), 'detail', String(recordId)],
  recordSection: (recordId, section) => [...serviceKeys.records(), 'section', String(recordId), section],
  batches: (params) => [...serviceKeys.records(), 'batches', params ?? {}],
  batchDetail: (batchId) => [...serviceKeys.records(), 'batch', String(batchId)],

  // Assets & entitlements (F3)
  assets: () => [...serviceKeys.all, 'assets'],
  assetList: (params) => [...serviceKeys.assets(), 'list', params ?? {}],
  assetDetail: (assetId) => [...serviceKeys.assets(), 'detail', String(assetId)],
  entitlements: () => [...serviceKeys.all, 'entitlements'],
  entitlementList: (params) => [...serviceKeys.entitlements(), 'list', params ?? {}],
  entitlementDetail: (id) => [...serviceKeys.entitlements(), 'detail', String(id)],
  entitlementCheck: (params) => [...serviceKeys.entitlements(), 'check', params ?? {}],

  // Contracts & handoffs (F3)
  contracts: () => [...serviceKeys.all, 'contracts'],
  contractList: (params) => [...serviceKeys.contracts(), 'list', params ?? {}],
  contractDetail: (id) => [...serviceKeys.contracts(), 'detail', String(id)],
  handoffs: () => [...serviceKeys.all, 'handoffs'],
  handoffList: (params) => [...serviceKeys.handoffs(), 'list', params ?? {}],
  handoffDetail: (id) => [...serviceKeys.handoffs(), 'detail', String(id)],

  // Billing Lite (F4)
  billing: () => [...serviceKeys.all, 'billing'],
  plansForItem: (itemId) => [...serviceKeys.billing(), 'plans-for-item', String(itemId)],
  scheduleList: (params) => [...serviceKeys.billing(), 'schedules', params ?? {}],
  scheduleDetail: (id) => [...serviceKeys.billing(), 'schedule', String(id)],
  collections: (params) => [...serviceKeys.billing(), 'collections', params ?? {}],

  // Subscriptions (F4)
  subscriptions: () => [...serviceKeys.all, 'subscriptions'],
  subscriptionList: (params) => [...serviceKeys.subscriptions(), 'list', params ?? {}],
  subscriptionDetail: (id) => [...serviceKeys.subscriptions(), 'detail', String(id)],

  // Scheduling & work orders (F4)
  scheduling: () => [...serviceKeys.all, 'scheduling'],
  reservations: (params) => [...serviceKeys.scheduling(), 'reservations', params ?? {}],
  availability: (params) => [...serviceKeys.scheduling(), 'availability', params ?? {}],
  workOrders: () => [...serviceKeys.all, 'work-orders'],
  workOrderList: (params) => [...serviceKeys.workOrders(), 'list', params ?? {}],
  workOrderDetail: (id) => [...serviceKeys.workOrders(), 'detail', String(id)],

  // Deliveries & COD (F4)
  deliveries: () => [...serviceKeys.all, 'deliveries'],
  deliveryList: (params) => [...serviceKeys.deliveries(), 'list', params ?? {}],
  remittances: (params) => [...serviceKeys.deliveries(), 'remittances', params ?? {}],

  // Saved views (F2) — per entity (e.g. service_case)
  savedViews: (entity) => [...serviceKeys.all, 'saved-views', entity],
}
