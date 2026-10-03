/**
 * Which deal endpoints the frontend may call today.
 *
 * - `live`: the endpoint is in the backend Postman collection "Deals Workspace" (2026-10-03) and the UI calls it.
 *   Shapes follow the collection and docs/deals/DEALS-WORKSPACE-SPEC.md; not every one was verified against a
 *   running server — the UI always shows the backend's own error message when a call fails.
 * - `planned`: proposed in docs/deals/DEALS-WORKSPACE-SPEC.md §9 (backend contract) and NOT in the collection.
 *   The UI for it exists, but the action is disabled and a notice says the backend is needed. When the backend
 *   ships it, flip the value to `live` here — no page or hook changes.
 *
 * Never fake a planned action with local state: a disabled button is honest, a fake success is not.
 */
export const DEAL_API_STATUS = {
  // Deals + pipeline templates
  deals: 'live',
  pipelineTemplates: 'live',
  // Team + products of a deal
  team: 'live',
  teamRoleUpdate: 'planned',
  products: 'live',
  // Deal leads
  leadsList: 'live',
  leadsAddExisting: 'live',
  leadsCreate: 'live',
  leadsBulkAssign: 'live',
  leadsChangeStage: 'live',
  leadProducts: 'live',
  leadsImport: 'planned',
  leadsDistribute: 'planned',
  leadRemove: 'planned',
  leadReopen: 'planned',
  // Closing
  leadWon: 'live',
  leadLost: 'live',
  // Contracts
  contracts: 'live',
  installmentPayment: 'planned',
  // Analytics
  analyticsOverview: 'live',
  analyticsOwners: 'live',
  analyticsFunnel: 'planned',
  analyticsSources: 'planned',
  // Links to other modules (tasks / calls / meetings with taskable = Deal or Contract). They use the existing
  // generic `taskable_type` / `taskable_id` fields; the backend must accept `App\\Models\\Deal` there (the won flow
  // already creates tasks on `App\\Models\\Contract`). Unverified — a rejection shows the backend's message.
  dealLinkedActivities: 'live',
  dealLinkedTasks: 'live',
  // Workspace extras
  dealSettings: 'planned',
  dealActivityLog: 'planned',
  dealAi: 'planned',
}

export function isDealApiLive(capability) {
  return DEAL_API_STATUS[capability] === 'live'
}

export function getPlannedDealCapabilities() {
  return Object.entries(DEAL_API_STATUS)
    .filter(([, status]) => status === 'planned')
    .map(([capability]) => capability)
}
