import { useDealGroups } from '../../hooks/useDealChat'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { useDealGroupDialog } from './useDealGroupDialog'

/** The open deal's groups + the "new group" dialog (`newGroup.open()`, render `newGroup.dialog`). Inside a deal workspace only. */
export function useDealChatGroups() {
  const { dealId, deal } = useDealWorkspace()
  const dealName = String(deal?.name || '').trim()
  const groups = useDealGroups(dealName)
  const newGroup = useDealGroupDialog({ dealId, groups })
  return { dealId, dealName, groups, newGroup }
}
