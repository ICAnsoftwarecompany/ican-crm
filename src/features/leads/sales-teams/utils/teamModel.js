/**
 * Sales teams model (2026-10-15). Pure helpers between the Teams API and the /LeadsCenter/teams UI.
 *
 * Endpoints (features/teams/api/teamsApi.js):
 * - POST teams/create            JSON     { name, team_leader_id, active, type, members: [ids] }
 * - POST teams/update/{id}       FormData { name, team_leader_id, active }   (no type, no members)
 * - POST teams/attach-members/{id} / detach-members/{id}  JSON { members: [ids] }
 * Responses vary between tenants, so every reader below accepts several field names.
 */

export const TEAM_TYPES = ['general', 'sales', 'support', 'collections', 'onboarding', 'operations']
export const DEFAULT_TEAM_TYPE = 'sales'

export function normalizeId(value) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'object') return normalizeId(value.id ?? value.user_id)
  return String(value)
}

const toNumberIds = (ids = []) => [...new Set(ids.map(normalizeId).filter(Boolean))].map(Number).filter(Number.isFinite)

export function userLabel(user) {
  return user?.name || user?.full_name || user?.username || user?.email || (user?.id ? `#${user.id}` : '')
}

export function teamLeaderId(team) {
  return normalizeId(team?.team_leader_id ?? team?.leader_id ?? team?.leader?.id ?? team?.team_leader?.id)
}

export function teamLeaderName(team) {
  return team?.team_leader_name || team?.leader_name || team?.leader?.name || team?.team_leader?.name || ''
}

function rawMembers(team) {
  for (const key of ['members', 'users', 'team_members']) {
    if (Array.isArray(team?.[key])) return team[key]
  }
  return []
}

export function teamMemberIds(team) {
  return [...new Set(rawMembers(team).map((member) => normalizeId(member?.user_id ?? member?.id ?? member)).filter(Boolean))]
}

export function teamType(team) {
  return String(team?.type || 'general').toLowerCase()
}

export function isActiveFlag(value) {
  if (value === undefined || value === null || value === '') return true
  if (typeof value === 'string') return !['0', 'false', 'inactive', 'no'].includes(value.toLowerCase())
  return Boolean(Number(value))
}

export function toTeamForm(team) {
  if (!team) return { name: '', type: DEFAULT_TEAM_TYPE, team_leader_id: '', active: true, members: [] }
  const leaderId = teamLeaderId(team)
  return {
    name: team.name || '',
    type: teamType(team),
    team_leader_id: leaderId,
    active: isActiveFlag(team.active),
    members: teamMemberIds(team).filter((id) => id !== leaderId),
  }
}

export function validateTeamForm(form) {
  const errors = {}
  if (!String(form.name || '').trim()) errors.name = 'nameRequired'
  if (!TEAM_TYPES.includes(form.type)) errors.type = 'typeRequired'
  return errors
}

/** Members never include the leader: the backend links the leader through `team_leader_id`. */
function membersWithoutLeader(form) {
  const leaderId = normalizeId(form.team_leader_id)
  return (form.members || []).filter((id) => normalizeId(id) !== leaderId)
}

export function buildCreateTeamPayload(form) {
  return {
    name: String(form.name).trim(),
    team_leader_id: form.team_leader_id ? Number(form.team_leader_id) : null,
    active: form.active ? 1 : 0,
    type: form.type,
    members: toNumberIds(membersWithoutLeader(form)),
  }
}

/**
 * FormData body of teams/update. toFormData drops null, so "no leader" leaves the field out (same as the old
 * page); clearing a leader needs backend support (docs/backend/BACKEND-REQUESTS.md E3).
 */
export function buildUpdateTeamPayload(form) {
  return {
    name: String(form.name).trim(),
    team_leader_id: form.team_leader_id ? Number(form.team_leader_id) : null,
    active: form.active ? 1 : 0,
  }
}

/** Which ids to attach / detach to go from `previous` to the form's members. */
export function diffMembers(previous = [], form) {
  const before = new Set(previous.map(normalizeId).filter(Boolean))
  const after = new Set(membersWithoutLeader(form).map(normalizeId).filter(Boolean))
  return {
    attach: toNumberIds([...after].filter((id) => !before.has(id))),
    detach: toNumberIds([...before].filter((id) => !after.has(id))),
  }
}

/** Display rows: the team plus resolved leader / members (users list fills in names the team payload lacks). */
export function buildTeamRows(teams = [], userById = new Map()) {
  return teams.map((team) => {
    const id = normalizeId(team.id ?? team.team_id)
    const leaderId = teamLeaderId(team)
    const memberIds = teamMemberIds(team).filter((memberId) => memberId !== leaderId)
    const embedded = new Map(rawMembers(team).filter((member) => member && typeof member === 'object').map((member) => [normalizeId(member.user_id ?? member.id), member]))
    const members = memberIds.map((memberId) => userById.get(memberId) || embedded.get(memberId) || { id: memberId })
    const leader = leaderId ? userById.get(leaderId) || team.leader || team.team_leader || { id: leaderId, name: teamLeaderName(team) } : null
    return { id, name: team.name || `#${id}`, type: teamType(team), active: isActiveFlag(team.active), leaderId, leader, memberIds, members, raw: team }
  })
}

/** Users that are neither a leader nor a member of any team. */
export function countUnassignedUsers(users = [], rows = []) {
  const linked = new Set(rows.flatMap((row) => [row.leaderId, ...row.memberIds]).filter(Boolean))
  return users.filter((user) => !linked.has(normalizeId(user.id))).length
}

export function filterTeamRows(rows = [], { search = '', type = 'all', status = 'all' } = {}) {
  const query = search.trim().toLowerCase()
  return rows.filter((row) => {
    if (type !== 'all' && row.type !== type) return false
    if (status === 'active' && !row.active) return false
    if (status === 'inactive' && row.active) return false
    if (!query) return true
    return [row.name, userLabel(row.leader), ...row.members.map(userLabel)].join(' ').toLowerCase().includes(query)
  })
}

/** Id of the team the create call returned, or the newest team with that name in the refreshed list. */
export function findCreatedTeamId(response, teams = [], name = '') {
  const direct = normalizeId(response?.data?.id ?? response?.data?.team?.id ?? response?.team?.id ?? response?.id)
  if (direct) return direct
  const matches = teams.filter((team) => String(team?.name || '').trim() === name.trim())
  if (!matches.length) return ''
  return normalizeId(matches.reduce((latest, team) => (Number(team.id) > Number(latest.id) ? team : latest)).id)
}
