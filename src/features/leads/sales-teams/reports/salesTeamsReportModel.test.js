import { describe, expect, it } from 'vitest'
import { buildTeamRows } from '../utils/teamModel'
import { normalizeRule } from '../utils/ruleModel'
import { buildSalesTeamsReport } from './salesTeamsReportModel'

describe('buildSalesTeamsReport', () => {
  const users = [1, 2, 3, 4, 5].map((id) => ({ id, name: `U${id}` }))
  const userById = new Map(users.map((user) => [String(user.id), user]))
  const teams = buildTeamRows([
    { id: 1, name: 'A', type: 'sales', team_leader_id: 1, members: [{ id: 2 }, { id: 3 }] },
    { id: 2, name: 'B', type: 'support', members: [{ id: 4 }] },
    { id: 3, name: 'C', type: 'sales', active: 0 },
  ], userById)
  const teamById = new Map(teams.map((team) => [team.id, team]))
  const rules = [
    normalizeRule({ id: 1, source: 'facebook', team_id: 1, assign_type: 'round_robin' }),
    normalizeRule({ id: 2, team_id: 3, assign_type: 'team' }),
    normalizeRule({ id: 3, assign_type: 'user', user_id: 5, active: 0 }),
  ]

  it('counts teams, coverage and rules', () => {
    const report = buildSalesTeamsReport({ teams, rules, users, teamById, userById })
    expect(report).toMatchObject({
      teams: 3, activeTeams: 2, averageTeamSize: 2, unassignedUsers: 1,
      rules: 3, activeRules: 2, catchAllRules: 1, rulesWithWarnings: 1, teamsWithoutRules: 1,
    })
    expect(report.teamSizes.map((row) => row.key)).toEqual(['1', '2', '3'])
    expect(report.rulesByAssignType).toEqual([{ key: 'round_robin', value: 1 }, { key: 'team', value: 1 }])
    expect(report.rulesBySource).toEqual([{ key: 'facebook', value: 1 }, { key: '__none__', value: 1 }])
    expect(report.teamsByType).toEqual([{ key: 'sales', value: 2 }, { key: 'support', value: 1 }])
  })

  it('handles no data', () => {
    expect(buildSalesTeamsReport()).toMatchObject({ teams: 0, averageTeamSize: 0, rules: 0, teamSizes: [] })
  })
})
