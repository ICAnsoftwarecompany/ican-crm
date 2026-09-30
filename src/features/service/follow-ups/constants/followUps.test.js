import { describe, expect, it } from 'vitest'
import { formToOffset, formToRule, offsetToForm, ruleToForm } from './followUps'

describe('follow-up step editor mapping', () => {
  it('round-trips rules', () => {
    expect(ruleToForm('retry:+1 day:2')).toEqual({ type: 'retry', every: 1, unit: 'day', max: 2 })
    expect(formToRule({ type: 'retry', every: 2, unit: 'hour', max: 3 })).toBe('retry:+2 hour:3')
    expect(ruleToForm('create_case:ct-complaint')).toEqual({ type: 'create_case', case_type_id: 'ct-complaint' })
    expect(formToRule({ type: 'next' })).toBeNull()
    expect(formToRule({ type: 'create_case' })).toBeNull()
  })

  it('round-trips offsets', () => {
    expect(offsetToForm('-30 day from end')).toEqual({ direction: 'before_end', amount: 30, unit: 'day' })
    expect(formToOffset({ direction: 'after_start', amount: 7, unit: 'day' })).toBe('+7 day')
    expect(formToOffset(offsetToForm('-2 week from end'))).toBe('-2 week from end')
  })
})
