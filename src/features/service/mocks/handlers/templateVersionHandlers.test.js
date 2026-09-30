// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const call = (method, url, data, params) => mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const T = '/api/tenant/settings/templates/installation'
const S = '/api/tenant/service'

describe('template versioning and request-type fields', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('devices')
    resetMockDb()
  })

  it('previews, keeps tenant edits on conflict, deactivates instead of deleting', async () => {
    expect((await call('get', T)).data.data).toMatchObject({ installed_version: 1, latest_version: 2, upgrade_available: true, conflicts: 0 })
    // The tenant already changed the urgent SLA → that change becomes a conflict.
    await call('patch', `${S}/sla-policies/sla-urgent`, { first_response_minutes: 20 })
    const preview = (await call('post', `${T}/upgrade`, { dry_run: true })).data.data.changes
    expect(preview.find((change) => change.id === 'sla-urgent-first-response').status).toBe('conflict')
    const result = (await call('post', `${T}/upgrade`, {})).data.data
    expect(result).toMatchObject({ installed_version: 2, upgrade_available: false })
    expect(result.skipped).toEqual(['sla-urgent-first-response'])
    expect((await call('get', `${S}/sla-policies`)).data.data.find((policy) => policy.id === 'sla-urgent').first_response_minutes).toBe(20)
    expect((await call('get', `${S}/escalation-rules`)).data.data.find((rule) => rule.id === 'esc-critical').active).toBe(false)
    expect((await call('get', `${S}/case-types`)).data.data.map((type) => type.id)).toContain('ct-feedback_followup')
    await expect(call('post', `${T}/upgrade`, {})).rejects.toMatchObject({ response: { status: 409 } })
  })

  it('takes the template value on a conflict when asked', async () => {
    await call('patch', `${S}/sla-policies/sla-urgent`, { first_response_minutes: 20 })
    await call('post', `${T}/upgrade`, { choices: { 'sla-urgent-first-response': 'take', 'kb-policies': 'keep' } })
    expect((await call('get', `${S}/sla-policies`)).data.data.find((policy) => policy.id === 'sla-urgent').first_response_minutes).toBe(15)
    expect((await call('get', `${S}/kb/categories`)).data.data.map((category) => category.id)).not.toContain('kbc-policies')
  })

  it('stores request-type fields on a case and enforces required ones', async () => {
    const type = (await call('get', `${S}/case-types`)).data.data.find((entry) => entry.key === 'maintenance')
    await call('patch', `${S}/case-types/${type.id}`, { form_fields: [...type.form_fields, { key: 'serial', label: { en: 'Serial' }, type: 'text', required: true, options: [] }] })
    const customer = (await call('get', `${S}/customers/lookup`, null, { search: '' })).data.data[0]
    await expect(call('post', `${S}/cases`, { customer_id: customer.id, subject: 'Broken', type_id: type.id })).rejects.toMatchObject({ response: { data: { errors: { 'custom_fields.serial': ['required'] } } } })
    const created = (await call('post', `${S}/cases`, { customer_id: customer.id, subject: 'Broken', type_id: type.id, custom_fields: { serial: 'SN-1', device_model: 'X1' } })).data.data
    expect(created.custom_fields).toEqual({ serial: 'SN-1', device_model: 'X1' })
    const updated = (await call('patch', `${S}/cases/${created.id}`, { version: created.version, custom_fields: { device_model: 'X2' } })).data.data
    expect(updated.custom_fields).toMatchObject({ serial: 'SN-1', device_model: 'X2' })
  })
})
