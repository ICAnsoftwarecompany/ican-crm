const FIXED_COLUMN_IDS = new Set(['__select', '__serial'])

const PRIMARY_SPLIT_COLUMN_PRIORITIES = [
  { score: 120, patterns: ['lead_name', 'customer_name', 'client_name', 'name', 'الاسم', 'اسم'] },
  { score: 110, patterns: ['lead_id', 'customer_code', 'code', 'id', 'كود'] },
  { score: 100, patterns: ['status_type_id', 'status', 'الحالة'] },
  { score: 90, patterns: ['phone', 'mobile', 'الهاتف', 'تليفون'] },
  { score: 85, patterns: ['email', 'mail', 'البريد'] },
  { score: 80, patterns: ['company', 'الشركة'] },
  { score: 70, patterns: ['type', 'lead_type', 'النوع'] },
]

function getSplitColumnPriority(column) {
  const text = [column?.id, column?.accessor, column?.header]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const match = PRIMARY_SPLIT_COLUMN_PRIORITIES.find((item) => (
    item.patterns.some((pattern) => text.includes(pattern.toLowerCase()))
  ))

  return match?.score || 0
}

function buildSlots(primaryColumns, secondaryColumns) {
  const slotCount = Math.max(primaryColumns.length, secondaryColumns.length)

  return Array.from({ length: slotCount }, (_, index) => ({
    id: `split-slot-${index}`,
    primaryColumn: primaryColumns[index] || null,
    secondaryColumn: secondaryColumns[index] || null,
  }))
}

export function buildSplitRowsLayout(columns = [], splitRowsConfig = null) {
  const fixedColumns = columns.filter((column) => FIXED_COLUMN_IDS.has(column.id))
  const dataColumns = columns.filter((column) => !FIXED_COLUMN_IDS.has(column.id))
  const configuredPrimaryIds = Array.isArray(splitRowsConfig?.primaryColumnIds)
    ? splitRowsConfig.primaryColumnIds
    : []
  const configuredPrimaryIdSet = new Set(configuredPrimaryIds)

  if (configuredPrimaryIds.length > 0) {
    const primaryColumns = dataColumns.filter((column) => configuredPrimaryIdSet.has(column.id))

    if (primaryColumns.length > 0) {
      const secondaryColumns = dataColumns.filter((column) => !configuredPrimaryIdSet.has(column.id))

      return {
        fixedColumns,
        dataColumns,
        primaryColumns,
        secondaryColumns,
        primaryColumnIds: new Set(primaryColumns.map((column) => column.id)),
        slots: buildSlots(primaryColumns, secondaryColumns),
      }
    }
  }

  const midpoint = Math.ceil(dataColumns.length / 2)
  const primaryIndexes = new Set(dataColumns.slice(0, midpoint).map((_, index) => index))

  dataColumns.forEach((column, columnIndex) => {
    if (primaryIndexes.has(columnIndex)) return

    const candidatePriority = getSplitColumnPriority(column)
    if (candidatePriority <= 0) return

    const replaceableIndex = Array.from(primaryIndexes)
      .sort((leftIndex, rightIndex) => {
        const leftPriority = getSplitColumnPriority(dataColumns[leftIndex])
        const rightPriority = getSplitColumnPriority(dataColumns[rightIndex])
        if (leftPriority !== rightPriority) return leftPriority - rightPriority
        return rightIndex - leftIndex
      })
      .find((primaryIndex) => getSplitColumnPriority(dataColumns[primaryIndex]) < candidatePriority)

    if (replaceableIndex === undefined) return

    primaryIndexes.delete(replaceableIndex)
    primaryIndexes.add(columnIndex)
  })

  const primaryColumns = dataColumns.filter((_, index) => primaryIndexes.has(index))
  const secondaryColumns = dataColumns.filter((_, index) => !primaryIndexes.has(index))

  return {
    fixedColumns,
    dataColumns,
    primaryColumns,
    secondaryColumns,
    primaryColumnIds: new Set(primaryColumns.map((column) => column.id)),
    slots: buildSlots(primaryColumns, secondaryColumns),
  }
}
