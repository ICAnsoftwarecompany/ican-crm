import { describe, expect, it } from 'vitest'
import { isInstallmentOverdue, normalizeContract, summarizeContract } from './dealContracts'

const contract = normalizeContract({
  id: 15,
  contract_number: 'CT-8F3A21BC',
  deal_id: 1,
  lead_id: 100,
  total_amount: '590.00',
  down_payment: '100.00',
  payment_type: 'installment',
  payment_plan: {
    number_of_installments: 3,
    frequency: 'monthly',
    installments: [
      { installment_number: 1, due_date: '2026-09-01', amount: '98.00', status: 'paid' },
      { installment_number: 2, due_date: '2026-09-20', amount: '98.00', status: 'pending' },
      { installment_number: 3, due_date: '2026-11-01', amount: '294.00', status: 'pending' },
    ],
  },
})

describe('contracts', () => {
  const now = new Date('2026-10-03T10:00:00')

  it('normalizes the won response shape', () => {
    expect(contract).toMatchObject({ number: 'CT-8F3A21BC', total: 590, downPayment: 100, paymentType: 'installment', dealId: 1, leadId: 100 })
    expect(contract.installments.map((row) => row.dueDate)).toEqual(['2026-09-01', '2026-09-20', '2026-11-01'])
  })

  it('flags overdue installments and summarizes paid / remaining', () => {
    expect(isInstallmentOverdue(contract.installments[1], now)).toBe(true)
    expect(isInstallmentOverdue(contract.installments[0], now)).toBe(false)
    expect(summarizeContract(contract, now)).toMatchObject({ paid: 198, remaining: 392, overdueCount: 1, overdueAmount: 98 })
    expect(summarizeContract(contract, now).nextDue.number).toBe(2)
  })
})
