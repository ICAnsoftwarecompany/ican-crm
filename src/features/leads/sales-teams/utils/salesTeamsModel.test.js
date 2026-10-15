import { describe, expect, it } from 'vitest'
import {
  buildCreateTeamPayload,
  buildTeamRows,
  buildUpdateTeamPayload,
  countUnassignedUsers,
  diffMembers,
  filterTeamRows,
  isActiveFlag,
  teamMemberIds,
  toTeamForm,
  validateTeamForm,
} from './teamModel'
import {
  applyRuleField,
  buildRulePayload,
  buildToggleRulePayload,
  countRulesByTeam,
  filterRules,
  normalizeRule,
  ruleConditions,
  ruleWarnings,
  sortRules,
  toRuleForm,
  validateRuleForm,
} from './ruleModel'

describe('teamModel', () => {
  const team = { id: 2, name: 'Cairo', type: 'sales', team_leader_id: 5, active: '1', members: [{ id: 5 }, { id: 7, name: 'Mona' }, 8] }

  it('reads members from any field and drops the leader in the form', () => {
    expect(teamMemberIds(team)).toEqual(['5', '7', '8'])
    expect(teamMemberIds({ users: [{ user_id: 3 }] })).toEqual(['3'])
    expect(toTeamForm(team)).toEqual({ name: 'Cairo', type: 'sales', team_leader_id: '5', active: true, members: ['7', '8'] })
  })

  it('treats missing / "0" / false active flags correctly', () => {
    expect(isActiveFlag(undefined)).toBe(true)
    expect(isActiveFlag('0')).toBe(false)
    expect(isActiveFlag(false)).toBe(false)
    expect(isActiveFlag(1)).toBe(true)
  })

  it('builds the create JSON and the update FormData body', () => {
    const form = { name: ' Team A ', type: 'sales', team_leader_id: '5', active: true, members: ['5', '7', '7', '9'] }
    expect(buildCreateTeamPayload(form)).toEqual({ name: 'Team A', team_leader_id: 5, active: 1, type: 'sales', members: [7, 9] })
    expect(buildUpdateTeamPayload({ ...form, team_leader_id: '', active: false })).toEqual({ name: 'Team A', team_leader_id: null, active: 0 })
  })

  it('diffs members to attach / detach without touching the leader', () => {
    expect(diffMembers(['7', '8'], { team_leader_id: '9', members: ['8', '9', '10'] })).toEqual({ attach: [10], detach: [7] })
  })

  it('validates name and type', () => {
    expect(validateTeamForm({ name: '', type: 'x' })).toEqual({ name: 'nameRequired', type: 'typeRequired' })
    expect(validateTeamForm({ name: 'A', type: 'support' })).toEqual({})
  })

  it('resolves rows, counts unassigned users and filters', () => {
    const users = [{ id: 5, name: 'Ali' }, { id: 7, name: 'Mona' }, { id: 8, name: 'Omar' }, { id: 11, name: 'Free' }]
    const rows = buildTeamRows([team, { id: 3, name: 'Support', type: 'support', active: 0 }], new Map(users.map((u) => [String(u.id), u])))
    expect(rows[0]).toMatchObject({ id: '2', leaderId: '5', memberIds: ['7', '8'], active: true })
    expect(rows[0].leader.name).toBe('Ali')
    expect(rows[0].members.map((m) => m.name)).toEqual(['Mona', 'Omar'])
    expect(countUnassignedUsers(users, rows)).toBe(1)
    expect(filterTeamRows(rows, { type: 'support' }).map((r) => r.id)).toEqual(['3'])
    expect(filterTeamRows(rows, { status: 'active', search: 'omar' }).map((r) => r.id)).toEqual(['2'])
  })
})

