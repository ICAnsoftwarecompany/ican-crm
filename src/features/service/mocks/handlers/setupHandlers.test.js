// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb } from '../db'

const request = (method, url, data) => mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined }, { latency: 0 })

describe('setup wizard mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('lists templates with a preview of what they create', async () => {
    const { data } = await request('get', '/api/tenant/settings/templates')
    expect(data.data.map((entry) => entry.key)).toEqual(['devices', 'tourism', 'school', 'shipping'])
    expect(data.data[1].preview.record_types.length).toBeGreaterThan(0)
  })

  it('dry run changes nothing; apply switches configuration and capabilities', async () => {
    const dry = (await request('post', '/api/tenant/settings/templates/school/apply', { dry_run: true })).data.data
    expect(dry.dry_run).toBe(true)
    expect((await request('get', '/api/tenant/me/capabilities')).data.data.template).toBe('devices')
    await request('post', '/api/tenant/settings/templates/school/apply', { models: ['D'], terminology: { case: 'ticket' } })
    const manifest = (await request('get', '/api/tenant/me/capabilities')).data.data
    expect(manifest).toMatchObject({ template: 'school', models: ['D'], terminology: { case: 'ticket' } })
    expect(manifest.features).toContain('enrollments')
    await expect(request('post', '/api/tenant/settings/templates/school/apply', { models: [] })).rejects.toMatchObject({ response: { status: 422 } })
  })
})
