import { internalChatApi, getAllChatConversations } from '../../internal-chat'
import { teamsApi } from '../../teams'
import { extractList } from '../../../shared/utils/apiResponse'
import { resolveTeamMembers } from './dealWizard'

export function dealGroupNumber(conversation, dealName) {
  if (conversation?.type !== 'group') return null
  const prefix = `${String(dealName).trim()} - G`
  const name = String(conversation.name || '')
  if (!name.toLowerCase().startsWith(prefix.toLowerCase())) return null
  const suffix = name.slice(prefix.length)
  return /^[1-9]\d*$/.test(suffix) ? Number(suffix) : null
}

export function nextDealGroupName(dealName, conversations) {
  const numbers = conversations.map((item) => dealGroupNumber(item, dealName)).filter(Boolean)
  return `${String(dealName).trim()} - G${Math.max(0, ...numbers) + 1}`
}

export function canOfferDealChat(team, ownerId) {
  return team.members.some((member) => member.kind === 'team') || new Set([
    ...team.members.map((member) => String(member.refId)),
    ...(team.addOwner && ownerId ? [String(ownerId)] : []),
  ]).size > 1
}

export async function resolveWizardChatUsers(state) {
  const members = resolveTeamMembers(state)
  const selectedTeams = members.filter((member) => member.kind === 'team')
  const teams = []
  if (selectedTeams.length) {
    for (let page = 1; ; page += 1) {
      const response = await teamsApi.getTeams({ page, per_page: 100 })
      const rows = extractList(response, ['teams'])
      teams.push(...rows)
      const pagination = response?.data?.last_page != null ? response.data : response
      if (!rows.length || (!pagination.next_page_url && (pagination.last_page == null || page >= Number(pagination.last_page)))) break
    }
  }
  const ids = members.filter((member) => member.kind === 'user').map((member) => member.refId)
  for (const selected of selectedTeams) {
    const team = teams.find((item) => String(item.id) === String(selected.refId))
    const lists = [team?.members, team?.users, team?.team_members].filter(Array.isArray)
    const people = lists.flat()
    const leader = team?.team_leader_id ?? team?.leader_id ?? team?.leader?.id ?? team?.team_leader?.id
    const declaredCount = team?.members_count ?? team?.users_count
    // Explicitly empty teams are valid; missing membership data is not an empty team.
    if (!team || (!lists.length && !(declaredCount != null && Number(declaredCount) === 0)) || (!people.length && Number(declaredCount) > 0)) {
      const error = new Error('dealWorkspace.pipeline.chatTeamMembersUnavailable')
      error.teamName = team?.name || String(selected.refId)
      throw error
    }
    ids.push(...people.map((person) => typeof person === 'object' ? person.user_id ?? person.user?.id ?? person.id : person), leader)
  }
  return [...new Set(ids.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))]
}

export async function createDealChat(dealName, userIds, name) {
  if (!userIds.length) throw new Error('dealWorkspace.pipeline.chatMembersUnavailable')
  const groupName = name || nextDealGroupName(dealName, await getAllChatConversations())
  return internalChatApi.createConversation({ type: 'group', name: groupName, user_ids: userIds })
}
