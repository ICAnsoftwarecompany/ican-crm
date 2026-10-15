import { useMemo } from 'react'
import { useTeams } from '../../../teams'
import { useUsers } from '../../../users'
import { useAssignmentRules } from '../../hooks/useLeads'
import { buildTeamRows, countUnassignedUsers, normalizeId } from '../utils/teamModel'
import { countRulesByTeam, normalizeRule, sortRules } from '../utils/ruleModel'

/** Teams + users + assignment rules for /LeadsCenter/teams, resolved into display models and KPIs. */
export function useSalesTeamsData() {
  const teamsQuery = useTeams()
  const usersQuery = useUsers()
  const rulesQuery = useAssignmentRules()
  const teamsData = teamsQuery.data
  const usersData = usersQuery.data
  const rulesData = rulesQuery.data

  const model = useMemo(() => {
    const users = usersData || []
    const userById = new Map(users.map((user) => [normalizeId(user.id), user]))
    const teams = buildTeamRows(teamsData || [], userById)
    const teamById = new Map(teams.map((team) => [team.id, team]))
    const rules = sortRules((rulesData || []).map(normalizeRule))
    const rulesByTeam = countRulesByTeam(rules)

    return {
      users,
      userById,
      teams,
      teamById,
      rules,
      rulesByTeam,
      stats: {
        teams: teams.length,
        activeTeams: teams.filter((team) => team.active).length,
        rules: rules.length,
        activeRules: rules.filter((rule) => rule.active).length,
        unassignedUsers: countUnassignedUsers(users, teams),
        users: users.length,
      },
    }
  }, [teamsData, usersData, rulesData])

  return { ...model, teamsQuery, usersQuery, rulesQuery }
}
