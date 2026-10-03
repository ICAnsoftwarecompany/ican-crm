const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

/** A row of `GET /deals/{id}/team`: a user OR a team, with a role. */
export function normalizeTeamMember(entry = {}) {
  const team = entry.team || null
  const user = entry.user || null
  const kind = first(entry.team_id, team?.id) ? 'team' : 'user'
  const members = Array.isArray(team?.members) ? team.members
    : Array.isArray(team?.users) ? team.users
      : Array.isArray(entry.members) ? entry.members : []
  return {
    id: entry.id,
    kind,
    refId: kind === 'team' ? first(entry.team_id, team?.id) : first(entry.user_id, user?.id),
    name: first(kind === 'team' ? team?.name : user?.name, entry.name, ''),
    email: kind === 'user' ? first(user?.email, '') : '',
    role: first(entry.role, 'sales_rep'),
    members: members.map((member) => ({ id: first(member?.id, member?.user_id, member), name: first(member?.name, '') })),
  }
}

/**
 * Body of `POST /deals/team`. A user OR a team (backend rule: never both in one assignment).
 * Returns null when the selection is incomplete.
 */
export function buildTeamMemberPayload({ dealId, kind, refId, role }) {
  if (!dealId || !refId || !role) return null
  const key = kind === 'team' ? 'team_id' : 'user_id'
  return { deal_id: Number(dealId) || dealId, [key]: Number(refId) || refId, role }
}

/**
 * Every user who can own leads in this deal: direct users + members of teams on the deal (deduplicated).
 * Each entry keeps the teams it came from, used to split the board into team lanes.
 */
export function collectDealPeople(members = [], allUsers = [], allTeams = []) {
  const users = new Map()
  const nameOf = (id) => allUsers.find((user) => String(user?.id) === String(id))?.name || ''
  const add = (id, name, teamId) => {
    if (id === undefined || id === null || id === '') return
    const key = String(id)
    const current = users.get(key) || { id: key, name: name || nameOf(id), teamIds: new Set() }
    if (!current.name) current.name = name || nameOf(id)
    if (teamId !== undefined && teamId !== null) current.teamIds.add(String(teamId))
    users.set(key, current)
  }
  members.forEach((member) => {
    if (member.kind === 'user') add(member.refId, member.name)
    if (member.kind === 'team') {
      const fromCatalog = allTeams.find((team) => String(team?.id) === String(member.refId))
      const list = member.members.length ? member.members : getTeamMembers(fromCatalog)
      list.forEach((person) => add(person.id, person.name, member.refId))
    }
  })
  return [...users.values()].map((person) => ({ ...person, teamIds: [...person.teamIds] }))
}

export function getTeamMembers(team) {
  const list = [team?.members, team?.users, team?.team_members].find(Array.isArray) || []
  return list.map((member) => ({ id: first(member?.id, member?.user_id, member), name: first(member?.name, '') }))
}

/** Open leads per owner (+ unassigned), biggest first. Used by the team workload panel. */
export function buildWorkload(leads = [], people = []) {
  const counts = new Map()
  let unassigned = 0
  leads.filter((lead) => lead.status === 'open').forEach((lead) => {
    if (!lead.ownerId) {
      unassigned += 1
      return
    }
    const key = String(lead.ownerId)
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  const rows = people.map((person) => ({ id: person.id, name: person.name, open: counts.get(person.id) || 0 }))
  counts.forEach((open, id) => {
    if (!rows.some((row) => row.id === id)) {
      const lead = leads.find((item) => String(item.ownerId) === id)
      rows.push({ id, name: lead?.ownerName || '', open })
    }
  })
  return { rows: rows.sort((left, right) => right.open - left.open), unassigned }
}

/**
 * Board lanes per team (تقسيم الفرق). Leads whose owner is in no team of the deal go to an "other" lane.
 * Each lead gets `laneId` added. Returns null when the deal has no team.
 */
export function buildTeamLanes(leads = [], members = [], people = []) {
  const teams = members.filter((member) => member.kind === 'team')
  if (!teams.length) return null
  const teamOfOwner = new Map(people.map((person) => [person.id, person.teamIds[0] || null]))
  const lanes = [...teams.map((team) => ({ id: String(team.refId), label: team.name })), { id: '__none__', label: '' }]
  const items = leads.map((lead) => ({ ...lead, laneId: teamOfOwner.get(String(lead.ownerId)) || '__none__' }))
  return { lanes, items }
}
