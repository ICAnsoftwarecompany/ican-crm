/**
 * Mock of the Import Engine (spec §15.1): parse → map columns → dry run (validate without saving) → execute →
 * error file. Pure helpers; the handler applies the result to the collections.
 */

/** RFC-4180-ish CSV parser: quotes, escaped quotes, commas and newlines inside quotes, CRLF. */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const input = String(text || '').replace(/^﻿/, '')
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[index + 1] === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += char
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [headers = [], ...body] = rows.filter((entry) => entry.some((cell) => String(cell).trim() !== ''))
  return { headers: headers.map((header) => header.trim()), rows: body }
}

export const toCsv = (rows) => rows.map((row) => row.map((cell) => { const value = String(cell ?? ''); return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value }).join(',')).join('\r\n')

const PHONE = /^\+?\d{8,15}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const normalizePhone = (value) => String(value || '').replace(/[\s-]/g, '')

function checkValue(field, raw) {
  const value = String(raw ?? '').trim()
  if (!value) return field.required ? { error: 'required' } : { value: null }
  if (field.type === 'number' || field.type === 'money') return Number.isFinite(Number(value)) ? { value: Number(value) } : { error: 'invalid_number' }
  if (field.type === 'date') return DATE.test(value) && !Number.isNaN(Date.parse(value)) ? { value } : { error: 'invalid_date' }
  if (field.type === 'phone') return PHONE.test(normalizePhone(value)) ? { value: normalizePhone(value) } : { error: 'invalid_phone' }
  return { value }
}

/**
 * Validates every row. `lookups`: { findExisting(matchValue), resolve(fieldKey, value) → { value } | { error } }.
 * Returns rows with `action` (create | update) and `errors[{ field, code }]`, plus counts.
 */
export function validateImport({ fields, mapping, headers, rows, mode = 'create', matchKey, lookups }) {
  const columnOf = Object.fromEntries(Object.entries(mapping || {}).filter(([, fieldKey]) => fieldKey).map(([column, fieldKey]) => [fieldKey, headers.indexOf(column)]))
  const seen = new Set()
  const results = rows.map((row, index) => {
    const errors = []
    const values = {}
    fields.forEach((field) => {
      const column = columnOf[field.key]
      if (column == null || column < 0) {
        if (field.required) errors.push({ field: field.key, code: 'not_mapped' })
        return
      }
      const checked = checkValue(field, row[column])
      if (checked.error) return errors.push({ field: field.key, code: checked.error })
      if (checked.value == null) return
      const resolved = lookups.resolve?.(field.key, checked.value)
      if (resolved?.error) return errors.push({ field: field.key, code: resolved.error })
      values[field.key] = resolved ? resolved.value : checked.value
    })
    let action = 'create'
    const matchValue = matchKey ? values[matchKey] : null
    if (matchValue != null) {
      if (seen.has(matchValue)) errors.push({ field: matchKey, code: 'duplicate_in_file' })
      seen.add(matchValue)
      const existing = lookups.findExisting?.(matchValue)
      if (existing) {
        if (mode === 'create') errors.push({ field: matchKey, code: 'already_exists' })
        else action = 'update'
      }
    }
    return { row: index + 2, values, action, errors }
  })
  const valid = results.filter((entry) => !entry.errors.length)
  return {
    results,
    total: results.length,
    valid: valid.length,
    failed: results.length - valid.length,
    to_create: valid.filter((entry) => entry.action === 'create').length,
    to_update: valid.filter((entry) => entry.action === 'update').length,
  }
}

/** Error file: original columns + an "errors" column, only failed rows — fix and re-upload. */
export function buildErrorFile(headers, rows, results, describe = (error) => `${error.field}: ${error.code}`) {
  const failed = results.filter((entry) => entry.errors.length)
  return toCsv([[...headers, 'errors'], ...failed.map((entry) => [...rows[entry.row - 2], entry.errors.map(describe).join('; ')])])
}
