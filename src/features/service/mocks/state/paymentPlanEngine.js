/**
 * Mock of the backend payment-plan Preview Engine (spec §29.6). The real
 * engine lives on the server; this one exists so the UI can be built and so
 * the algorithm is pinned by tests (see paymentPlanEngine.test.js).
 * Pure function: no state, nothing saved.
 */

const DAY_MS = 24 * 60 * 60 * 1000

/** Date-only arithmetic in UTC; month math clamps to the month end (31 Jan + 1 month = 28/29 Feb). */
export function addPeriod(isoDate, amount, unit) {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
  if (unit === 'day' || unit === 'week') {
    const days = unit === 'week' ? amount * 7 : amount
    return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10)
  }
  const months = unit === 'year' ? amount * 12 : amount
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return target.toISOString().slice(0, 10)
}

/** "3 month" → { amount: 3, unit: 'month' } */
export function parsePeriod(text = '1 month') {
  const [amount, unit] = String(text).trim().split(/\s+/)
  return { amount: Number(amount) || 1, unit: (unit || 'month').replace(/s$/, '') }
}

/**
 * Resolves a `due` rule: on_contract | on_delivery | "+N unit" | "-N unit from delivery" | ISO date.
 * Returns { date, warning }.
 */
export function resolveDue(due, { contractDate, deliveryDate }) {
  if (!due || due === 'on_contract') return { date: contractDate }
  if (due === 'on_delivery') return deliveryDate ? { date: deliveryDate } : { date: null, warning: 'delivery_date_required' }
  const relative = String(due).match(/^([+-])(\d+)\s+(day|week|month|year)s?(\s+from\s+delivery)?$/)
  if (relative) {
    const [, sign, amount, unit, fromDelivery] = relative
    const base = fromDelivery ? deliveryDate : contractDate
    if (!base) return { date: null, warning: 'delivery_date_required' }
    return { date: addPeriod(base, (sign === '-' ? -1 : 1) * Number(amount), unit) }
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(due)) return { date: due.slice(0, 10) }
  return { date: contractDate, warning: 'unknown_due_rule' }
}

const roundTo = (value, step) => (step > 1 ? Math.round(value / step) * step : Math.round(value * 100) / 100)

function componentAmount(component, finalPrice) {
  if (component.basis === 'percent') return (finalPrice * Number(component.value || 0)) / 100
  if (component.basis === 'fixed') return Number(component.value || 0)
  return 0
}

/**
 * @param {object} config - payment plan config (components, price_adjustment, interest, rounding, limits, reservation_fee…)
 * @param {{ price: number, quantity?: number, contract_date: string, delivery_date?: string, overrides?: object }} input
 * @returns {{ final_price, lines, totals, warnings, requires_approval }}
 */
