import { describe, expect, it } from 'vitest'
import { findWonStage, getOpenStages, isTerminalStage, resolveDealStages } from './dealStages'

const templateStages = [
  { id: 12, name: 'Won', order: 3, is_won_stage: true },
  { id: 10, name: 'New Lead', order: 1 },
  { id: 11, name: 'Negotiation', order: 2 },
  { id: 13, name: 'Lost', order: 4, is_lost_stage: true },
]

describe('resolveDealStages', () => {
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
