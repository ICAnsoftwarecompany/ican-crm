/** "month" or "3 × month" from a recurrence plan, in the UI language. */
export function cadenceLabel(plan, t) {
  const unit = t(`service.subscriptions.units.${plan?.unit || 'month'}`)
  return Number(plan?.every) > 1 ? t('service.subscriptions.everyN', { count: plan.every, unit }) : unit
}
