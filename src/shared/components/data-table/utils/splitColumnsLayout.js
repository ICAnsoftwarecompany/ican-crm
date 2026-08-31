const FIXED_COLUMN_IDS = new Set(['__select', '__serial'])

function getConfiguredRightIds(columns, config) {
  const availableIds = new Set(columns.map((column) => column.id))
  return Array.isArray(config?.rightColumnIds)
    ? config.rightColumnIds.filter((columnId) => availableIds.has(columnId))
    : []
}

export function buildSplitColumnsLayout(columns = [], config = null) {
  const fixedColumns = columns.filter((column) => FIXED_COLUMN_IDS.has(column.id))
  const dataColumns = columns.filter((column) => column?.id && !FIXED_COLUMN_IDS.has(column.id))
  const configuredRightIds = getConfiguredRightIds(dataColumns, config)

  if (configuredRightIds.length > 0) {
    const rightIdSet = new Set(configuredRightIds)
    const rightColumns = dataColumns.filter((column) => rightIdSet.has(column.id))
    const leftColumns = dataColumns.filter((column) => !rightIdSet.has(column.id))

    return {
      fixedColumns,
      dataColumns,
      rightColumns,
      leftColumns,
    }
  }

  const midpoint = Math.ceil(dataColumns.length / 2)

  return {
    fixedColumns,
    dataColumns,
    rightColumns: dataColumns.slice(0, midpoint),
    leftColumns: dataColumns.slice(midpoint),
  }
}

export function normalizeSplitColumnsForTable(columns = []) {
  return columns.map((column) => ({
    ...column,
    _isPinned: false,
    _stickyOffset: null,
  }))
}
