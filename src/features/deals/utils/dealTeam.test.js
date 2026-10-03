import { describe, expect, it } from 'vitest'
import { buildTeamLanes, buildTeamMemberPayload, buildWorkload, collectDealPeople, normalizeTeamMember } from './dealTeam'

const members = [
  { id: 1, user_id: 5, role: 'manager', user: { id: 5, name: 'Sara' } },
  { id: 2, team_id: 3, role: 'sales_rep', team: { id: 3, name: 'Team A', users: [{ id: 7, name: 'Karim' }, { id: 5, name: 'Sara' }] } },
].map(normalizeTeamMember)

describe('deal team', () => {
  it('normalizes users and teams', () => {
    expect(members[0]).toMatchObject({ kind: 'user', refId: 5, name: 'Sara', role: 'manager' })
    expect(members[1]).toMatchObject({ kind: 'team', refId: 3, name: 'Team A', members: [{ id: 7, name: 'Karim' }, { id: 5, name: 'Sara' }] })
  })

  it('sends a user OR a team, never both', () => {
    expect(buildTeamMemberPayload({ dealId: '1', kind: 'team', refId: '3', role: 'viewer' })).toEqual({ deal_id: 1, team_id: 3, role: 'viewer' })
    expect(buildTeamMemberPayload({ dealId: 1, kind: 'user', refId: 5, role: 'manager' })).toEqual({ deal_id: 1, user_id: 5, role: 'manager' })
    expect(buildTeamMemberPayload({ dealId: 1, kind: 'user', refId: '', role: 'manager' })).toBeNull()
  })

  it('collects people once with their teams, and builds workload + team lanes', () => {
    const people = collectDealPeople(members)
    expect(people).toEqual([{ id: '5', name: 'Sara', teamIds: ['3'] }, { id: '7', name: 'Karim', teamIds: ['3'] }])
    const leads = [
      { id: 1, status: 'open', ownerId: 7 },
      { id: 2, status: 'open', ownerId: 7 },
      { id: 3, status: 'open', ownerId: null },
      { id: 4, status: 'won', ownerId: 5 },
      { id: 5, status: 'open', ownerId: 99, ownerName: 'Ghost' },
    ]
    const workload = buildWorkload(leads, people)
    expect(workload.unassigned).toBe(1)
    expect(workload.rows[0]).toEqual({ id: '7', name: 'Karim', open: 2 })
    expect(workload.rows.find((row) => row.id === '99')).toEqual({ id: '99', name: 'Ghost', open: 1 })
    const lanes = buildTeamLanes(leads, members, people)
    expect(lanes.lanes.map((lane) => lane.id)).toEqual(['3', '__none__'])
    expect(lanes.items.find((lead) => lead.id === 1).laneId).toBe('3')
    expect(lanes.items.find((lead) => lead.id === 3).laneId).toBe('__none__')
  })
})
