// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const F = '/api/tenant/follow-ups'
const P = '/api/tenant/portfolios'
const PROGRAMS = '/api/tenant/follow-up-programs'

describe('follow-ups and portfolios mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('devices')
    resetMockDb()
  })

  it('lists work by due bucket with a summary', async () => {
    const { data, summary } = (await request('get', F, null, { view: 'overdue' })).data
    expect(summary).toMatchObject({ overdue: 2, due_today: 2 })
    expect(data.every((entry) => entry.bucket === 'overdue')).toBe(true)
    expect(data[0]).toMatchObject({ program: { id: expect.any(String) }, step: { key: expect.any(String) }, steps_total: expect.any(Number) })
    const completed = (await request('get', F, null, { view: 'completed' })).data.data
    expect(completed).toHaveLength(1)
  })

  it('records outcomes: retry, advance with a case, exit', async () => {
    const today = (await request('get', F, null, { view: 'due_today' })).data.data
    const retrying = today.find((entry) => entry.attempts === 1)
    let result = (await request('post', `${F}/${retrying.id}/outcome`, { outcome: 'no_answer' })).data.data
    expect(result).toMatchObject({ effect: 'retry', attempts: 2, current_step: retrying.current_step })
    await expect(request('post', `${F}/${retrying.id}/outcome`, { outcome: 'nope' })).rejects.toMatchObject({ response: { status: 422 } })
    result = (await request('post', `${F}/${retrying.id}/outcome`, { outcome: 'issue_found', note: 'Leak' })).data.data
    expect(result.effect).toBe('advanced')
    expect(result.history.at(-1).case.case_number).toMatch(/^CS-/)
    await expect(request('post', `${F}/${result.id}/exit`, {})).rejects.toMatchObject({ response: { status: 422 } })
    const exited = (await request('post', `${F}/${result.id}/exit`, { reason: 'customer_opted_out' })).data.data
    expect(exited.status).toBe('exited')
    await expect(request('post', `${F}/${result.id}/outcome`, { outcome: 'satisfied' })).rejects.toMatchObject({ response: { status: 409 } })
  })

  it('enrolls manually once, owned by the portfolio owner', async () => {
    const members = (await request('get', `${P}/pf-alex/members`)).data.data
    const enrolledIds = (await request('get', F, null, { view: 'all', program_id: 'fp-after-sale' })).data.data.filter((entry) => entry.status === 'active').map((entry) => entry.customer_id)
    const member = members.find((entry) => !enrolledIds.includes(entry.customer_id))
    await expect(request('post', F, { program_id: 'fp-renewal', customer_id: member.customer_id })).rejects.toMatchObject({ response: { status: 422 } }) // renewal counts back from the end date
    const enrolled = await request('post', F, { program_id: 'fp-after-sale', customer_id: member.customer_id })
    expect(enrolled.data.data.owner.id).toBe(member.owner_user_id)
    await expect(request('post', F, { program_id: 'fp-after-sale', customer_id: member.customer_id })).rejects.toMatchObject({ response: { status: 409 } })
  })

  it('bumps the program version on edit and blocks deleting a program in use', async () => {
    const program = (await request('get', PROGRAMS)).data.data.find((entry) => entry.id === 'fp-after-sale')
    const updated = (await request('patch', `${PROGRAMS}/${program.id}`, { name: { ar: 'x', en: 'After sale v2' } })).data.data
    expect(updated.version).toBe(program.version + 1)
    await expect(request('patch', `${PROGRAMS}/${program.id}`, { steps: [{ key: 'a', offset: 'soon', channel: 'call', outcomes: ['ok'], task_title: { en: 'x' } }] })).rejects.toMatchObject({ response: { status: 422 } })
    await expect(request('delete', `${PROGRAMS}/${program.id}`)).rejects.toMatchObject({ response: { status: 409 } })
  })

  it('adds members to the least loaded owner, blocks duplicates and rebalances', async () => {
    const portfolio = (await request('get', P)).data.data.find((entry) => entry.id === 'pf-premium')
    expect(portfolio.members_count).toBe(5)
    const customers = (await request('get', '/api/tenant/service/cases', null, { per_page: 100 })).data.data.map((entry) => entry.customer.id)
    const members = (await request('get', `${P}/pf-premium/members`)).data.data
    const inAlex = (await request('get', `${P}/pf-alex/members`)).data.data.map((entry) => entry.customer_id)
    await expect(request('post', `${P}/pf-premium/members`, { customer_ids: [inAlex[0]] })).rejects.toMatchObject({ response: { status: 409 } })
    const free = customers.find((id) => !members.some((entry) => entry.customer_id === id) && !inAlex.includes(id))
    if (free) {
      const added = (await request('post', `${P}/pf-premium/members`, { customer_ids: [free] })).data.data
      expect(portfolio.owner_ids).toContain(added[0].owner_user_id)
    }
    await Promise.all(members.map((entry) => request('patch', `${P}/pf-premium/members/${entry.customer_id}`, { owner_user_id: 'agent-1' })))
    const balanced = (await request('post', `${P}/pf-premium/distribute`)).data.data
    expect(balanced.moved).toBeGreaterThan(0)
    const counts = balanced.owners.map((owner) => owner.members_count)
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
    await expect(request('delete', `${P}/pf-premium`)).rejects.toMatchObject({ response: { status: 409 } })
  })
})
