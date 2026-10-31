import { describe, expect, it } from 'vitest'
import { findWonStage, getOpenStages, isTerminalStage, resolveDealStages } from './dealStages'
import { normalizeDealDetail } from '../hooks/dealResponse'

const templateStages = [
  { id: 12, name: 'Won', order: 3, is_won_stage: true },
  { id: 10, name: 'New Lead', order: 1 },
  { id: 11, name: 'Negotiation', order: 2 },
  { id: 13, name: 'Lost', order: 4, is_lost_stage: true },
]

describe('resolveDealStages', () => {
  it('uses stages_summary returned beside data.deal, retaining actual deal-stage IDs and server order', () => {
    const summary = [{ id: 43, name: 'New', leads_count: 0 }, { id: 44, name: 'Negotiation', leads_count: 0 }, { id: 45, name: 'Won', leads_count: 0 }, { id: 46, name: 'Lost', leads_count: 0 }]
    const deal = normalizeDealDetail({ data: { deal: { name: 'Building', status: 'active' }, stats: { total_leads: 0 }, stages_summary: summary } }, '14')
    expect(deal).toMatchObject({ id: '14', name: 'Building', stats: { total_leads: 0 } })
    const stages = resolveDealStages(deal)
    expect(stages.map((stage) => stage.id)).toEqual([43, 44, 45, 46])
    expect(stages[0]).toMatchObject({ label: 'New', leads_count: 0 })
    expect(stages[2].is_won_stage).toBeUndefined()
  })

  it('prefers full deal stages over summaries and summaries over unrelated template IDs', () => {
    const summary = [{ id: 43, name: 'New' }]
    expect(resolveDealStages({ stages: [{ id: 90, name: 'Full' }], stages_summary: summary })[0].id).toBe(90)
    expect(resolveDealStages({ stages_summary: summary, pipeline_template: { stages: templateStages } })[0].id).toBe(43)
    expect(resolveDealStages(normalizeDealDetail({ data: { id: 14, stages: templateStages } }, 14))).toHaveLength(4)
    expect(resolveDealStages({ stages_summary: [] })).toEqual([])
  })
  it('prefers the deal stages, then the embedded template, then the templates list', () => {
    expect(resolveDealStages({ stages: [{ id: 1, name: 'A', order: 1 }], pipeline_template: { stages: templateStages } }).map((s) => s.id)).toEqual([1])
    expect(resolveDealStages({ pipeline_template: { stages: templateStages } }).map((s) => s.id)).toEqual([10, 11, 12, 13])
    expect(resolveDealStages({ pipeline_template_id: 5 }, [{ id: 5, stages: templateStages }])[0]).toMatchObject({ id: 10, label: 'New Lead' })
  })

  it('finds terminal stages', () => {
    const stages = resolveDealStages({ stages: templateStages })
    expect(findWonStage(stages).id).toBe(12)
    expect(isTerminalStage(stages[3])).toBe(true)
    expect(getOpenStages(stages).map((s) => s.id)).toEqual([10, 11])
  })
})
