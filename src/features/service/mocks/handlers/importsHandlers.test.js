// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const I = '/api/tenant/imports'

describe('imports mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('shipping')
    resetMockDb()
  })

  it('uploads, dry-runs with row errors, executes and offers an error file', async () => {
    const entities = (await request('get', `${I}/entities`)).data.data
    expect(entities.map((entry) => entry.scope_id)).toContain('shipment')
    const fields = (await request('get', `${I}/fields`, null, { entity_type: 'record', scope_id: 'shipment' })).data.data
    expect(fields.map((field) => field.key)).toEqual(expect.arrayContaining(['reference_no', 'customer_phone', 'recipient_name', 'data.cod_amount']))
    const customers = (await request('get', '/api/tenant/service/cases', null, { per_page: 1 })).data.data
    const phone = customers[0].customer.phone
    const csv = `Ref,Merchant phone,Recipient,COD\nSH-NEW-1,${phone},Ali,350\nSH-NEW-2,${phone},Mona,abc\nSH-NEW-3,+201999999999,Omar,10\nSH-2026-2000,${phone},X,5\n`
    await expect(request('post', `${I}/files`, { file_name: 'x.xlsx', content: csv })).rejects.toMatchObject({ response: { status: 422 } })
    const file = (await request('post', `${I}/files`, { file_name: 'shipments.csv', content: csv })).data.data
    expect(file).toMatchObject({ headers: ['Ref', 'Merchant phone', 'Recipient', 'COD'], row_count: 4 })
    const mapping = { Ref: 'reference_no', 'Merchant phone': 'customer_phone', Recipient: 'recipient_name', COD: 'data.cod_amount' }
    const job = (await request('post', I, { file_id: file.file_id, entity_type: 'record', scope_id: 'shipment', mode: 'create', match_key: 'reference_no', mapping, save_mapping_as: 'Merchant sheet' })).data.data
    expect(job).toMatchObject({ status: 'validated', total: 4, valid: 1, failed: 3 })
    expect(job.errors_preview.map((entry) => entry.errors[0].code)).toEqual(['invalid_number', 'customer_not_found', 'already_exists'])
    const done = (await request('post', `${I}/${job.id}/execute`)).data.data
    expect(done).toMatchObject({ status: 'completed_with_errors', succeeded: 1 })
    await expect(request('post', `${I}/${job.id}/execute`)).rejects.toMatchObject({ response: { status: 409 } })
    const created = (await request('get', '/api/tenant/service/records', null, { per_page: 100 })).data.data.find((record) => record.reference_no === 'SH-NEW-1')
    expect(created).toBeTruthy()
    const errorFile = (await request('get', `${I}/${job.id}/error-file`)).data.data
    expect(errorFile.file_name).toBe('shipments-errors.csv')
    expect(errorFile.content.split('\r\n')).toHaveLength(4)
    expect((await request('get', `${I}/mappings`, null, { entity_type: 'record', scope_id: 'shipment' })).data.data[0].name).toBe('Merchant sheet')
  })

  it('upserts by match key', async () => {
    const phone = (await request('get', '/api/tenant/service/cases', null, { per_page: 1 })).data.data[0].customer.phone
    const file = (await request('post', `${I}/files`, { file_name: 'u.csv', content: `ref,phone,cod\nSH-2026-2000,${phone},999\n` })).data.data
    const job = (await request('post', I, { file_id: file.file_id, entity_type: 'record', scope_id: 'shipment', mode: 'upsert', match_key: 'reference_no', mapping: { ref: 'reference_no', phone: 'customer_phone', cod: 'data.cod_amount' } })).data.data
    expect(job).toMatchObject({ valid: 1, to_update: 1 })
    await request('post', `${I}/${job.id}/execute`)
    const record = (await request('get', '/api/tenant/service/records', null, { per_page: 100 })).data.data.find((entry) => entry.reference_no === 'SH-2026-2000')
    expect(record.data.cod_amount).toBe(999)
  })
})
