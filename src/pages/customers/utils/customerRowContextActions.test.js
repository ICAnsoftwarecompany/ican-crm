import { describe, expect, it, vi } from 'vitest'
import { buildCustomerRowContextActions } from './customerRowContextActions'

const t = (key) => key

describe('buildCustomerRowContextActions', () => {
  it('offers add interest next to the other customer actions and calls it with the row', () => {
    const onAddInterest = vi.fn()
    const row = { id: 1, lead: { name: 'Ahmed' } }
    const actions = buildCustomerRowContextActions({ row, t, showTrash: false, onCustomizeTable: vi.fn(), onSchedule: vi.fn(), onAddFollowUp: vi.fn(), onAddInterest })
    expect(actions.map((action) => action.id)).toEqual([
      'customers-page-table-customization',
      'customers-row-add-meeting',
      'customers-row-add-call',
      'customers-row-add-follow-up',
      'customers-row-add-interest',
      'customers-row-toggle-selection',
    ])
    actions.find((action) => action.id === 'customers-row-add-interest').onClick()
    expect(onAddInterest).toHaveBeenCalledWith(row)
  })

  it('has no actions in the trash', () => {
    expect(buildCustomerRowContextActions({ row: { id: 1 }, t, showTrash: true })).toEqual([])
  })

  it('adds won and lost when their handlers are given', () => {
    const onMarkWon = vi.fn()
    const onMarkLost = vi.fn()
    const row = { id: 1 }
    const actions = buildCustomerRowContextActions({ row, t, showTrash: false, onCustomizeTable: vi.fn(), onSchedule: vi.fn(), onAddFollowUp: vi.fn(), onAddInterest: vi.fn(), onMarkWon, onMarkLost })
    expect(actions.map((action) => action.id)).toContain('customers-row-mark-won')
    actions.find((action) => action.id === 'customers-row-mark-lost').onClick()
    expect(onMarkLost).toHaveBeenCalledWith(row)
  })
})
