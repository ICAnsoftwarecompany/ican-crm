import { FILTER_OPERATORS } from '../constants'

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = current[keys[i]] || {}
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
}

/**
 * Applies a single filter to a row and returns true if row matches filter
 */
function applyFilterToRow(row, columnId, filter, column) {
  if (!filter || !column) return true

  const value = getNestedValue(row, column.accessor)
  const { type, operator, value: filterValue } = filter

  if (value === null || value === undefined) return false

  switch (type) {
    case 'text':
      return applyTextFilter(value, operator, filterValue)
    case 'select':
      return applySelectFilter(value, operator, filterValue)
    case 'number':
      return applyNumberFilter(value, operator, filterValue)
    case 'date':
      return applyDateFilter(value, operator, filterValue)
    case 'boolean':
      return applyBooleanFilter(value, filterValue)
    default:
      return true
  }
}

function applyTextFilter(value, operator, filterValue) {
  const str = String(value).toLowerCase()
  const filter = String(filterValue || '').toLowerCase()

  switch (operator) {
    case 'contains':
      return str.includes(filter)
    case 'starts_with':
      return str.startsWith(filter)
    case 'ends_with':
      return str.endsWith(filter)
    case 'equals':
      return str === filter
    default:
      return true
  }
}

function applySelectFilter(value, operator, filterValue) {
  const strValue = String(value).toLowerCase()

  switch (operator) {
    case 'equals':
      return strValue === String(filterValue || '').toLowerCase()
    case 'in':
      return Array.isArray(filterValue) &&
        filterValue.map(v => String(v).toLowerCase()).includes(strValue)
    default:
      return true
  }
}

function applyNumberFilter(value, operator, filterValue) {
  const num = Number(value)

  switch (operator) {
    case 'equals':
      return num === Number(filterValue)
    case 'greater_than':
      return num > Number(filterValue)
    case 'less_than':
      return num < Number(filterValue)
    case 'between':
      if (!filterValue || !filterValue.from || !filterValue.to) return true
      return num >= Number(filterValue.from) && num <= Number(filterValue.to)
    default:
      return true
  }
}

function applyDateFilter(value, operator, filterValue) {
  const date = new Date(value)

  switch (operator) {
    case 'equals': {
      const filterDate = new Date(filterValue)
      return date.toDateString() === filterDate.toDateString()
    }
    case 'before':
      return date < new Date(filterValue)
    case 'after':
      return date > new Date(filterValue)
    case 'between':
      if (!filterValue || !filterValue.from || !filterValue.to) return true
      return date >= new Date(filterValue.from) && date <= new Date(filterValue.to)
    default:
      return true
  }
}

function applyBooleanFilter(value, filterValue) {
  return Boolean(value) === Boolean(filterValue)
}

/**
 * Apply all active filters to rows
 * Returns filtered rows that match ALL active filters (AND logic)
 */
export function buildFilterQuery(rows, filters, columns) {
  if (!rows || !filters || Object.keys(filters).length === 0) {
    return rows
  }

  const columnMap = new Map(columns.map(col => [col.id, col]))

  return rows.filter((row) => {
    for (const [columnId, filter] of Object.entries(filters)) {
      const column = columnMap.get(columnId)
      if (!applyFilterToRow(row, columnId, filter, column)) {
        return false
      }
    }
    return true
  })
}

/**
 * Check if a row matches global search and active filters
 * Used for combined filtering when both global and advanced filters are enabled
 */
export function applyAllFilters(row, globalFilter, columnFilters, columns) {
  // Check global search first
  if (globalFilter?.trim()) {
    const term = globalFilter.toLowerCase()
    const searchColumns = columns.filter(c => c.searchable !== false)
    const matchesGlobalSearch = searchColumns.some(col => {
      const value = getNestedValue(row, col.accessor)
      if (value == null) return false
      return String(value).toLowerCase().includes(term)
    })
    if (!matchesGlobalSearch) return false
  }

  // Check column filters
  if (columnFilters && Object.keys(columnFilters).length > 0) {
    return Object.entries(columnFilters).every(([columnId, filter]) => {
      const column = columns.find(c => c.id === columnId)
      return applyFilterToRow(row, columnId, filter, column)
    })
  }

  return true
}
