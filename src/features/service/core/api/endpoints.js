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
  },

  // Knowledge base (F2) — CRUD + publish (kb.publish permission). New articles start as drafts.
  kbArticles: `${SERVICE_API}/kb/articles`,
  kbArticle: (articleId) => `${SERVICE_API}/kb/articles/${articleId}`,
  kbArticlePublish: (articleId) => `${SERVICE_API}/kb/articles/${articleId}/publish`,
}
