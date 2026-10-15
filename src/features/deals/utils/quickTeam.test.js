import { describe, expect, it } from 'vitest'
import { addQuickTeamToMembers, buildQuickTeamPayload, validateQuickTeam } from './quickTeam'

describe('quick team', () => {
  it('builds the Postman "teams/create" body with the leader always a member', () => {
    expect(buildQuickTeamPayload({ name: ' Villas team ', leaderId: '2', memberIds: ['4', '6', '2'] }))
      .toEqual({ name: 'Villas team', team_leader_id: 2, active: true, type: 'sales', members: [2, 4, 6] })
    expect(buildQuickTeamPayload({ name: 'A', memberIds: ['4'] })).toEqual({ name: 'A', active: true, type: 'sales', members: [4] })
  })

  it('needs a name and at least one member', () => {
    expect(validateQuickTeam({ name: '', memberIds: [] })).toEqual({ name: 'quickTeamNameRequired', members: 'quickTeamMembersRequired' })
    expect(validateQuickTeam({ name: 'A', memberIds: ['1'] })).toEqual({})
  })

  it('adds the new team to the deal and can replace the users it now contains', () => {
    const members = [{ kind: 'user', refId: '4', role: 'sales_rep' }, { kind: 'user', refId: '9', role: 'manager' }]
    expect(addQuickTeamToMembers(members, { teamId: 12, memberIds: ['4'], replaceUsers: true }))
      .toEqual([{ kind: 'user', refId: '9', role: 'manager' }, { kind: 'team', refId: '12', role: 'sales_rep' }])
    expect(addQuickTeamToMembers(members, { teamId: 12, memberIds: ['4'] })).toHaveLength(3)
  })
})
