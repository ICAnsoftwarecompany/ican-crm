import { buildTemplatePayload, validateStages } from './pipelineTemplate'

/**
 * Pure model of the "new deal" wizard (`/deals/new`). Steps, in order:
 * 1. pipeline  — choose an existing pipeline template or define a new one (stages)
 * 2. basics    — the deal's first data (name, type, status, dates, targets, owner)
 * 3. products  — the products the deal works on (decides the deal's product mode)
 * 4. team      — users or whole teams with a role
 * 5. review    — sends the requests in order (see `buildWizardRequests`)
 */
export const WIZARD_STEPS = ['pipeline', 'basics', 'products', 'team', 'review']

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
    team: { members: [], addOwner: true },
  }
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
  }
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
 * The requests the wizard sends, in order (Postman bodies):
 * 1. `POST /api/tenant/pipeline-templates` (only for a new pipeline)
 * 2. `POST /api/tenant/deals`
 * 3. `POST /api/tenant/deals/team` once per member (a user OR a team)
 * 4. `POST /api/tenant/deals/products` with `product_ids` (skipped without products)
 * `deal`, `team` and `products` take the ids created by the earlier requests.
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
    team: (dealId) => resolveTeamMembers(state).map((member) => ({
      deal_id: toNumber(dealId) ?? dealId,
      [member.kind === 'team' ? 'team_id' : 'user_id']: toNumber(member.refId) ?? member.refId,
      role: member.role,
    })),
    products: (dealId) => (state.products.ids.length
      ? { deal_id: toNumber(dealId) ?? dealId, product_ids: state.products.ids.map((id) => toNumber(id) ?? id) }
      : null),
  }
}

/** Id from a create response (`{ data: { id } }`, `{ data: { deal: { id } } }`, `{ id }`). */
export function extractCreatedId(response, key) {
  const data = response?.data ?? response
  return data?.id ?? data?.[key]?.id ?? data?.data?.id ?? response?.id ?? null
}
