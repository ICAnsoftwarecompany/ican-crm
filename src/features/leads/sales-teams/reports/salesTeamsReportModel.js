/**
 * Pure model of the sales teams report (2026-10-16): team sizes, coverage and how the distribution rules are set up.
 * Input = the display models from `useSalesTeamsData` (team rows, normalized rules, users). No React, no i18n.
 * Category rows use raw keys; '__none__' = not set (a rule with no source = any source).
 */
import { countBy } from '../../../../shared/components/reports'
import { countUnassignedUsers } from '../utils/teamModel'
import { ruleConditions, ruleWarnings } from '../utils/ruleModel'

export function buildSalesTeamsReport({ teams = [], rules = [], users = [], teamById = new Map(), userById = new Map() } = {}) {
  const activeTeams = teams.filter((team) => team.active)
  const activeRules = rules.filter((rule) => rule.active)
  const people = activeTeams.reduce((sum, team) => sum + team.members.length + (team.leaderId ? 1 : 0), 0)
  const coveredTeams = new Set(activeRules.map((rule) => rule.team_id).filter(Boolean))

  return {
    teams: teams.length,
    activeTeams: activeTeams.length,
    averageTeamSize: activeTeams.length ? Math.round((people / activeTeams.length) * 10) / 10 : 0,
    unassignedUsers: countUnassignedUsers(users, teams),
    rules: rules.length,
    activeRules: activeRules.length,
    catchAllRules: activeRules.filter((rule) => ruleConditions(rule).length === 0).length,
    rulesWithWarnings: activeRules.filter((rule) => ruleWarnings(rule, { teamById, userById }).length > 0).length,
    teamsWithoutRules: activeTeams.filter((team) => !coveredTeams.has(team.id)).length,
    teamSizes: teams
      .map((team) => ({ key: team.id, label: team.name, members: team.members.length, leader: team.leaderId ? 1 : 0 }))
      .sort((a, b) => b.members + b.leader - (a.members + a.leader)),
    rulesByAssignType: countBy(activeRules, (rule) => rule.assign_type),
    rulesBySource: countBy(activeRules, (rule) => rule.source),
    rulesByTeam: countBy(activeRules.filter((rule) => rule.team_id), (rule) => rule.team_id),
    teamsByType: countBy(teams, (team) => team.type),
  }
}
