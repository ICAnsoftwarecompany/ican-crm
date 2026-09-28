export function toMinorCurrencyUnit(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return undefined

  return Math.round(amount * 100)
}
