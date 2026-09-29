// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })

const R = '/api/tenant/service/records'

describe('service records mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('works for every template: setup, list, summary', async () => {
    for (const template of ['devices', 'tourism', 'school', 'shipping']) {
      setActiveMockTemplate(template)
      const setup = (await request('get', `${R}/setup`)).data.data
      expect(setup.record_types[0].pipeline.statuses.length).toBeGreaterThan(2)
      const list = (await request('get', R, null, { type: setup.selected, view: 'all', per_page: 100 })).data
      expect(list.meta.total).toBe(16)
      const summary = (await request('get', `${R}/summary`, null, { type: setup.selected })).data.data.views
      expect(summary.active + summary.done).toBe(summary.all)
    }
  })

  it('creates a record in the initial status and transitions along the pipeline', async () => {
    setActiveMockTemplate('shipping')
    const setup = (await request('get', `${R}/setup`)).data.data
    const type = setup.record_types[0]
    const created = (await request('post', R, { record_type_id: type.id, customer_id: 'cust-1' })).data.data
    expect(created.status.key).toBe('created')
    await expect(request('post', `${R}/${created.id}/transition`, { version: created.version, to_status_id: 'rs-shipment-delivered' })).rejects.toMatchObject({
      response: { status: 409, data: { code: 'RECORD_TRANSITION_NOT_ALLOWED' } },
    })
    const moved = (await request('post', `${R}/${created.id}/transition`, { version: created.version, to_status_id: 'rs-shipment-picked_up' })).data.data
    expect(moved.status.key).toBe('picked_up')
    const timeline = (await request('get', `${R}/${created.id}/timeline`)).data.data
    expect(timeline.map((entry) => entry.event_type)).toEqual(['status_change', 'created'])
  })

  it('enforces participant role max and component types', async () => {
    setActiveMockTemplate('shipping')
    const { data } = await request('get', R, null, { view: 'all', per_page: 1 })
    const record = data.data[0]
    await expect(request('post', `${R}/${record.id}/participants`, { role: 'sender', name: 'X' })).rejects.toMatchObject({
      response: { status: 422, data: { errors: { role: ['max'] } } },
    })
    await expect(request('post', `${R}/${record.id}/components`, { component_type: 'flight', status: 'requested' })).rejects.toMatchObject({ response: { status: 422 } })
  })

  it('handles required documents (upload, verify, reject) and customer updates', async () => {
    setActiveMockTemplate('tourism')
    const { data } = await request('get', R, null, { view: 'all', per_page: 100 })
    const record = data.data.find((item) => item.counts.documents_missing > 0)
    const docs = (await request('get', `${R}/${record.id}/documents`)).data.data
    const missing = docs.find((doc) => doc.status === 'missing')
    await expect(request('post', `${R}/${record.id}/documents/${missing.id}/verify`)).rejects.toMatchObject({ response: { status: 409 } })
    await request('post', `${R}/${record.id}/documents/${missing.id}/upload`, { file_name: 'p.pdf' })
    const verified = (await request('post', `${R}/${record.id}/documents/${missing.id}/verify`)).data.data
    expect(verified.status).toBe('verified')
    await expect(request('post', `${R}/${record.id}/documents/${missing.id}/reject`, { reason: '' })).rejects.toMatchObject({ response: { status: 422 } })
    const update = await request('post', `${R}/${record.id}/updates`, { body: 'Hotel confirmed', notify: true })
    expect(update.data.data).toMatchObject({ visibility: 'customer', event_type: 'customer_update' })
  })

  it('bulk-updates a batch and reports skipped records', async () => {
    setActiveMockTemplate('shipping')
    const batches = (await request('get', '/api/tenant/service/batches')).data.data
    const batch = batches.find((entry) => entry.records_count > 0)
    const result = (await request('post', `/api/tenant/service/batches/${batch.id}/bulk-status`, { to_status_id: 'rs-shipment-in_transit' })).data.data
    expect(result.updated.length + result.skipped.length).toBe(batch.records_count)
  })
})
