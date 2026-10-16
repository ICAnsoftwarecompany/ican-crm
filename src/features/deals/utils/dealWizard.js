import { buildCampaignsPayload, buildExistingLeadsPayload, createLeadSourceState, newLeadRows, validateLeadSource } from './leadSource'
import { buildTemplatePayload, validateStages } from './pipelineTemplate'

/**
 * Pure model of the "new deal" wizard (`/deals/new`). Steps, in order:
 * 1. pipeline  — choose an existing pipeline template or define a new one (stages)
 * 2. basics    — the deal's first data (name, type, status, dates, targets, owner)
 * 3. products  — the products the deal works on (decides the deal's product mode)
 * 4. team      — ready teams and/or users picked one by one, each with a role (one request)
 * 5. source    — where the leads come from: linked campaigns, CRM / new leads ("free" deal) or later (utils/leadSource)
 * 6. review    — sends the requests in order (see `buildWizardRequests`)
 */
export const WIZARD_STEPS = ['pipeline', 'basics', 'products', 'team', 'source', 'review']

export const DEFAULT_WIZARD_STAGES = [
  { name: '', color: '#3B82F6', is_won_stage: false, is_lost_stage: false },
  { name: '', color: '#F59E0B', is_won_stage: false, is_lost_stage: false },
  { name: '', color: '#10B981', is_won_stage: true, is_lost_stage: false },
  { name: '', color: '#EF4444', is_won_stage: false, is_lost_stage: true },
]

export function createWizardState(stageNames = []) {
  return {
    pipeline: {
      mode: 'existing',
      templateId: '',
      name: '',
      type: 'sales',
      stages: DEFAULT_WIZARD_STAGES.map((stage, index) => ({ ...stage, name: stageNames[index] || '' })),
    },
    basics: { name: '', description: '', type: 'sales', status: 'active', start_date: '', end_date: '', target_revenue: '', target_leads: '', owner_id: '' },
    products: { ids: [] },
    team: { members: [], addOwner: true, chat: { mode: 'new', groupId: '', userIds: [] } },
    source: createLeadSourceState(),
  }
}

/** A saved draft from before a step existed gets that step's defaults. */
export function withWizardDefaults(state, stageNames) {
  const defaults = createWizardState(stageNames)
  if (!state) return defaults
  const team = { ...defaults.team, ...(state.team || {}) }
  return { ...defaults, ...state, team: { ...team, chat: { ...defaults.team.chat, ...(team.chat || {}) } }, source: { ...defaults.source, ...(state.source || {}) } }
}

/** Errors of one step as i18n keys (`dealWorkspace.wizard.errors.*`); empty object = step is valid. */
export function validateWizardStep(step, state) {
  const errors = {}
  if (step === 'pipeline') {
    if (state.pipeline.mode === 'existing' && !state.pipeline.templateId) errors.templateId = 'templateRequired'
    if (state.pipeline.mode === 'new') {
      if (!String(state.pipeline.name).trim()) errors.name = 'pipelineNameRequired'
      const stageErrors = validateStages(state.pipeline.stages)
      if (stageErrors.length) errors.stages = stageErrors
    }
  }
  if (step === 'basics') {
    const basics = state.basics
    if (!String(basics.name).trim()) errors.name = 'nameRequired'
    if (basics.start_date && basics.end_date && basics.end_date < basics.start_date) errors.end_date = 'endBeforeStart'
    if (basics.target_revenue !== '' && Number(basics.target_revenue) < 0) errors.target_revenue = 'negative'
    if (basics.target_leads !== '' && Number(basics.target_leads) < 0) errors.target_leads = 'negative'
  }
  if (step === 'team') {
    const keys = state.team.members.map((member) => `${member.kind}:${member.refId}`)
    if (new Set(keys).size !== keys.length) errors.members = 'duplicateMember'
    if (state.team.members.some((member) => !member.refId || !member.role)) errors.members = 'incompleteMember'
    const chat = state.team.chat || {}
    // No users → no group is sent (buildChatGroupRequest); only an existing group without a pick blocks the step.
    if (chat.mode === 'existing' && !chat.groupId) errors.chatGroup = 'chatGroupRequired'
  }
  if (step === 'source') Object.assign(errors, validateLeadSource(state.source))
  return errors
}

export function isWizardStepValid(step, state) {
  return Object.keys(validateWizardStep(step, state)).length === 0
}

/** First step with errors before `step` (to block jumping ahead), or null. */
export function firstInvalidStepBefore(step, state) {
  const index = WIZARD_STEPS.indexOf(step)
  return WIZARD_STEPS.slice(0, index).find((id) => !isWizardStepValid(id, state)) || null
}

const toNumber = (value) => (value === '' || value === null || value === undefined ? undefined : Number(value))

