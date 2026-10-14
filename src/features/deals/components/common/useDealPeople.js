import { useMemo } from 'react'
import { useTeams } from '../../../teams'
import { useUsers } from '../../../users'
import { useDealTeam } from '../../hooks/useDealResources'
import { collectDealPeople } from '../../utils/dealTeam'

/**
 * People who can own leads of this deal (direct members + members of teams on the deal). When the deal has
 * no team yet, every tenant user is offered so work is never blocked.
 */
export function useDealPeople(dealId) {
  const team = useDealTeam(dealId)
  const usersQuery = useUsers()
  const teamsQuery = useTeams()
  const users = useMemo(() => usersQuery.data || [], [usersQuery.data])
  const teams = useMemo(() => teamsQuery.data || [], [teamsQuery.data])

  return useMemo(() => {
    const fromDeal = collectDealPeople(team.members, users, teams)
    const allUsers = users.map((user) => ({ id: String(user.id), name: user.name || user.email || '', teamIds: [] }))
    return {
      members: team.members,
      people: fromDeal.length ? fromDeal : allUsers,
      allUsers,
      teams,
      isDealTeamEmpty: !fromDeal.length,
      teamQuery: team,
    }
  }, [team, teams, users])
}
