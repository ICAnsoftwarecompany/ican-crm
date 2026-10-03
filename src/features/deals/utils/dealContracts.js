import { toAmount } from './dealMoney'

const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

function dateOnly(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

export function normalizeInstallment(item = {}) {
  return {
    ...item,
    id: first(item.id, item.installment_number),
    number: toAmount(first(item.installment_number, item.number, 0)),
    dueDate: dateOnly(first(item.due_date, item.dueDate)),
    amount: toAmount(item.amount),
    paidAmount: toAmount(first(item.paid_amount, item.paid, 0)),
    status: String(first(item.status, 'pending')).toLowerCase(),
  }
}

export function isInstallmentPaid(installment) {
  return installment?.status === 'paid'
}

/** Overdue = not paid/cancelled and the due date is before today (local). */
export function isInstallmentOverdue(installment, now = new Date()) {
  if (!installment?.dueDate || ['paid', 'cancelled'].includes(installment.status)) return false
  if (installment.status === 'overdue') return true
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return new Date(`${installment.dueDate}T00:00:00`) < today
}

/** Contract row (`GET /deals/contracts`) or the won response, flattened. */
export function normalizeContract(item = {}) {
  const plan = first(item.payment_plan, item.paymentPlan, null)
  const lead = first(item.lead, item.deal_lead?.lead, null)
  const installments = (Array.isArray(plan?.installments) ? plan.installments : []).map(normalizeInstallment)
  return {
    ...item,
    id: item.id,
    number: first(item.contract_number, item.number, item.id ? `#${item.id}` : ''),
    dealId: first(item.deal_id, item.deal?.id),
    dealName: first(item.deal?.name, ''),
    dealLeadId: first(item.deal_lead_id),
    leadId: first(item.lead_id, lead?.id),
    leadName: first(lead?.name, item.lead_name, ''),
    total: toAmount(item.total_amount),
    downPayment: toAmount(item.down_payment),
    paymentType: first(item.payment_type, plan?.plan_type, 'cash'),
    status: String(first(item.status, 'active')).toLowerCase(),
    signedAt: first(item.signed_at, item.created_at, null),
    plan: plan ? { ...plan, frequency: first(plan.frequency, ''), count: toAmount(first(plan.number_of_installments, installments.length)) } : null,
    installments,
  }
}

/** Paid / remaining / overdue totals of one contract (down payment counts as paid on signing). */
export function summarizeContract(contract, now = new Date()) {
  const installments = contract?.installments || []
  const paidInstallments = installments.reduce((sum, row) => sum + (isInstallmentPaid(row) ? row.amount : row.paidAmount), 0)
  const overdue = installments.filter((row) => isInstallmentOverdue(row, now))
  const paid = toAmount(contract?.downPayment) + paidInstallments
  const scheduled = installments.length ? toAmount(contract?.downPayment) + installments.reduce((sum, row) => sum + row.amount, 0) : toAmount(contract?.total)
  return {
    paid,
    remaining: Math.max(scheduled - paid, 0),
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((sum, row) => sum + row.amount - row.paidAmount, 0),
    nextDue: installments.filter((row) => !isInstallmentPaid(row) && row.status !== 'cancelled').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] || null,
  }
}
