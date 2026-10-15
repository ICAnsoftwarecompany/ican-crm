import { describe, expect, it } from 'vitest'
import {
  buildCampaignsPayload, buildExistingLeadsPayload, buildNewLeadPayload, countLeadSource, createLeadSourceState,
  normalizePhone, parseLeadMatrix, parseLeadText, validateLeadRows, validateLeadSource,
} from './leadSource'

const strip = (rows) => rows.map(({ key, ...row }) => row)

describe('lead source parsing', () => {
  it('reads a pasted Excel block with an Arabic header in any column order', () => {
    const rows = parseLeadText('الهاتف\tالاسم\tالبريد\n0100 123 4567\tأحمد علي\tahmed@test.com\n\n01112223334\tسارة\t')
    expect(strip(rows)).toEqual([
      { name: 'أحمد علي', phone: '0100 123 4567', email: 'ahmed@test.com', company: '' },
      { name: 'سارة', phone: '01112223334', email: '', company: '' },
    ])
    expect(new Set(rows.map((row) => row.key)).size).toBe(2)
  })

  it('guesses rows without a header (comma separated, phone / email anywhere)', () => {
    expect(strip(parseLeadText('01001234567, Mona, mona@x.io, ACME\nKarim;+20 100 999 8888'))).toEqual([
      { name: 'Mona', phone: '01001234567', email: 'mona@x.io', company: 'ACME' },
      { name: 'Karim', phone: '+20 100 999 8888', email: '', company: '' },
    ])
  })

  it('maps an English header from a sheet matrix and drops empty rows', () => {
    expect(strip(parseLeadMatrix([['Name', 'Mobile', 'Company'], ['Hany', 1001112222, 'X'], [null, '', undefined]]))).toEqual([
      { name: 'Hany', phone: '1001112222', email: '', company: 'X' },
    ])
  })

  it('normalizes phones', () => {
    expect(normalizePhone(' 0100-123 4567 ')).toBe('01001234567')
    expect(normalizePhone('+20 (100) 1234567')).toBe('+201001234567')
  })
})

describe('lead source validation', () => {
  it('flags missing name, bad phone / email and duplicates (also against picked CRM leads)', () => {
    const rows = [
      { key: 'a', name: 'A', phone: '01001234567', email: '' },
      { key: 'b', name: '', phone: '0100 123 4567', email: 'bad' },
      { key: 'c', name: 'C', phone: '123', email: '' },
      { key: 'd', name: 'D', phone: '01200000000', email: '' },
    ]
    expect(validateLeadRows(rows, [{ id: 9, phone: '01200000000' }])).toEqual({
      b: { name: 'leadNameRequired', phone: 'leadPhoneDuplicate', email: 'leadEmailInvalid' },
      c: { phone: 'leadPhoneInvalid' },
      d: { phone: 'leadPhoneDuplicate' },
    })
  })

  it('requires a choice, a campaign in campaigns mode and a valid lead in leads mode', () => {
    const base = createLeadSourceState()
    expect(validateLeadSource(base)).toEqual({ mode: 'sourceRequired' })
    expect(validateLeadSource({ ...base, mode: 'later' })).toEqual({})
    expect(validateLeadSource({ ...base, mode: 'campaigns' })).toEqual({ campaigns: 'campaignsRequired' })
    expect(validateLeadSource({ ...base, mode: 'leads' })).toEqual({ leads: 'leadsRequired' })
    expect(validateLeadSource({ ...base, mode: 'leads', rows: [{ key: 'a', name: '', phone: '' }] })).toEqual({ leads: 'leadRowsInvalid' })
    expect(validateLeadSource({ ...base, mode: 'leads', existing: [{ id: 1 }] })).toEqual({})
  })
})

describe('lead source requests', () => {
  const source = { ...createLeadSourceState(), mode: 'leads', existing: [{ id: '15' }, { id: '20' }], rows: [{ key: 'a', name: ' Ahmed ', phone: '0100', email: '', company: 'ABC' }], ownerId: '5', stageId: '2' }

  it('builds the Postman bodies', () => {
    expect(buildExistingLeadsPayload(source, '10')).toEqual({ deal_id: 10, lead_ids: [15, 20], owner_id: 5, stage_id: 2 })
    expect(buildNewLeadPayload(source.rows[0], source, 10)).toEqual({ deal_id: 10, name: 'Ahmed', phone: '0100', company: 'ABC', type: 'lead', source: 'manual', linked_type: 'manual', owner_id: 5 })
    expect(buildCampaignsPayload(source)).toBeNull()
    expect(buildCampaignsPayload({ ...source, mode: 'campaigns', campaignIds: ['1', '2'], campaignsActive: false })).toEqual({ campaign_ids: [1, 2], is_active: false })
    expect(buildExistingLeadsPayload({ ...source, mode: 'campaigns' }, 10)).toBeNull()
  })

  it('counts only what the chosen mode sends', () => {
    expect(countLeadSource(source)).toEqual({ campaigns: 0, existing: 2, created: 1 })
    expect(countLeadSource({ ...source, mode: 'campaigns', campaignIds: [1] })).toEqual({ campaigns: 1, existing: 0, created: 0 })
  })
})
