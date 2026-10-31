import { describe, expect, it } from 'vitest'
import { collectTeamUserIds, dealGroupNumber, filterDealGroups, makeDealGroupFilter, nextDealGroupName, otherGroups, teamRowsUserIds } from './dealGroups'
import { buildDealContactIndex, makeDealConversationFilter, matchesDealContact, phoneKey } from './dealConversations'

const chats = [
  { id: 1, type: 'group', name: 'Villas (Q4) G2' },
  { id: 2, type: 'group', name: 'Villas (Q4) G1' },
  { id: 3, type: 'group', name: 'Villas (Q4) G1 old' },
  { id: 4, type: 'direct', name: 'Villas (Q4) G9' },
  { id: 5, type: 'group', name: 'فريق المبيعات' },
  { id: 6, type: 'group', name: 'villas (q4)  g3' },
]

describe('deal groups', () => {
  it('recognizes "<deal name> G<n>" exactly (regex characters in the name are literal)', () => {
    expect(dealGroupNumber('Villas (Q4) G12', 'Villas (Q4)')).toBe(12)
    expect(dealGroupNumber('Villas (Q4) G1 old', 'Villas (Q4)')).toBeNull()
    expect(dealGroupNumber('VillasX (Q4) G1', 'Villas (Q4)')).toBeNull()
    expect(dealGroupNumber('X G1', '')).toBeNull()
  })

  it('lists the deal groups in order, skips direct chats and other names, and picks the next number', () => {
    expect(filterDealGroups(chats, 'Villas (Q4)').map((chat) => chat.id)).toEqual([2, 1, 6])
    expect(chats.filter(makeDealGroupFilter('Villas (Q4)')).map((chat) => chat.id)).toEqual([1, 2, 6])
    expect(nextDealGroupName('Villas (Q4)', chats)).toBe('Villas (Q4) G4')
    expect(nextDealGroupName(' New  deal ', chats)).toBe('New deal G1')
    expect(otherGroups(chats, 'Villas (Q4)').map((chat) => chat.id)).toEqual([3, 5])
  })

  it('collects the users of the sales team (picked users, owner, members of picked teams)', () => {
    const members = [{ kind: 'user', refId: '4', role: 'sales_rep' }, { kind: 'team', refId: '3', role: 'manager' }, { kind: 'user', refId: '2', role: 'viewer' }]
    const teams = [{ id: 3, users: [{ id: 6 }, { id: 4 }] }, { id: 9, users: [{ id: 99 }] }]
    expect(collectTeamUserIds({ members, ownerId: '1', addOwner: true, teams })).toEqual([1, 4, 2, 6])
    expect(collectTeamUserIds({ members: [], ownerId: '1', addOwner: false })).toEqual([])
    expect(teamRowsUserIds([{ user_id: 2 }, { team: { users: [{ id: 4 }, { id: 2 }] } }])).toEqual([2, 4])
    expect(teamRowsUserIds([{ kind: 'user', refId: 2 }, { kind: 'team', refId: 3, members: [{ id: 4 }, { id: 2 }] }])).toEqual([2, 4])
  })
})

describe('deal conversations', () => {
  const index = buildDealContactIndex([
    { leadId: 15, customerId: 70, phone: '0100 123 4567', email: 'Mona@X.io' },
    { leadId: 16, phone: '' },
  ])

  it('matches by linked lead / customer, phone (last 9 digits) or email', () => {
    expect(phoneKey('+20 100 123 4567')).toBe(phoneKey('01001234567'))
    expect(matchesDealContact({ linkedLeadId: '16' }, index)).toBe(true)
    expect(matchesDealContact({ linkedCustomerId: '70' }, index)).toBe(true)
    expect(matchesDealContact({ contact: { phone: '+201001234567' } }, index)).toBe(true)
    expect(matchesDealContact({ contact: { email: 'mona@x.io' } }, index)).toBe(true)
    expect(matchesDealContact({ linkedLeadId: '99', contact: { phone: '01200000000' } }, index)).toBe(false)
  })

  it('wraps a channel normalizer and never throws', () => {
    const filter = makeDealConversationFilter(index, (raw) => ({ linkedLeadId: raw.lead_id }))
    expect([{ lead_id: 15 }, { lead_id: 1 }].filter(filter)).toEqual([{ lead_id: 15 }])
    expect(makeDealConversationFilter(index, () => { throw new Error('x') })({})).toBe(false)
  })
})
