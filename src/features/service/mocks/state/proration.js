/**
 * Mid-period plan change (spec §30 proration, F7 "Advanced"): credit the unused part of the current price, charge
 * the unused part at the new price. Day-based, rounded to 2 decimals. `effective = next_period` → no proration.
 */
const DAY = 24 * 60 * 60 * 1000
const round2 = (value) => Math.round(value * 100) / 100

export function prorate({ periodStart, periodEnd, oldPrice, newPrice, today }) {
  const periodDays = Math.max(1, Math.round((Date.parse(periodEnd) - Date.parse(periodStart)) / DAY))
  const daysLeft = Math.min(periodDays, Math.max(0, Math.round((Date.parse(periodEnd) - Date.parse(today)) / DAY)))
  const ratio = daysLeft / periodDays
  const credit = round2(oldPrice * ratio)
  const charge = round2(newPrice * ratio)
  return { period_days: periodDays, days_left: daysLeft, credit_unused: credit, charge_new: charge, net: round2(charge - credit) }
}
