/**
 * Internal chat groups of a deal (2026-10-16). Pure, tested.
 *
 * A deal's groups are the internal chat groups (`/api/tenant/chat`, `type: group`) named exactly
 * "<deal name> G<number>" — "Villas G1", "Villas G2"… The first one can be created by the creation wizard, later ones
 * from the deal's groups page; each new one takes the next number. The link is the NAME: renaming the deal (or the
 * group) unlinks it. Groups picked as "existing" in the wizard only get the users added, they are not linked.
 */
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const isGroup = (conversation) => !conversation?.type || String(conversation.type).toLowerCase() === 'group'
const nameOf = (conversation) => clean(conversation?.name || conversation?.display_name || conversation?.title)

/** Number of a deal group ("Villas G3" → 3), or null when the name does not belong to this deal. */
export function dealGroupNumber(groupName, dealName) {
  const base = clean(dealName)
  if (!base) return null
  const match = clean(groupName).match(new RegExp(`^${escapeRegExp(base)} G(\\d+)$`, 'i'))
  return match ? Number(match[1]) : null
}

/** The deal's groups among chat conversations, ordered G1, G2… */
export function filterDealGroups(conversations = [], dealName = '') {
  return conversations
    .filter((conversation) => isGroup(conversation) && dealGroupNumber(nameOf(conversation), dealName) !== null)
    .sort((left, right) => dealGroupNumber(nameOf(left), dealName) - dealGroupNumber(nameOf(right), dealName))
}

/** Predicate version (for chat lists that take a filter). */
export function makeDealGroupFilter(dealName = '') {
  return (conversation) => isGroup(conversation) && dealGroupNumber(nameOf(conversation), dealName) !== null
}

/** "<deal name> G<next>" — one more than the highest existing number (G1 when there is none). */
export function nextDealGroupName(dealName = '', conversations = []) {
  const highest = conversations.reduce((max, conversation) => {
    const number = isGroup(conversation) ? dealGroupNumber(nameOf(conversation), dealName) : null
    return number !== null && number > max ? number : max
  }, 0)
  return `${clean(dealName)} G${highest + 1}`
}

/** Other groups (not this deal's) for "add to an existing group". */
export function otherGroups(conversations = [], dealName = '') {
  return conversations.filter((conversation) => isGroup(conversation) && conversation?.type && dealGroupNumber(nameOf(conversation), dealName) === null)
}

const toUserId = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && String(value).trim() !== '' ? number : null
}

/**
 * Users of a group made from the deal's sales team: users picked one by one, the deal owner (when added to the team)
 * and the members of the picked ready teams (`teams`: `[{ id, users | members: [{ id }] }]`). Unique numeric ids.
 */
export function collectTeamUserIds({ members = [], ownerId = '', addOwner = false, teams = [] } = {}) {
  const ids = []
  const push = (value) => {
    const id = toUserId(value)
    if (id !== null && !ids.includes(id)) ids.push(id)
  }
  if (addOwner && ownerId) push(ownerId)
  members.filter((member) => member.kind !== 'team').forEach((member) => push(member.refId))
  const teamIds = members.filter((member) => member.kind === 'team').map((member) => String(member.refId))
  teams.filter((team) => teamIds.includes(String(team.id))).forEach((team) => {
    const list = [team.users, team.members].find(Array.isArray) || []
    list.forEach((user) => push(user?.id ?? user?.user_id))
  })
  return ids
}

/**
 * Users of a deal from its saved team rows (`GET /deals/{id}/team`): normalized rows (utils/dealTeam:
 * `{ kind, refId, members }`) or raw ones (`user_id` / `user`, `team.users`).
 */
export function teamRowsUserIds(rows = []) {
  const ids = []
  rows.forEach((row) => {
    const normalized = row.kind === 'user' ? [row.refId] : row.kind === 'team' ? (row.members || []).map((member) => member?.id) : []
    const candidates = [...normalized, row.user_id, row.user?.id, ...((row.team?.users || row.team?.members || []).map((user) => user?.id))]
    candidates.forEach((value) => {
      const id = toUserId(value)
      if (id !== null && !ids.includes(id)) ids.push(id)
    })
  })
  return ids
}
