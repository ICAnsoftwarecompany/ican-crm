export function getDealStatusValue(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'object') return String(value)

  return String(value.status || value.name || value.title || value.type || '')
}

export function getDealStatusColor(value) {
  return value && typeof value === 'object' && typeof value.color === 'string'
    ? value.color
    : null
}