export function previewPlan(config, input) {
  const warnings = []
  const overrides = input.overrides || {}
  const contractDate = String(input.contract_date).slice(0, 10)
  const deliveryDate = input.delivery_date ? String(input.delivery_date).slice(0, 10) : null
  const base = Number(input.price) * (Number(input.quantity) || 1)

  // 1–3. price → adjustment → discount (within limits, otherwise approval)
  const adjustment = config.price_adjustment || { type: 'none' }
  let finalPrice = base
  if (adjustment.type === 'percent') finalPrice = base * (1 + Number(adjustment.value || 0) / 100)
  if (adjustment.type === 'fixed') finalPrice = base + Number(adjustment.value || 0)
  const discountPercent = Number(overrides.discount_percent || 0)
  const limits = config.limits || {}
  let requiresApproval = false
  if (discountPercent) {
    if (limits.max_discount_percent != null && discountPercent > limits.max_discount_percent) {
      warnings.push('discount_above_limit')
      requiresApproval = true
    }
    finalPrice = finalPrice * (1 - discountPercent / 100)
  }
  finalPrice = Math.round(finalPrice * 100) / 100

  // Overrides allowed by the plan (down %, installment count).
  const components = (config.components || []).map((component) => {
    if (component.type === 'down_payment' && overrides.down_percent != null) return { ...component, basis: 'percent', value: Number(overrides.down_percent) }
    if (component.type === 'installments' && overrides.count != null) return { ...component, count: Number(overrides.count) }
    return component
  })
  const down = components.find((component) => component.type === 'down_payment')
  if (down && limits.min_down_percent != null && down.basis === 'percent' && down.value < limits.min_down_percent) {
    warnings.push('down_below_minimum')
    requiresApproval = true
  }

  const lines = []
  const push = (line) => lines.push({ paid_amount: 0, ...line })
  const dueOf = (due) => {
    const result = resolveDue(due, { contractDate, deliveryDate })
    if (result.warning && !warnings.includes(result.warning)) warnings.push(result.warning)
    return result.date
  }

  // 4. fixed / percent components inside the price
  const typeOf = { down_payment: 'down', delivery: 'delivery', milestone: 'milestone', fee: 'fee', custom: 'custom', maintenance: 'maintenance' }
  let inPriceFixed = 0
  components
    .filter((component) => component.type !== 'installments' && !component.outside_price)
    .forEach((component) => {
      const amount = roundTo(componentAmount(component, finalPrice), 1)
      inPriceFixed += amount
      const line = { line_type: typeOf[component.type] || 'custom', due_date: dueOf(component.due), amount, in_price: true, milestone_key: component.milestone_key || null }
      if (component.type === 'down_payment' && config.reservation_fee?.deducted_from === 'down_payment') line.includes_reservation = Number(config.reservation_fee.amount) || 0
      push(line)
    })

  // 5–8. remaining split into installments (+ interest), rounded, remainder on the last
  const installments = components.find((component) => component.type === 'installments')
  const remaining = Math.round((finalPrice - inPriceFixed) * 100) / 100
  if (installments) {
    const count = Math.max(Number(installments.count) || 1, 1)
    if (limits.max_count != null && count > limits.max_count) {
      warnings.push('count_above_limit')
      requiresApproval = true
    }
    const interest = config.interest || { type: 'none' }
    let totalToPay = remaining
    let each = remaining / count
    if (interest.type === 'flat') {
      totalToPay = remaining * (1 + Number(interest.value || 0) / 100)
      each = totalToPay / count
    } else if (interest.type === 'percent_per_period' && Number(interest.value)) {
      const rate = Number(interest.value) / 100
      each = (remaining * rate) / (1 - (1 + rate) ** -count)
      totalToPay = each * count
    }
    const step = Number(config.rounding?.to) || 1
    const rounded = roundTo(each, step)
    const every = parsePeriod(installments.every)
    const first = dueOf(installments.first_due || `+${every.amount} ${every.unit}`)
    const interestTotal = Math.round((totalToPay - remaining) * 100) / 100
    for (let index = 0; index < count; index += 1) {
      const isLast = index === count - 1
      const amount = isLast ? Math.round((totalToPay - rounded * (count - 1)) * 100) / 100 : rounded
      push({
        line_type: 'installment',
        due_date: first ? addPeriod(first, index * every.amount, every.unit) : null,
        amount,
        in_price: true,
        interest_share: interestTotal ? Math.round((interestTotal / count) * 100) / 100 : 0,
      })
    }
  } else if (Math.abs(remaining) > 0.01) {
    warnings.push('unallocated_remainder')
  }

  // 10. outside-the-price components (maintenance deposit, club fees…)
  components
    .filter((component) => component.outside_price)
    .forEach((component) => push({ line_type: typeOf[component.type] || 'custom', due_date: dueOf(component.due), amount: roundTo(componentAmount(component, finalPrice), 1), in_price: false }))
  if (config.admin_fee?.type === 'fixed' && Number(config.admin_fee.value)) push({ line_type: 'fee', due_date: contractDate, amount: Number(config.admin_fee.value), in_price: false })

  // 11. sort by date (stable), number the lines
  const sorted = lines
    .map((line, index) => ({ ...line, order: index }))
    .sort((a, b) => String(a.due_date || '9999').localeCompare(String(b.due_date || '9999')) || a.order - b.order)
    .map(({ order, ...line }, index) => ({ seq: index, ...line }))

  // 12. check: lines inside the price == final price (+ interest)
  const inPrice = Math.round(sorted.filter((line) => line.in_price).reduce((sum, line) => sum + line.amount, 0) * 100) / 100
  const interestTotal = Math.round(sorted.reduce((sum, line) => sum + (line.interest_share || 0), 0) * 100) / 100
  const outside = Math.round(sorted.filter((line) => !line.in_price).reduce((sum, line) => sum + line.amount, 0) * 100) / 100
  if (Math.abs(inPrice - (finalPrice + interestTotal)) > 0.05) warnings.push('total_mismatch')

  return {
    base_price: base,
    final_price: finalPrice,
    lines: sorted,
    totals: { in_price: inPrice, interest: interestTotal, outside_price: outside, grand_total: Math.round((inPrice + outside) * 100) / 100 },
    warnings,
    requires_approval: requiresApproval,
  }
}
