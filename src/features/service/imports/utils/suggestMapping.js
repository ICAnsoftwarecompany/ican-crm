/** Suggest a field for each column by comparing normalized names with field keys and labels. */
const normalize = (value) => String(value || '').toLowerCase().replace(/[\s_\-.()]/g, '')

export function suggestMapping(headers, fields, labelOf) {
  const used = new Set()
  return Object.fromEntries(
    headers.map((header) => {
      const target = normalize(header)
      const match = fields.find((field) => {
        if (used.has(field.key)) return false
        const names = [field.key, field.key.replace(/^data\./, ''), ...labelOf(field)].map(normalize)
        return names.some((name) => name && (name === target || (target.length > 3 && (name.includes(target) || target.includes(name)))))
      })
      if (match) used.add(match.key)
      return [header, match?.key || '']
    })
  )
}
