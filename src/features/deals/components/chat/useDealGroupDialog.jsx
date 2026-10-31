import { useMemo, useState } from 'react'
import { useUsers } from '../../../users'
import { useDealTeam } from '../../hooks/useDealResources'
import { teamRowsUserIds } from '../../utils/dealGroups'
import { NewDealGroupDialog } from './NewDealGroupDialog'

/**
 * "New deal group" wiring shared by the groups page and the floating groups panel: the dialog element and `open()`.
 * Members default to the deal's saved sales team (`GET /deals/{id}/team`, users + members of its teams).
 */
export function useDealGroupDialog({ dealId, groups }) {
  const [isOpen, setOpen] = useState(false)
  const team = useDealTeam(dealId)
  const usersQuery = useUsers()
  const teamIds = useMemo(() => teamRowsUserIds(team.members).map(String), [team.members])
  const users = useMemo(() => (usersQuery.data || [])
    .map((user) => ({ id: String(user.id), name: user.name || user.email || `#${user.id}`, inTeam: teamIds.includes(String(user.id)) }))
    .sort((left, right) => Number(right.inTeam) - Number(left.inTeam)), [teamIds, usersQuery.data])

  const dialog = (
    <NewDealGroupDialog
      open={isOpen}
      onClose={() => setOpen(false)}
      name={groups.nextName}
      defaultUserIds={teamIds}
      users={users}
      create={groups.create}
    />
  )
  return { open: () => setOpen(true), dialog }
}