/** Team rows to send: the chosen members, plus the owner as manager when asked and not already listed. */
export function resolveTeamMembers(state) {
  const members = state.team.members.map((member) => ({ kind: member.kind, refId: member.refId, role: member.role }))
  const ownerId = state.basics.owner_id
  if (state.team.addOwner && ownerId && !members.some((member) => member.kind === 'user' && String(member.refId) === String(ownerId))) {
    members.unshift({ kind: 'user', refId: ownerId, role: 'manager' })
  }
  return members
}

/**
 * One `POST /deals/team` body for the whole team (2026-10-16): users and ready teams in their own lists.
 * Returns null when there is nobody to add.
 */
export function buildTeamPayload(members = [], dealId) {
  const users = members.filter((member) => member.kind !== 'team').map((member) => ({ user_id: toNumber(member.refId) ?? member.refId, role: member.role }))
  const teams = members.filter((member) => member.kind === 'team').map((member) => ({ team_id: toNumber(member.refId) ?? member.refId, role: member.role }))
  if (!users.length && !teams.length) return null
  return { deal_id: toNumber(dealId) ?? dealId, ...(users.length ? { users } : {}), ...(teams.length ? { teams } : {}) }
}

/** `{ users, teams }` counts of the team that will be sent (owner included when added). */
export function countTeam(state) {
  const members = resolveTeamMembers(state)
  return { users: members.filter((member) => member.kind !== 'team').length, teams: members.filter((member) => member.kind === 'team').length }
}

/**
 * The requests the wizard sends, in order (Postman bodies):
 * 1. `POST /api/tenant/pipeline-templates` (only for a new pipeline)
 * 2. `POST /api/tenant/deals`
 * 3. `POST /api/tenant/deals/team` once for the whole team: `{ deal_id, users: [{ user_id, role }], teams: [{ team_id, role }] }`
 *    (empty lists are left out; skipped when nobody was chosen)
 * 4. `POST /api/tenant/deals/products` with `product_ids` (skipped without products)
 * 5. source: `POST /api/tenant/deals/{id}/campaigns` `{ campaign_ids, is_active }` (campaigns mode), or
 *    `POST /api/tenant/deals/leads/add-existing` once + `POST /api/tenant/deals/leads/create` per new lead (leads mode)
 * `deal`, `team`, `products` and the source requests take the ids created by the earlier requests.
 */
export function buildWizardRequests(state) {
  const template = state.pipeline.mode === 'new'
    ? buildTemplatePayload({ name: state.pipeline.name, type: state.pipeline.type, status: true, stages: state.pipeline.stages })
    : null
  const basics = state.basics
  return {
    template,
    deal: (templateId) => Object.fromEntries(Object.entries({
      pipeline_template_id: toNumber(templateId) ?? templateId,
      name: String(basics.name).trim(),
      description: String(basics.description || '').trim() || undefined,
      type: basics.type,
      status: basics.status,
      start_date: basics.start_date || undefined,
      end_date: basics.end_date || undefined,
      target_revenue: toNumber(basics.target_revenue),
      target_leads: toNumber(basics.target_leads),
      owner_id: toNumber(basics.owner_id),
    }).filter(([, value]) => value !== undefined && value !== '')),
    team: (dealId) => buildTeamPayload(resolveTeamMembers(state), dealId),
    products: (dealId) => (state.products.ids.length
      ? { deal_id: toNumber(dealId) ?? dealId, product_ids: state.products.ids.map((id) => toNumber(id) ?? id) }
      : null),
    // Internal chat group of the team: create '<name> G<n>' or add the users to an existing group (useDealCreateWizard).
    chatGroup: buildChatGroupRequest(state),
    campaigns: () => buildCampaignsPayload(state.source),
    existingLeads: (dealId) => buildExistingLeadsPayload(state.source, dealId),
    newLeads: newLeadRows(state.source),
  }
}

/** `{ mode: 'new' | 'existing', groupId, userIds, dealName }` or null (no group, or nobody to add). */
export function buildChatGroupRequest(state) {
  const chat = state.team?.chat || {}
  const userIds = (chat.userIds || []).map((id) => toNumber(id) ?? id)
  if ((chat.mode !== 'new' && chat.mode !== 'existing') || !userIds.length) return null
  if (chat.mode === 'existing' && !chat.groupId) return null
  return { mode: chat.mode, groupId: chat.groupId || '', userIds, dealName: String(state.basics.name || '').trim() }
}

/** Id from a create response (`{ data: { id } }`, `{ data: { deal: { id } } }`, `{ id }`). */
export function extractCreatedId(response, key) {
  const data = response?.data ?? response
  return data?.id ?? data?.[key]?.id ?? data?.data?.id ?? response?.id ?? null
}
