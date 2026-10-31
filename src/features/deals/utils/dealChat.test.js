import { beforeEach, expect, it, vi } from 'vitest'
const { list, create, getTeams } = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), getTeams: vi.fn() }))
vi.mock('../../internal-chat', () => ({ internalChatApi: { createConversation: create }, getAllChatConversations: list }))
vi.mock('../../teams', () => ({ teamsApi: { getTeams } }))
import { canOfferDealChat, createDealChat, dealGroupNumber, nextDealGroupName, resolveWizardChatUsers } from './dealChat'
beforeEach(() => vi.clearAllMocks())

it('matches only exact deal group names and increments the highest suffix', () => {
  const groups = [{ type: 'group', name: 'Tower - G1' }, { type: 'group', name: 'Tower - g3' }, { type: 'group', name: 'Tower annex - G8' }, { type: 'direct', name: 'Tower - G9' }]
  expect(nextDealGroupName('Tower', groups)).toBe('Tower - G4')
  expect(dealGroupNumber({ type: 'group', name: 'Tower - G1 extra' }, 'Tower')).toBeNull()
  expect(nextDealGroupName('Tower', [])).toBe('Tower - G1')
})
it('offers groups for teams or multiple users, not a single user', () => {
  expect(canOfferDealChat({ members: [{ kind: 'user', refId: 1 }], addOwner: true }, 1)).toBe(false)
  expect(canOfferDealChat({ members: [{ kind: 'user', refId: 1 }], addOwner: true }, 2)).toBe(true)
  expect(canOfferDealChat({ members: [{ kind: 'team', refId: 4 }] })).toBe(true)
})
it('resolves selected teams into deduplicated user IDs, never membership row IDs', async () => {
  getTeams.mockResolvedValue({ data: [{ id: 4, team_leader_id: 2, members: [{ id: 90, user_id: 3 }, { id: 91, user: { id: 2 } }] }] })
  expect(await resolveWizardChatUsers({ basics: { owner_id: 2 }, team: { addOwner: true, members: [{ kind: 'team', refId: 4 }, { kind: 'user', refId: 3 }] } })).toEqual([2, 3])
})
it('blocks incomplete team data instead of creating a partial group', async () => {
  getTeams.mockResolvedValue({ data: [] })
  await expect(resolveWizardChatUsers({ basics: {}, team: { members: [{ kind: 'team', refId: 9 }] } })).rejects.toThrow('chatTeamMembersUnavailable')
})
it('merges populated aliases and accepts explicit empty and leader-only teams', async () => {
  getTeams.mockResolvedValue({ data: [
    { id: 1, members: [], users: [{ id: 2 }] },
    { id: 2, members: [], team_leader: { id: 3 } },
    { id: 3, members: [] },
  ] })
  const state = { basics: {}, team: { members: [1, 2, 3].map((refId) => ({ kind: 'team', refId })) } }
  expect(await resolveWizardChatUsers(state)).toEqual([2, 3])
})
it('loads later team pages before resolving membership', async () => {
  getTeams.mockResolvedValueOnce({ data: { data: [{ id: 1 }], last_page: 2 } })
    .mockResolvedValueOnce({ data: { data: [{ id: 2, users: [{ id: 3 }] }], last_page: 2 } })
  expect(await resolveWizardChatUsers({ basics: {}, team: { members: [{ kind: 'team', refId: 2 }] } })).toEqual([3])
})
it('posts the documented group payload and uses supplied retry name', async () => {
  list.mockResolvedValue([{ type: 'group', name: 'Tower - G1' }])
  await createDealChat('Tower', [2, 3])
  expect(create).toHaveBeenCalledWith({ type: 'group', name: 'Tower - G2', user_ids: [2, 3] })
  list.mockClear()
  await createDealChat('Tower', [2, 3], 'Tower - G2')
  expect(list).not.toHaveBeenCalled()
})
