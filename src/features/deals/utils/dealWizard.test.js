import { describe, expect, it } from 'vitest'
import { buildWizardRequests, createWizardState, extractCreatedId, firstInvalidStepBefore, validateWizardStep } from './dealWizard'
import { validateStages } from './pipelineTemplate'

function filledState() {
  const state = createWizardState(['New Lead', 'Negotiation', 'Won', 'Lost'])
  state.pipeline.mode = 'new'
  state.pipeline.name = 'Sales Pipeline'
  state.basics = { ...state.basics, name: 'Q4 Sales Deal', description: 'Sales campaign for Q4', start_date: '2026-10-01', end_date: '2026-12-31', target_revenue: '500000', target_leads: '1000', owner_id: '2' }
  state.products.ids = ['1', '5', '8']
  state.team.members = [{ kind: 'team', refId: '3', role: 'manager' }, { kind: 'user', refId: '1', role: 'sales_rep' }]
  return state
}

describe('deal wizard', () => {
  it('builds the exact Postman bodies in order', () => {
    const requests = buildWizardRequests(filledState())
    expect(requests.template).toEqual({
      name: 'Sales Pipeline', type: 'sales', status: true,
      stages: [
        { name: 'New Lead', order: 1, is_won_stage: false, is_lost_stage: false, color: '#3B82F6' },
        { name: 'Negotiation', order: 2, is_won_stage: false, is_lost_stage: false, color: '#F59E0B' },
        { name: 'Won', order: 3, is_won_stage: true, is_lost_stage: false, color: '#10B981' },
        { name: 'Lost', order: 4, is_won_stage: false, is_lost_stage: true, color: '#EF4444' },
      ],
    })
    expect(requests.deal(5)).toEqual({
      pipeline_template_id: 5, name: 'Q4 Sales Deal', description: 'Sales campaign for Q4', type: 'sales', status: 'active',
      start_date: '2026-10-01', end_date: '2026-12-31', target_revenue: 500000, target_leads: 1000, owner_id: 2,
    })
    expect(requests.team(10)).toEqual([
      { deal_id: 10, user_id: 2, role: 'manager' },
      { deal_id: 10, team_id: 3, role: 'manager' },
      { deal_id: 10, user_id: 1, role: 'sales_rep' },
    ])
    expect(requests.products(10)).toEqual({ deal_id: 10, product_ids: [1, 5, 8] })
  })

  it('uses an existing template and skips empty products', () => {
    const state = filledState()
    state.pipeline.mode = 'existing'
    state.pipeline.templateId = '7'
    state.products.ids = []
    state.team.addOwner = false
    const requests = buildWizardRequests(state)
    expect(requests.template).toBeNull()
    expect(requests.deal('7').pipeline_template_id).toBe(7)
    expect(requests.products(1)).toBeNull()
    expect(requests.team(1)).toHaveLength(2)
  })

  it('validates each step', () => {
    const state = createWizardState()
    expect(validateWizardStep('pipeline', state)).toEqual({ templateId: 'templateRequired' })
    state.pipeline.mode = 'new'
    expect(validateWizardStep('pipeline', state)).toMatchObject({ name: 'pipelineNameRequired', stages: ['noStages'] })
    expect(validateWizardStep('basics', state)).toEqual({ name: 'nameRequired' })
    expect(firstInvalidStepBefore('review', state)).toBe('pipeline')
    state.team.members = [{ kind: 'user', refId: '1', role: 'manager' }, { kind: 'user', refId: '1', role: 'viewer' }]
    expect(validateWizardStep('team', state)).toEqual({ members: 'duplicateMember' })
  })

  it('checks stage rules', () => {
    expect(validateStages([{ name: 'Won', is_won_stage: true }])).toEqual(['noOpenStage'])
    expect(validateStages([{ name: 'A' }, { name: 'a' }, { name: 'W1', is_won_stage: true }, { name: 'W2', is_won_stage: true }])).toEqual(['manyWon', 'duplicateNames'])
  })

  it('reads created ids from the usual response shapes', () => {
    expect(extractCreatedId({ data: { id: 9 } })).toBe(9)
    expect(extractCreatedId({ data: { deal: { id: 4 } } }, 'deal')).toBe(4)
    expect(extractCreatedId({ id: 3 })).toBe(3)
    expect(extractCreatedId({})).toBeNull()
  })
})
