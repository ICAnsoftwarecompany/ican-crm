import { describe, expect, it } from 'vitest'
import { filterCustomersByStatusId, NO_CUSTOMER_STATUS_ID } from './customerStatus'

describe('filterCustomersByStatusId', () => {
  const customers = [
    { id: 1, status_type_id: null, status: null },
    { id: 2, lead: { status_type_id: 4 } },
    { id: 3 },
    { id: 4, status_type_id: '' },
    { id: 5, status: { id: 2 } },
    { id: 6, lead: { status: { id: 3 } } },
  ]

  it('shows only customers without a status', () => {
    expect(filterCustomersByStatusId(customers, NO_CUSTOMER_STATUS_ID).map(({ id }) => id)).toEqual([1, 3, 4])
  })

  it('keeps the all-statuses option unfiltered', () => {
    expect(filterCustomersByStatusId(customers, null)).toBe(customers)
  })

  it('matches assigned statuses from nested and top-level data', () => {
    expect(filterCustomersByStatusId(customers, '4')).toEqual([customers[1]])
    expect(filterCustomersByStatusId(customers, 2)).toEqual([customers[4]])
    expect(filterCustomersByStatusId(customers, 3)).toEqual([customers[5]])
  })
})
