export const TABLE_FORMAT_WILDCARD_VALUE = '__ICAN_DATATABLE_ANY_VALUE__'
export const TABLE_FORMAT_SCOPE_FIELD = '__ican_table_format_scope'
export const TABLE_FORMAT_TABLE_VALUE = 'whole_table'

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/
const FONT_SIZE_RE = /^\d{1,2}px$/

function parseMaybeJson(value, fallback) {
  if (typeof value !== 'string') return value ?? fallback

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function normalizeRuleConditions(conditions) {
  const parsed = parseMaybeJson(conditions, [])
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed?.conditions)) return parsed.conditions
  return []
}

function normalizeRuleStyle(style) {
  const parsed = parseMaybeJson(style, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
}

function normalizeVisibility(visibility) {
  return String(visibility || 'personal').trim().toLowerCase()
}

export function getFormatRuleVisibility(rule) {
  return normalizeVisibility(rule?.visibility)
}

function isRuleActive(rule) {
  const value = rule?.is_active ?? rule?.active ?? true
  if (value === false || value === 0) return false
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized !== '0' && normalized !== 'false'
  }
  return true
}

function getRuleTargetColumn(rule) {
  return rule?.target_column || rule?.targetColumn || rule?.column || null
}

function getNestedValue(obj, path) {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function normalizeFontWeight(value) {
  if (value === 'bold' || value === 700 || value === '700' || value === 600 || value === '600') {
    return 'bold'
  }
  if (value === 'normal' || value === 400 || value === '400' || value === 500 || value === '500') {
    return 'normal'
  }
  return undefined
}

function normalizeFontFamily(value) {
  if (!value) return undefined
  if (value === 'inherit') return 'inherit'
  if (String(value).includes('Cairo')) return 'Cairo, sans-serif'
  if (String(value).includes('Tajawal')) return 'Tajawal, sans-serif'
  if (String(value).includes('Courier') || String(value).includes('monospace')) {
    return "'Courier New', monospace"
  }
  return 'inherit'
}

export function sanitizeRuleStyle(style = {}) {
  const next = {}

  const bg = style.bg || style.bgColor
  const color = style.color || style.textColor
  const fontWeight = normalizeFontWeight(style.fontWeight)
  const fontFamily = normalizeFontFamily(style.fontFamily)

  if (HEX_COLOR_RE.test(bg || '')) next.bg = bg
  if (HEX_COLOR_RE.test(color || '')) next.color = color
  if (FONT_SIZE_RE.test(style.fontSize || '')) next.fontSize = style.fontSize
  if (fontWeight) next.fontWeight = fontWeight
  if (fontFamily) next.fontFamily = fontFamily
  if (style.fontStyle === 'normal' || style.fontStyle === 'italic') next.fontStyle = style.fontStyle
  if (style.textDecoration === 'none' || style.textDecoration === 'underline') {
    next.textDecoration = style.textDecoration
  }

  return next
}

export function serverStyleToLocalStyle(style = {}) {
  const next = {}

  if (style.bg) next.bgColor = style.bg
  if (style.color) next.textColor = style.color
  if (style.fontSize) next.fontSize = style.fontSize
  if (style.fontWeight) next.fontWeight = style.fontWeight === 'bold' ? '700' : '400'
  if (style.fontFamily) next.fontFamily = style.fontFamily
  if (style.fontStyle) next.fontStyle = style.fontStyle
  if (style.textDecoration) next.textDecoration = style.textDecoration

  return next
}

function resolveColumn(columns, field) {
  return columns.find((column) => column.id === field || column.accessor === field)
}

function getRuleFieldValue(row, field, columns) {
  const column = resolveColumn(columns, field)
  const accessor = column?.accessor || field
  return getNestedValue(row, accessor)
}

function compareValues(left, right) {
  if (left === null || left === undefined) return right === null || right === undefined
  return String(left).toLowerCase() === String(right).toLowerCase()
}

export function matchesRuleConditions(row, conditions = [], columns = []) {
  if (!conditions.length) return false

  return conditions.reduce((matches, condition, index) => {
    const value = getRuleFieldValue(row, condition.field, columns)
    let conditionMatches = false

    switch (condition.operator) {
      case 'equals':
        conditionMatches = compareValues(value, condition.value)
        break
      case 'not_equals':
        conditionMatches = !compareValues(value, condition.value)
        break
      case 'greater_than':
        conditionMatches = Number(value) > Number(condition.value)
        break
      case 'less_than':
        conditionMatches = Number(value) < Number(condition.value)
        break
      case 'contains':
        conditionMatches = String(value ?? '').toLowerCase().includes(String(condition.value ?? '').toLowerCase())
        break
      case 'is_empty':
        conditionMatches = value === null || value === undefined || String(value).trim() === ''
        break
      case 'in':
        conditionMatches = Array.isArray(condition.value) && condition.value.some((item) => compareValues(value, item))
        break
      default:
        conditionMatches = false
    }

    if (index === 0) return conditionMatches
    return condition.logic === 'OR' ? matches || conditionMatches : matches && conditionMatches
  }, false)
}

export function getRowFormatCondition(row, columns = []) {
  const candidates = [
    { field: 'id', value: row?.id },
    { field: '_id', value: row?._id },
    { field: 'uuid', value: row?.uuid },
    { field: 'code', value: row?.code },
  ]

  const matched = candidates.find((candidate) => {
    if (candidate.value === null || candidate.value === undefined || candidate.value === '') return false
    return resolveColumn(columns, candidate.field) || row?.[candidate.field] !== undefined
  })

  if (matched) {
    return {
      field: matched.field,
      operator: 'equals',
      value: matched.value,
    }
  }

  return {
    field: '__rowKey',
    operator: 'equals',
    value: row?.__rowKey,
  }
}

export function buildFormatRulePayload({ tableKey, scope, row, columnId, style, visibility = 'personal' }, columns = []) {
  const payload = {
    table_key: tableKey,
    scope,
    conditions: [],
    style: sanitizeRuleStyle(style),
    visibility,
    priority: 0,
    is_active: true,
  }

  if (scope === 'cell' || scope === 'column') {
    payload.target_column = columnId
  }

  if (scope === 'column') {
    payload.conditions = [
      {
        field: columnId,
        operator: 'not_equals',
        value: TABLE_FORMAT_WILDCARD_VALUE,
      },
    ]
  } else {
    payload.conditions = [getRowFormatCondition(row, columns)]
  }

  return payload
}

export function buildWholeTableFormatRulePayload({ tableKey, style, visibility = 'personal' }) {
  return {
    table_key: tableKey,
    scope: 'row',
    conditions: [
      {
        field: TABLE_FORMAT_SCOPE_FIELD,
        operator: 'equals',
        value: TABLE_FORMAT_TABLE_VALUE,
      },
    ],
    style: sanitizeRuleStyle(style),
    visibility,
    priority: 0,
    is_active: true,
  }
}

export function isWholeTableFormatRule(rule) {
  const condition = normalizeRuleConditions(rule?.conditions)?.[0]

  return (
    rule?.scope === 'row' &&
    condition?.field === TABLE_FORMAT_SCOPE_FIELD &&
    condition?.operator === 'equals' &&
    condition?.value === TABLE_FORMAT_TABLE_VALUE
  )
}

function sameCondition(left, right) {
  return (
    left?.field === right?.field &&
    left?.operator === right?.operator &&
    String(left?.value ?? '') === String(right?.value ?? '')
  )
}

export function findMatchingFormatRule(rules = [], payload) {
  const targetCondition = payload.conditions?.[0]

  return rules.find((rule) => {
    const ruleCondition = normalizeRuleConditions(rule.conditions)?.[0]
    return (
      rule.scope === payload.scope &&
      normalizeVisibility(rule.visibility) === normalizeVisibility(payload.visibility) &&
      (getRuleTargetColumn(rule) || null) === (payload.target_column || null) &&
      sameCondition(ruleCondition, targetCondition)
    )
  })
}

export function buildStylesFromFormatRules(rules = [], rows = [], columns = [], getRowKey) {
  const rowStyles = {}
  const cellStyles = {}
  const columnStyles = {}
  let tableStyle = {}

  rules
    .filter(isRuleActive)
    .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0))
    .forEach((rule) => {
      const conditions = normalizeRuleConditions(rule.conditions)
      const targetColumn = getRuleTargetColumn(rule)
      const localStyle = serverStyleToLocalStyle(normalizeRuleStyle(rule.style))
      if (!Object.keys(localStyle).length) return

      if (isWholeTableFormatRule(rule)) {
        tableStyle = {
          ...tableStyle,
          ...localStyle,
        }
        return
      }

      if (rule.scope === 'column' && conditions?.[0]?.value === TABLE_FORMAT_WILDCARD_VALUE) {
        columnStyles[targetColumn] = {
          ...(columnStyles[targetColumn] || {}),
          ...localStyle,
        }
        return
      }

      rows.forEach((row, index) => {
        if (!matchesRuleConditions(row, conditions, columns)) return

        const rowKey = getRowKey(row, index)
        if (rule.scope === 'row') {
          rowStyles[rowKey] = {
            ...(rowStyles[rowKey] || {}),
            ...localStyle,
          }
        }

        if (rule.scope === 'cell' || rule.scope === 'column') {
          const cellKey = `${rowKey}::${targetColumn}`
          cellStyles[cellKey] = {
            ...(cellStyles[cellKey] || {}),
            ...localStyle,
          }
        }
      })
    })

  return { rowStyles, cellStyles, columnStyles, tableStyle }
}
