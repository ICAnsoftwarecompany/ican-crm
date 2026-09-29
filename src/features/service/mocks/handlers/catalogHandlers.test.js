// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })

const T = '/api/tenant'

describe('catalog, record types and pipelines mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('serves the capability registry and model presets', async () => {
    const registry = (await request('get', `${T}/catalog/capabilities`)).data.data
    expect(registry.find((entry) => entry.code === 'warranty').config_fields.length).toBeGreaterThan(0)
    const models = (await request('get', `${T}/catalog/service-models`)).data.data
    expect(models.map((model) => model.key)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])
  })

  it('validates item types: unknown capability and missing dependency', async () => {
    const base = { name: { en: 'Medicine' }, key: 'medicine', kind: 'product' }
    await expect(request('post', `${T}/catalog/item-types`, { ...base, capabilities: [{ code: 'teleport' }] })).rejects.toMatchObject({
      response: { status: 422, data: { errors: { capabilities: ['invalid'] } } },
    })
    await expect(request('post', `${T}/catalog/item-types`, { ...base, capabilities: [{ code: 'expiry', config: {} }] })).rejects.toMatchObject({
      response: { status: 422, data: { errors: { capabilities: ['depends_on'] } } },
    })
    const ok = await request('post', `${T}/catalog/item-types`, { ...base, capabilities: [{ code: 'batch_lot' }, { code: 'expiry', config: { alert_days: 60 } }] })
    expect(ok.status).toBe(201)
  })

  it('edits the service config of a catalog item and validates record-backed fulfillment', async () => {
    setActiveMockTemplate('tourism')
    const items = (await request('get', `${T}/catalog/items`)).data.data
    const pkg = items.find((item) => item.service_config.fulfillment.creates === 'booking')
    expect(pkg.item_type.key).toBe('package')
    await expect(
      request('patch', `${T}/catalog/items/${pkg.id}`, { service_config: { fulfillment: { creates: 'booking', record_type_id: null } } })
    ).rejects.toMatchObject({ response: { status: 422, data: { errors: { 'fulfillment.record_type_id': ['required'] } } } })
    const saved = await request('patch', `${T}/catalog/items/${pkg.id}`, { service_config: { fulfillment: { ...pkg.service_config.fulfillment, portal_visible: false } } })
    expect(saved.data.data.service_config.fulfillment.portal_visible).toBe(false)
  })

  it('versions pipelines on save and protects statuses in use', async () => {
    const pipeline = (await request('get', `${T}/pipelines`)).data.data.find((entry) => entry.id === 'pl-case-default')
    const renamed = pipeline.statuses.map((status) => (status.key === 'open' ? { ...status, label: { ar: 'مفتوح', en: 'Opened' } } : status))
    const saved = await request('patch', `${T}/pipelines/${pipeline.id}`, { ...pipeline, statuses: renamed })
    expect(saved.data.data).toMatchObject({ version: 2, version_id: 'pl-case-default-v2' })
    const withoutOpen = pipeline.statuses.filter((status) => status.id !== 'st-open')
    await expect(
      request('patch', `${T}/pipelines/${pipeline.id}`, { ...pipeline, statuses: withoutOpen, transitions: pipeline.transitions.filter((t) => t.from !== 'st-open' && t.to !== 'st-open') })
    ).rejects.toMatchObject({ response: { status: 409, data: { code: 'PIPELINE_STATUS_IN_USE' } } })
    const setup = (await request('get', `${T}/service/cases/setup`)).data.data
    expect(setup.case_types[0].pipeline_version_id).toBe('pl-case-default-v2')
  })

  it('requires exactly one initial status', async () => {
    await expect(
      request('post', `${T}/pipelines`, { label: { en: 'X' }, entity: 'record', statuses: [{ id: 'a', key: 'a', label: { en: 'A' } }] })
    ).rejects.toMatchObject({ response: { status: 422, data: { errors: { statuses: ['initial'] } } } })
  })

  it('has one record type per template with its pipeline', async () => {
    for (const template of ['devices', 'tourism', 'school', 'shipping']) {
      setActiveMockTemplate(template)
      const types = (await request('get', `${T}/service/record-types`)).data.data
      expect(types.length).toBeGreaterThan(0)
      const pipelines = (await request('get', `${T}/pipelines`)).data.data
      types.forEach((type) => expect(pipelines.some((pipeline) => pipeline.id === type.pipeline_id)).toBe(true))
    }
  })
})
