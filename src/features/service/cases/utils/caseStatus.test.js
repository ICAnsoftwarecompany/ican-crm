import { describe, expect, it } from 'vitest'
import { findTransitionToCategory, getAllowedTransitions, isCaseOpen } from './caseStatus'

const statuses = [
  { id: 's-new', key: 'new', category: 'open' },
  { id: 's-progress', key: 'in_progress', category: 'in_progress' },
  { id: 's-waiting', key: 'pending_customer', category: 'pending' },
  { id: 's-resolved', key: 'resolved', category: 'resolved' },
]
const setup = {
  case_types: [
    {
      id: 'type-1',
      pipeline: {
        statuses,
        transitions: [
          { from: 's-new', to: 's-progress', required_fields: [] },
          { from: 's-new', to: 's-waiting', required_fields: [] },
          { from: 's-progress', to: 's-resolved', required_fields: ['resolution_code'] },
        ],
      },
    },
  ],
}

describe('getAllowedTransitions', () => {
  it('lists targets from the current status with required fields', () => {
    const result = getAllowedTransitions(setup, { type: { id: 'type-1' }, status: { id: 's-progress' } })
    expect(result).toEqual([{ status: statuses[3], requiredFields: ['resolution_code'] }])
  })

  it('returns nothing for unknown status or setup', () => {
    expect(getAllowedTransitions(setup, { type_id: 'type-1', status_id: 's-resolved' })).toEqual([])
    expect(getAllowedTransitions(null, { status_id: 's-new' })).toEqual([])
  })
})

describe('findTransitionToCategory', () => {
  it('finds the first allowed status in a category', () => {
    expect(findTransitionToCategory(setup, { type_id: 'type-1', status_id: 's-new' }, 'pending')?.status.id).toBe('s-waiting')
    expect(findTransitionToCategory(setup, { type_id: 'type-1', status_id: 's-new' }, 'resolved')).toBeNull()
  })
})

describe('isCaseOpen', () => {
  it('treats open, in progress and pending as open', () => {
    expect(isCaseOpen({ status: { category: 'pending' } })).toBe(true)
    expect(isCaseOpen({ status: { category: 'closed' } })).toBe(false)
  })
})
