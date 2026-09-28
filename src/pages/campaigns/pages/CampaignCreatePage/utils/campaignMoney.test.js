import { describe, expect, it } from 'vitest'
import { toMinorCurrencyUnit } from './campaignMoney'

describe('toMinorCurrencyUnit', () => {
  it('converts an account-currency amount to its minor unit', () => {
    expect(toMinorCurrencyUnit(50)).toBe(5000)
  })

  it('rounds decimal amounts without floating-point residue', () => {
    expect(toMinorCurrencyUnit('50.25')).toBe(5025)
  })

  it('returns undefined for invalid values', () => {
    expect(toMinorCurrencyUnit('invalid')).toBeUndefined()
  })
})
