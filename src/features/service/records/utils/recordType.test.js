import { describe, expect, it } from 'vitest'
import { allowedRecordTransitions, componentMargin, findRecordType, recordTabs } from './recordType'

const type = {
  id: 'rt-x',
  key: 'x',
  participant_roles: [{ key: 'a' }],
  component_types: [],
  entry_types: [{ key: 'e' }],
  pipeline: { statuses: [{ id: 's1' }, { id: 's2' }, { id: 's3' }], transitions: [{ from: 's1', to: 's2' }, { from: 's1', to: 's3' }] },
}

describe('record type helpers', () => {
  it('finds by key or id and lists allowed transitions', () => {
    expect(findRecordType({ record_types: [type] }, 'x')).toBe(type)
    expect(findRecordType({ record_types: [type] }, 'rt-x')).toBe(type)
    expect(allowedRecordTransitions(type, 's1').map((status) => status.id)).toEqual(['s2', 's3'])
    expect(allowedRecordTransitions(type, 's2')).toEqual([])
  })

  it('derives tabs from configuration', () => {
    expect(recordTabs(type)).toEqual(['overview', 'participants', 'entries', 'timeline'])
    expect(recordTabs(type, { hasDocuments: true })).toContain('documents')
  })

  it('computes component margin', () => {
    expect(componentMargin({ sell_amount: 1200, cost_amount: 1000 })).toBe(200)
    expect(componentMargin({ sell_amount: 1200 })).toBeNull()
  })
})
