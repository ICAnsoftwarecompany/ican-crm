import { describe, expect, it } from 'vitest'
import { normalizeRule, toRuleForm } from '../../utils/ruleModel'
import { firstInvalidStep, isBroaderOrEqual, nextLeadsPreview, placeRule, reachableSteps, stepErrors, suggestPriority, targetPreview } from './ruleBuilder'

const form = (patch = {}) => ({ ...toRuleForm(null), ...patch })

describe('rule builder steps', () => {
  it('validates one step at a time', () => {
    expect(stepErrors('basics', form())).toEqual({ name: 'nameRequired' })
    expect(stepErrors('conditions', form())).toEqual({})
    expect(stepErrors('target', form({ name: 'A' }))).toEqual({ team_id: 'teamRequired' })
    expect(stepErrors('priority', form({ priority: '' }))).toEqual({ priority: 'priorityInvalid' })
  })

  it('finds the first invalid step and the reachable ones', () => {
    expect(firstInvalidStep(form())).toBe('basics')
    expect(reachableSteps(form())).toEqual(['basics'])
    expect(firstInvalidStep(form({ name: 'A' }))).toBe('target')
    expect(reachableSteps(form({ name: 'A' }))).toEqual(['basics', 'conditions', 'method', 'target'])
    expect(firstInvalidStep(form({ name: 'A', team_id: '2' }))).toBe('')
    expect(reachableSteps(form({ name: 'A', team_id: '2' }))).toHaveLength(6)
  })
})

describe('target preview', () => {
  const ali = { id: 1, name: 'Ali' }
  const mona = { id: 2, name: 'Mona' }
  const omar = { id: 3, name: 'Omar' }
  const teamById = new Map([['2', { id: '2', leader: ali, members: [mona, omar] }], ['3', { id: '3', leader: ali, members: [] }]])
  const userById = new Map([['3', omar]])

  it('cycles members for round robin', () => {
    const f = form({ team_id: '2' })
    expect(nextLeadsPreview(f, targetPreview(f, { teamById }), 3).map((u) => u.name)).toEqual(['Mona', 'Omar', 'Mona'])
  })

  it('falls back to the leader, and shows the leader / user / nothing for the other types', () => {
    const empty = form({ team_id: '3' })
    expect(nextLeadsPreview(empty, targetPreview(empty, { teamById }), 2).map((u) => u.name)).toEqual(['Ali', 'Ali'])
    const leader = form({ team_id: '2', assign_type: 'team_leader' })
    expect(nextLeadsPreview(leader, targetPreview(leader, { teamById }), 1)[0].name).toBe('Ali')
    const shared = form({ team_id: '2', assign_type: 'team' })
    expect(nextLeadsPreview(shared, targetPreview(shared, { teamById }))).toEqual([])
    const user = form({ assign_type: 'user', user_id: '3' })
    expect(targetPreview(user, { userById })).toMatchObject({ kind: 'user', user: omar })
    expect(nextLeadsPreview(user, targetPreview(user, { userById }), 2)).toEqual([omar, omar])
  })
})

describe('priority placement', () => {
  const rules = [
    normalizeRule({ id: 1, name: 'All', priority: 20, active: 1 }),
    normalizeRule({ id: 2, name: 'Facebook', source: 'facebook', priority: 10, active: 1 }),
    normalizeRule({ id: 3, name: 'Off', source: 'facebook', priority: 50, active: 0 }),
    normalizeRule({ id: 4, name: 'Low', priority: 1, active: 1 }),
  ]

  it('knows broader rules', () => {
    expect(isBroaderOrEqual(rules[0], rules[1])).toBe(true)
    expect(isBroaderOrEqual(rules[1], rules[0])).toBe(false)
  })

  it('places the draft among active rules and flags shadowing / duplicates / ties', () => {
    const draft = form({ name: 'FB Ramadan', source: 'facebook', campaign_id: '1', priority: '10' })
    const placement = placeRule(rules, draft)
    expect(placement.ordered.map((r) => r.id)).toEqual(['1', '2', '__draft__', '4'])
    expect(placement.position).toBe(2)
    expect(placement.shadowedBy.map((r) => r.id)).toEqual(['1', '2'])
    expect(placement.sameAs).toEqual([])
    expect(placement.tiesWith.map((r) => r.id)).toEqual(['2'])
  })

  it('ignores the rule being edited and suggests a priority above broader rules', () => {
    const editing = form({ name: 'Facebook', source: 'facebook', priority: '30' })
    const placement = placeRule(rules, editing, '2')
    expect(placement.position).toBe(0)
    expect(placement.shadowedBy).toEqual([])
    expect(suggestPriority(rules, form({ source: 'facebook', campaign_id: '1' }))).toBe(21)
    expect(suggestPriority(rules, form({ source: 'facebook', campaign_id: '1', priority: '25' }))).toBeNull()
    expect(suggestPriority([], form())).toBeNull()
  })
})
