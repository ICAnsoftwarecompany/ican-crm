import { describe, expect, it } from 'vitest'
import { buildErrorFile, parseCsv, toCsv, validateImport } from './importEngine'

describe('import engine', () => {
  it('parses quoted CSV with commas, quotes and newlines', () => {
    const parsed = parseCsv('﻿name,note\r\n"Ali, Jr","say ""hi""\nthere"\r\n\r\nMona,ok\n')
    expect(parsed.headers).toEqual(['name', 'note'])
    expect(parsed.rows).toEqual([['Ali, Jr', 'say "hi"\nthere'], ['Mona', 'ok']])
    expect(parseCsv(toCsv([['a', 'b'], ['x,y', 'q"z']]))).toEqual({ headers: ['a', 'b'], rows: [['x,y', 'q"z']] })
  })

  it('validates types, lookups, duplicates and create vs upsert', () => {
    const fields = [{ key: 'ref', type: 'text', required: true }, { key: 'phone', type: 'phone', required: true }, { key: 'weight', type: 'number' }, { key: 'date', type: 'date' }]
    const headers = ['Ref', 'Mobile', 'Kg', 'When']
    const rows = [['R1', '+201000000001', '2', '2026-10-01'], ['R2', 'abc', 'x', '01/10/2026'], ['R1', '+201000000002', '', ''], ['R9', '+201999999999', '', ''], ['', '+201000000001', '', '']]
    const lookups = { findExisting: (value) => value === 'R9', resolve: (key, value) => (key === 'phone' && value === '+201999999999' ? { error: 'customer_not_found' } : null) }
    const mapping = { Ref: 'ref', Mobile: 'phone', Kg: 'weight', When: 'date' }
    const created = validateImport({ fields, mapping, headers, rows, mode: 'create', matchKey: 'ref', lookups })
    expect(created.results.map((entry) => entry.errors.map((error) => error.code))).toEqual([[], ['invalid_phone', 'invalid_number', 'invalid_date'], ['duplicate_in_file'], ['customer_not_found', 'already_exists'], ['required']])
    expect(created).toMatchObject({ total: 5, valid: 1, failed: 4, to_create: 1 })
    const upsert = validateImport({ fields, mapping, headers, rows: [['R9', '+201000000001']], mode: 'upsert', matchKey: 'ref', lookups })
    expect(upsert).toMatchObject({ valid: 1, to_update: 1 })
    expect(validateImport({ fields, mapping: { Ref: 'ref' }, headers, rows: [['R5']], matchKey: 'ref', lookups }).results[0].errors).toEqual([{ field: 'phone', code: 'not_mapped' }])
    const file = buildErrorFile(headers, rows, created.results)
    expect(parseCsv(file).rows).toHaveLength(4)
    expect(parseCsv(file).headers.at(-1)).toBe('errors')
  })
})
