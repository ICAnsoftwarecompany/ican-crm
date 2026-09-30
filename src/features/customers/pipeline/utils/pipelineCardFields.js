import { PIPELINE_CARD_FIELDS } from '../constants'

const FIELD_IDS = new Set(PIPELINE_CARD_FIELDS.map((field) => field.id))

export function getDefaultCardFields() {
  return PIPELINE_CARD_FIELDS.map((field) => ({ id: field.id, visible: field.defaultVisible }))
}

/**
 * Stored settings -> full ordered list. Keeps the stored order and visibility, drops
 * unknown ids and appends fields added after the user saved (with their default visibility).
 */
export function normalizeCardFields(stored) {
  if (!Array.isArray(stored)) return getDefaultCardFields()
  const seen = new Set()
  const fields = stored
    .filter((entry) => entry && FIELD_IDS.has(entry.id) && !seen.has(entry.id) && seen.add(entry.id))
    .map((entry) => ({ id: entry.id, visible: Boolean(entry.visible) }))

  PIPELINE_CARD_FIELDS.forEach((field) => {
    if (!seen.has(field.id)) fields.push({ id: field.id, visible: field.defaultVisible })
  })
  return fields
}

export function toggleCardField(fields, id) {
  return fields.map((field) => (field.id === id ? { ...field, visible: !field.visible } : field))
}

export function moveCardField(fields, id, direction) {
  const index = fields.findIndex((field) => field.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= fields.length) return fields
  const next = [...fields]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
