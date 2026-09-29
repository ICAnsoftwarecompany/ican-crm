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

  // Saved views (F2) — per entity (e.g. service_case)
  savedViews: (entity) => [...serviceKeys.all, 'saved-views', entity],
}
