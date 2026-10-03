import { describe, expect, it } from 'vitest'
import { buildWonPayload, itemsTotal, lineTotal, previewInstallments, progressPercent, toItemsPayload, validateWonForm } from './dealMoney'

const items = [
  { product_id: '10', quantity: 2, unit_price: 150, discount: 10 },
  { product_id: 15, quantity: 1, unit_price: 300, discount: 0 },
]

describe('won flow money preview', () => {
  it('treats discount as an amount per line (backend doc example = 590)', () => {
    expect(lineTotal(items[0])).toBe(290)
    expect(itemsTotal(items)).toBe(590)
  })

  it('drops empty rows and casts numeric ids', () => {
    expect(toItemsPayload([...items, { product_id: '', quantity: 1 }, { product_id: 3, quantity: 0 }])).toEqual([
      { product_id: 10, quantity: 2, unit_price: 150, discount: 10 },
      { product_id: 15, quantity: 1, unit_price: 300, discount: 0 },
    ])
  })

  it('previews 590 − 100 over 5 monthly installments as 5 × 98', () => {
    const rows = previewInstallments({ total: 590, downPayment: 100, count: 5, frequency: 'monthly', firstDueDate: '2026-10-01' })
    expect(rows.map((row) => row.amount)).toEqual([98, 98, 98, 98, 98])
    expect(rows.map((row) => row.dueDate)).toEqual(['2026-10-01', '2026-11-01', '2026-12-01', '2027-01-01', '2027-02-01'])
  })

  it('puts the rounding difference on the last installment and clamps month ends', () => {
    const rows = previewInstallments({ total: 100, downPayment: 0, count: 3, frequency: 'monthly', firstDueDate: '2027-01-31' })
    expect(rows.map((row) => row.amount)).toEqual([33.33, 33.33, 33.34])
    expect(rows[1].dueDate).toBe('2027-02-28')
  })
})

describe('won payload', () => {
  it('builds the cash body without installment fields', () => {
    expect(buildWonPayload({ items, payment_type: 'cash', down_payment: 590 })).toEqual({
      items: toItemsPayload(items), payment_type: 'cash', down_payment: 590,
    })
  })

  it('builds the installment body exactly like the Postman example', () => {
    const body = buildWonPayload({ items, payment_type: 'installment', down_payment: '100', number_of_installments: '5', frequency: 'monthly', interest_rate: '0', first_due_date: '2026-10-01' })
    expect(body).toMatchObject({ payment_type: 'installment', down_payment: 100, number_of_installments: 5, frequency: 'monthly', interest_rate: 0, first_due_date: '2026-10-01' })
  })

  it('sends the full total as down payment for cash when none is typed', () => {
    expect(buildWonPayload({ items, payment_type: 'cash', down_payment: '' }).down_payment).toBe(590)
    expect(buildWonPayload({ items, payment_type: 'installment', down_payment: '', number_of_installments: 2, frequency: 'monthly', first_due_date: '2026-10-01' }).down_payment).toBe(0)
  })

  it('forces 0 interest for installment_no_interest', () => {
    expect(buildWonPayload({ items, payment_type: 'installment_no_interest', interest_rate: 12, number_of_installments: 2, frequency: 'monthly', first_due_date: '2026-10-01' }).interest_rate).toBe(0)
  })

  it('validates required fields', () => {
    expect(validateWonForm({ items: [], payment_type: 'cash' }).errors.items).toBe('itemsRequired')
    expect(validateWonForm({ items, payment_type: 'installment', down_payment: 1000 }).errors).toMatchObject({
      down_payment: 'downPaymentTooHigh', number_of_installments: 'installmentsRequired', first_due_date: 'firstDueDateRequired',
    })
    expect(validateWonForm({ items, payment_type: 'cash', down_payment: 590 }).ok).toBe(true)
  })
})

describe('progressPercent', () => {
  it('caps at 100 and returns null without a target', () => {
    expect(progressPercent(50, 200)).toBe(25)
    expect(progressPercent(500, 200)).toBe(100)
    expect(progressPercent(5, 0)).toBeNull()
  })
})
