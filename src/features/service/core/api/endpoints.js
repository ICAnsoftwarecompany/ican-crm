/**
 * Base paths for Service Operations endpoints.
 * Contract source: docs/customer-service/SERVICE-MASTER-SPEC.md (section 51).
 * Keep paths identical to the backend contract so switching a module from
 * mock to live is a one-line change in serviceModules.js.
 */
export const TENANT_API = '/api/tenant'
export const SERVICE_API = `${TENANT_API}/service`

export const serviceEndpoints = {
  capabilities: `${TENANT_API}/me/capabilities`,

  // Cases (F1)
  cases: `${SERVICE_API}/cases`,
  caseFromConversation: (conversationId) => `${SERVICE_API}/cases/from-conversation/${conversationId}`,
  case: (caseId) => `${SERVICE_API}/cases/${caseId}`,
  caseTransition: (caseId) => `${SERVICE_API}/cases/${caseId}/transition`,
  caseAssign: (caseId) => `${SERVICE_API}/cases/${caseId}/assign`,
  caseActivities: (caseId) => `${SERVICE_API}/cases/${caseId}/activities`,
  caseReply: (caseId) => `${SERVICE_API}/cases/${caseId}/reply`,
  caseNotes: (caseId) => `${SERVICE_API}/cases/${caseId}/notes`,
  // F2 — run a macro (ordered actions: reply, set_status, set_priority, add_note) atomically.
  caseApplyMacro: (caseId) => `${SERVICE_API}/cases/${caseId}/apply-macro`,
  // F2 — published KB articles relevant to the case (type + subject). Proposed contract.
  caseSuggestedArticles: (caseId) => `${SERVICE_API}/cases/${caseId}/suggested-articles`,
  // Setup data a case screen needs in one call: case types (with pipelines),
  // queues, agents and resolution codes. Split per settings module in F2.
  caseSetup: `${SERVICE_API}/cases/setup`,
  // Counts per built-in view (open, mine, unassigned…) for tabs and Service Center.
  caseSummary: `${SERVICE_API}/cases/summary`,
  // Lightweight customer search for pickers. Proposed contract (not in spec §51 yet):
  // returns [{ id, name, phone }].
  customerLookup: `${SERVICE_API}/customers/lookup`,

  // My Work (F1) — work_items read model for the signed-in user (spec §20.2).
  myWork: `${TENANT_API}/my-work`,

  // Contacts (F1) — people under a customer + relationships (spec §24.2). Core
  // customer endpoints; served by the Service mock until the backend ships them.
  customerContacts: (customerId) => `${TENANT_API}/customers/${customerId}/contacts`,
  contactsSetup: `${TENANT_API}/contacts/setup`,

  // Settings (F2) — tenant configuration resources. Each is a plain CRUD:
  // GET list, POST, GET/PATCH/DELETE /{id}. Case types and queues feed cases/setup.
  settings: {
    caseTypes: `${SERVICE_API}/case-types`,
    queues: `${SERVICE_API}/queues`,
    slaPolicies: `${SERVICE_API}/sla-policies`,
    businessCalendars: `${SERVICE_API}/business-calendars`,
    escalationRules: `${SERVICE_API}/escalation-rules`,
    savedReplies: `${SERVICE_API}/saved-replies`,
    macros: `${SERVICE_API}/macros`,
    kbCategories: `${SERVICE_API}/kb/categories`,
    // F3 — catalog & records configuration (spec §25, §33.2, §11)
    itemTypes: `${TENANT_API}/catalog/item-types`,
    recordTypes: `${SERVICE_API}/record-types`,
    pipelines: `${TENANT_API}/pipelines`,
    contractTypes: `${TENANT_API}/contract-types`,
    // F4 — Billing Lite (spec §29): plan library + where plans apply.
    paymentPlans: `${TENANT_API}/billing/payment-plans`,
    planAssignments: `${TENANT_API}/billing/payment-plan-assignments`,
  },

  // Catalog (F3) — capability registry + model presets are code-owned (read-only; proposed endpoints).
  // Items = the existing Products & Services joined with `service_config`; only that part is edited here.
  catalogCapabilities: `${TENANT_API}/catalog/capabilities`,
  catalogServiceModels: `${TENANT_API}/catalog/service-models`,
  catalogItems: `${TENANT_API}/catalog/items`,
  catalogItem: (itemId) => `${TENANT_API}/catalog/items/${itemId}`,

  // Service records & batches (F3, spec §33). Nested: participants, components, entries, documents, timeline, updates.
  records: `${SERVICE_API}/records`,
  batches: `${SERVICE_API}/batches`,

  // Assets, warranties, entitlements (F3, spec §34–35).
  assets: `${SERVICE_API}/assets`,
  warranties: `${SERVICE_API}/warranties`,
  entitlements: `${SERVICE_API}/entitlements`,

  // Contracts (shared module, spec §27) and Sales → Service handoffs (§32).
  contracts: `${TENANT_API}/contracts`,
  handoffs: `${SERVICE_API}/handoffs`,

  // Subscriptions (spec §30, §51 `CRUD /subscriptions (+ /cancel, /suspend, /resume, /renew)`).
  subscriptions: `${TENANT_API}/subscriptions`,

  // Scheduling (spec §19): resources (proposed CRUD), reservations (§51 `POST /reservations`, `DELETE /reservations/{id}`
  // + proposed `/confirm`), slots (`GET /scheduling/availability`). Work orders (§38, §51 `/service/work-orders`).
  schedulingResources: `${TENANT_API}/scheduling/resources`,
  schedulingAvailability: `${TENANT_API}/scheduling/availability`,
  reservations: `${TENANT_API}/reservations`,
  workOrders: `${SERVICE_API}/work-orders`,
  // Courier dispatch + proof of delivery (spec §38.4, proposed) and COD remittances (§51 `CRUD /billing/cod-remittances`).
  deliveries: `${SERVICE_API}/deliveries`,
  codRemittances: `${TENANT_API}/billing/cod-remittances`,

  // Portal administration (F5, spec §43–44): policies + request catalog are §51 CRUD; accounts, memberships and
  // portal settings are proposed staff endpoints. The portal app itself calls PORTAL_API (see features/portal).
  portalPolicies: `${TENANT_API}/portal/policies`,
  requestCatalog: `${SERVICE_API}/catalog-items`,
  portalSettings: `${TENANT_API}/portal/settings`,
  portalAccounts: `${TENANT_API}/portal/accounts`,

  // Import engine (F5, spec §15.1 / §51 `POST /imports (dry_run)`, `POST /imports/{id}/execute`, `GET /imports/{id}`).
  // Entities, fields, files, error-file and mappings endpoints are proposed.
  imports: `${TENANT_API}/imports`,

  // Setup wizard (F3, spec §47.2): industry templates + apply (with dry run).
  setupTemplates: `${TENANT_API}/settings/templates`,
  // Billing Lite (F4) — preview never saves; schedules are created from signed contracts.
  paymentPlanPreview: (planId) => `${TENANT_API}/billing/payment-plans/${planId}/preview`,
  // Schedules: GET /{id} + POST /{id}/payments|reschedule|cancel|payoff-quote (spec §51); list, promises,
  // reschedule approve/reject, payment reverse and /collections are proposed additions (see billing/README.md).
  billing: {
    schedules: `${TENANT_API}/billing/schedules`,
    payments: `${TENANT_API}/billing/payments`,
    lines: `${TENANT_API}/billing/lines`,
    collections: `${TENANT_API}/billing/collections`,
  },

  setupApply: (key) => `${TENANT_API}/settings/templates/${key}/apply`,

  // Knowledge base (F2) — CRUD + publish (kb.publish permission). New articles start as drafts.
  kbArticles: `${SERVICE_API}/kb/articles`,
  kbArticle: (articleId) => `${SERVICE_API}/kb/articles/${articleId}`,
  kbArticlePublish: (articleId) => `${SERVICE_API}/kb/articles/${articleId}/publish`,

  // Feedback & reports (F2) — spec §42, §51 (`/service/reports/{report_key}`).
  feedbackResponses: `${SERVICE_API}/feedback/responses`,
  reportOverview: `${SERVICE_API}/reports/overview`,

  // Saved views (F2) — core, cross-module (spec §51 `CRUD /saved-views`); filtered by `entity`.
  savedViews: `${TENANT_API}/saved-views`,
}
