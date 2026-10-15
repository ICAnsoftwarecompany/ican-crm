import { describe, expect, it } from 'vitest'
import {
  buildUserFieldPayload, checkPriority, duplicatePriorities, filterSalesUsers, nextFreePriority, normalizeSalesUser,
  priorityUpdateSteps, renumberPlan, sortByPriority, swapPlan, valueSuggestions,
} from './salesUsersModel'

const raw = [
  { id: 1, name: 'admin', email: 'a@x.io', username: 'admin', phone: null, manager_id: null, role: null, type: null, active: 1, priority: 0, manager: null },
  { id: 2, name: 'Mona', email: 'm@x.io', username: 'mona', type: 'sales', role: 'agent', active: 1, priority: 2, manager_id: 1, manager: { id: 1, name: 'admin' } },
  { id: 3, name: 'Omar', email: 'o@x.io', username: 'omar', type: 'Sales', active: 0, priority: 1 },
  { id: 4, name: 'Sara', email: 's@x.io', username: 'sara', type: 'sales', active: 1, priority: 2, phone: '+20100' },
]
const users = raw.map(normalizeSalesUser)

describe('salesUsersModel', () => {
  it('normalizes the users/get row', () => {
    expect(users[0]).toMatchObject({ id: '1', role: '', type: '', active: true, priority: 0, managerId: '' })
    expect(users[1]).toMatchObject({ managerId: '1', managerName: 'admin', priority: 2 })
    expect(users[2].active).toBe(false)
  })

  it('sorts by rank with unranked last, and finds duplicates', () => {
    expect(sortByPriority(users).map((u) => u.id)).toEqual(['3', '2', '4', '1'])
    expect([...duplicatePriorities(users).keys()]).toEqual([2])
    expect(nextFreePriority(users)).toBe(3)
  })

  it('checks a new priority', () => {
    expect(checkPriority('1', users, '2')).toEqual({ conflict: users[2] })
    expect(checkPriority('5', users, '2')).toBeNull()
    expect(checkPriority('1.5', users, '2')).toBe('invalid')
    expect(checkPriority('', users, '2')).toBeNull()
  })

  it('builds one-field update bodies with the identity fields', () => {
    expect(buildUserFieldPayload(users[3], 'priority', '7')).toEqual({ name: 'Sara', email: 's@x.io', username: 'sara', phone: '+20100', priority: 7 })
    expect(buildUserFieldPayload(users[1], 'manager_id', '')).toMatchObject({ manager_id: null })
    expect(buildUserFieldPayload(users[1], 'manager_id', '3')).toMatchObject({ manager_id: 3 })
    expect(buildUserFieldPayload(users[1], 'active', false)).toMatchObject({ active: 0 })
    expect(buildUserFieldPayload(users[1], 'role', '  ')).toMatchObject({ role: null })
    expect(() => buildUserFieldPayload(users[1], 'password', 'x')).toThrow()
  })

  it('plans swaps and renumbering', () => {
    expect(swapPlan(users[1], users[2]).map(({ user, priority }) => [user.id, priority])).toEqual([['2', 1], ['3', 2]])
    expect(renumberPlan(sortByPriority(users)).map(({ user, priority }) => [user.id, priority])).toEqual([['4', 3], ['1', 4]])
  })

  it('clears the holder of a target rank before reassigning', () => {
    const steps = priorityUpdateSteps(swapPlan(users[1], users[2]))
    expect(steps.map(({ user, priority }) => [user.id, priority])).toEqual([['2', 0], ['3', 0], ['2', 1], ['3', 2]])
    expect(priorityUpdateSteps([{ user: users[0], priority: 9 }]).map(({ priority }) => priority)).toEqual([9])
  })

  it('filters sales users and suggests values', () => {
    expect(filterSalesUsers(users).map((u) => u.id)).toEqual(['2', '3', '4'])
    expect(filterSalesUsers(users, { scope: 'all', status: 'inactive' }).map((u) => u.id)).toEqual(['3'])
    expect(filterSalesUsers(users, { scope: 'all', search: 'agent' }).map((u) => u.id)).toEqual(['2'])
    expect(valueSuggestions(users, 'type', ['sales'])).toEqual(['sales', 'Sales'])
  })
})
