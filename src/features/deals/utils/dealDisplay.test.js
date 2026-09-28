import { describe, expect, it } from 'vitest'
import { getDealStatusColor, getDealStatusValue } from './dealDisplay'

describe('deal status display', () => {
  it('returns a primitive status unchanged as text', () => {
    expect(getDealStatusValue('active')).toBe('active')
  })

  it('extracts the label from a status object', () => {
    expect(getDealStatusValue({ id: 1, status: 'qualified', type: 'deal' })).toBe('qualified')
  })

  it('extracts an optional status color', () => {
    expect(getDealStatusColor({ status: 'qualified', color: '#22c55e' })).toBe('#22c55e')
  })
})
