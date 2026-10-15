/**
 * Quick team from the deal wizard (2026-10-16): when the company has no fitting team, create one on the spot with
 * `POST /api/tenant/teams/create` and add it to the deal. Body (Postman "Teams → create"):
 * `{ name, team_leader_id?, active: true, type: 'sales', members: [user ids] }` — the leader is always a member.
 * The full team editor (type, activation, rules) stays in Leads Center → Sales teams.
 */
export const QUICK_TEAM_TYPE = 'sales'

const toId = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && String(value).trim() !== '' ? number : value
}

export function validateQuickTeam({ name = '', leaderId = '', memberIds = [] } = {}) {
  const errors = {}
  if (!String(name).trim()) errors.name = 'quickTeamNameRequired'
  if (!memberIds.length && !leaderId) errors.members = 'quickTeamMembersRequired'
  return errors
}

export function buildQuickTeamPayload({ name = '', leaderId = '', memberIds = [] } = {}) {
  const members = [...new Set([...(leaderId ? [String(leaderId)] : []), ...memberIds.map(String)])].map(toId)
  return {
    name: String(name).trim(),
    ...(leaderId ? { team_leader_id: toId(leaderId) } : {}),
    active: true,
    type: QUICK_TEAM_TYPE,
    members,
  }
}

/**
 * Wizard members after a quick team was created: the team joins with `role`; when `replaceUsers`, the users that
 * are now inside the team are no longer listed one by one (they come with the team).
 */
export function addQuickTeamToMembers(members = [], { teamId, memberIds = [], role = 'sales_rep', replaceUsers = false }) {
  const inTeam = new Set(memberIds.map(String))
  const kept = replaceUsers ? members.filter((member) => member.kind === 'team' || !inTeam.has(String(member.refId))) : members
  if (kept.some((member) => member.kind === 'team' && String(member.refId) === String(teamId))) return kept
  return [...kept, { kind: 'team', refId: String(teamId), role }]
}