describe('ruleModel', () => {
  const apiRule = { id: 4, name: 'Facebook Ramadan Leads', campaign_id: 1, ad_id: null, form_id: null, source: 'facebook', assign_type: 'round_robin', team_id: 2, user_id: null, priority: 10, active: 1 }

  it('round-trips the backend example body', () => {
    const rule = normalizeRule(apiRule)
    expect(buildRulePayload(toRuleForm(rule))).toEqual({
      name: 'Facebook Ramadan Leads', campaign_id: 1, ad_id: null, form_id: null, source: 'facebook',
      assign_type: 'round_robin', team_id: 2, user_id: null, priority: 10, active: true,
    })
  })

  it('reads nested relations', () => {
    const rule = normalizeRule({ id: 1, team: { id: 3, name: 'A' }, campaign: { id: 9, name: 'C' }, assign_type: 'weird' })
    expect(rule).toMatchObject({ team_id: '3', campaign_id: '9', assign_type: 'round_robin', active: true })
    expect(rule.names).toMatchObject({ team: 'A', campaign: 'C' })
  })

  it('sends only the target the assign type needs', () => {
    const form = { ...toRuleForm(null), name: 'VIP', assign_type: 'user', user_id: '6', team_id: '2' }
    expect(buildRulePayload(form)).toMatchObject({ assign_type: 'user', user_id: 6, team_id: null, campaign_id: null, source: null })
  })

  it('resets dependent fields', () => {
    const form = { ...toRuleForm(null), team_id: '2', campaign_id: '1', ad_id: '5' }
    expect(applyRuleField(form, 'assign_type', 'user').team_id).toBe('')
    expect(applyRuleField(form, 'campaign_id', '3').ad_id).toBe('')
    expect(applyRuleField(form, 'name', 'x').ad_id).toBe('5')
  })

  it('validates the target and priority', () => {
    expect(validateRuleForm({ ...toRuleForm(null), name: 'A' })).toEqual({ team_id: 'teamRequired' })
    expect(validateRuleForm({ ...toRuleForm(null), name: 'A', assign_type: 'user', priority: '-1' })).toEqual({ user_id: 'userRequired', priority: 'priorityInvalid' })
    expect(validateRuleForm({ ...toRuleForm(null), name: 'A', team_id: '2', priority: '1.5' })).toEqual({ priority: 'priorityInvalid' })
  })

  it('toggles active with the full payload', () => {
    expect(buildToggleRulePayload(normalizeRule(apiRule), false)).toMatchObject({ active: false, team_id: 2, campaign_id: 1, priority: 10 })
  })

  it('sorts, lists conditions, counts per team and filters', () => {
    const rules = [normalizeRule({ id: 1, priority: 1, team_id: 2 }), normalizeRule(apiRule), normalizeRule({ id: 5, priority: 10, assign_type: 'user', user_id: 3, active: 0 })]
    expect(sortRules(rules).map((r) => r.id)).toEqual(['5', '4', '1'])
    expect(ruleConditions(rules[1])).toEqual([{ key: 'source', value: 'facebook' }, { key: 'campaign_id', value: '1' }])
    expect(countRulesByTeam(rules).get('2')).toEqual({ total: 2, active: 2 })
    expect(filterRules(rules, { status: 'inactive' }).map((r) => r.id)).toEqual(['5'])
    expect(filterRules(rules, { assignType: 'round_robin', search: 'ramadan' }).map((r) => r.id)).toEqual(['4'])
  })

  it('flags rules whose target cannot receive leads', () => {
    const teamById = new Map([
      ['2', { active: false, leaderId: '', memberIds: [] }],
      ['3', { active: true, leaderId: '', memberIds: ['7'] }],
      ['4', { active: true, leaderId: '', memberIds: [] }],
    ])
    expect(ruleWarnings(normalizeRule({ team_id: 2 }), { teamById })).toEqual(['inactiveTeam'])
    expect(ruleWarnings(normalizeRule({ team_id: 3, assign_type: 'team_leader' }), { teamById })).toEqual(['noLeader'])
    expect(ruleWarnings(normalizeRule({ team_id: 4 }), { teamById })).toEqual(['emptyTeam'])
    expect(ruleWarnings(normalizeRule({ assign_type: 'user' }), { teamById })).toEqual(['missingUser'])
    expect(ruleWarnings(normalizeRule({}), { teamById })).toEqual(['missingTeam'])
  })
})
