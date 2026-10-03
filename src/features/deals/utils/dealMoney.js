import { FREQUENCY_MONTHS, PAYMENT_TYPES } from '../constants/dealOptions'

/**
 * Money helpers for the won flow. RULE (backend doc rule 6): the backend recalculates every total from
 * `deal_lead_products`; these numbers are a PREVIEW for the user while filling the form, never sent as
 * the source of truth (the won request carries items + terms only, no totals).
 */

export function toAmount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const round2 = (value) => Math.round(value * 100) / 100

/** quantity × unit price − discount (discount is an amount per line: 2 × 150 − 10 = 290). */
export function lineTotal(item = {}) {
  const total = toAmount(item.quantity) * toAmount(item.unit_price) - toAmount(item.discount)
  return round2(Math.max(total, 0))
}

export function itemsTotal(items = []) {
  return round2(items.reduce((sum, item) => sum + lineTotal(item), 0))
}

/** Request items as the backend expects them; empty/zero-quantity rows are dropped. */
export function toItemsPayload(items = []) {
  return items
    .filter((item) => item?.product_id !== undefined && item?.product_id !== null && item?.product_id !== '' && toAmount(item.quantity) > 0)
    .map((item) => ({
      product_id: Number.isFinite(Number(item.product_id)) ? Number(item.product_id) : item.product_id,
      quantity: toAmount(item.quantity),
      unit_price: toAmount(item.unit_price),
      discount: toAmount(item.discount),
    }))
}

export function isInstallmentPayment(paymentType) {
  return paymentType !== 'cash'
}

/**
 * Validation of the won form. Returns `{ ok, errors }` where errors are i18n keys under
 * `dealWorkspace.closing.won.errors.*`.
 */
export function validateWonForm(form = {}) {
  const errors = {}
  const items = toItemsPayload(form.items)
  if (!items.length) errors.items = 'itemsRequired'
  if (!PAYMENT_TYPES.includes(form.payment_type)) errors.payment_type = 'paymentTypeRequired'
  const total = itemsTotal(items)
  const down = toAmount(form.down_payment)
  if (down < 0) errors.down_payment = 'downPaymentNegative'
  if (down > total && total > 0) errors.down_payment = 'downPaymentTooHigh'
  if (isInstallmentPayment(form.payment_type) && form.payment_type !== 'custom_staged') {
    if (toAmount(form.number_of_installments) < 1) errors.number_of_installments = 'installmentsRequired'
    if (!form.frequency) errors.frequency = 'frequencyRequired'
    if (!form.first_due_date) errors.first_due_date = 'firstDueDateRequired'
  }
  return { ok: Object.keys(errors).length === 0, errors }
}

/** The exact body of `POST /deals/leads/{id}/won` (Postman "lead won"). */
export function buildWonPayload(form = {}) {
  const items = toItemsPayload(form.items)
  const cash = !isInstallmentPayment(form.payment_type)
  // Cash with no down payment typed = paid in full (the backend doc's cash example sends the total).
  const down = form.down_payment === '' || form.down_payment === undefined || form.down_payment === null
    ? (cash ? itemsTotal(items) : 0)
    : toAmount(form.down_payment)
  const payload = { items, payment_type: form.payment_type, down_payment: down }
  if (cash) return payload
  if (form.payment_type === 'custom_staged') return { ...payload, notes: form.notes || undefined }
  return {
    ...payload,
    number_of_installments: toAmount(form.number_of_installments),
    frequency: form.frequency,
    interest_rate: form.payment_type === 'installment_no_interest' ? 0 : toAmount(form.interest_rate),
    first_due_date: form.first_due_date,
  }
}

function addPeriod(dateString, frequency, steps) {
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7 * steps)
  } else {
    const months = (FREQUENCY_MONTHS[frequency] || 1) * steps
    const day = date.getDate()
    date.setDate(1)
    date.setMonth(date.getMonth() + months)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    date.setDate(Math.min(day, lastDay))
  }
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * PREVIEW of the installment schedule (equal amounts, flat interest on the remaining amount, rounding
 * difference on the last installment). The backend's `PaymentPlan.generateInstallments()` is the real one.
 * 590 total, 100 down, 5 monthly → 5 × 98.
 */
export function previewInstallments({ total, downPayment, count, frequency, interestRate = 0, firstDueDate }) {
  const installments = Math.floor(toAmount(count))
  if (installments < 1 || !firstDueDate) return []
  const remaining = Math.max(toAmount(total) - toAmount(downPayment), 0)
  const withInterest = round2(remaining * (1 + toAmount(interestRate) / 100))
  const base = Math.floor((withInterest / installments) * 100) / 100
  return Array.from({ length: installments }, (_, index) => {
    const isLast = index === installments - 1
    const amount = isLast ? round2(withInterest - base * (installments - 1)) : base
    return { number: index + 1, dueDate: addPeriod(firstDueDate, frequency, index), amount }
  })
}

export function formatMoney(value, language = 'en', options = {}) {
  const amount = toAmount(value)
  try {
    return new Intl.NumberFormat(language, { maximumFractionDigits: 2, ...options }).format(amount)
  } catch {
    return String(amount)
  }
}

/** 0–100 (capped) or null when there is no target. */
export function progressPercent(value, target) {
  const goal = toAmount(target)
  if (goal <= 0) return null
  return Math.min(100, Math.round((toAmount(value) / goal) * 100))
}
