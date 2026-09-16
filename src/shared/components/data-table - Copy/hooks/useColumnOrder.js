import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const LOCKED_COLUMN_IDS = new Set(['__select', '__serial'])

function reconcileOrder(columns, storedOrder) {
  const draggableIds = columns
    .filter((column) => !LOCKED_COLUMN_IDS.has(column.id))
    .map((column) => column.id)
  const availableIds = new Set(draggableIds)
  const nextOrder = Array.isArray(storedOrder)
    ? storedOrder.filter((columnId) => availableIds.has(columnId))
    : []

  draggableIds.forEach((columnId) => {
    if (!nextOrder.includes(columnId)) {
      nextOrder.push(columnId)
    }
  })

  return nextOrder
}

function moveColumn(order, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return order

  const sourceIndex = order.indexOf(sourceId)
  const targetIndex = order.indexOf(targetId)

  if (sourceIndex === -1 || targetIndex === -1) return order

  const nextOrder = [...order]
  const [source] = nextOrder.splice(sourceIndex, 1)
  nextOrder.splice(targetIndex, 0, source)

  return nextOrder
}

export function useColumnOrder(columns, tableId = 'default') {
  const [storedOrder, setStoredOrder] = useLocalStorage(`datatable-column-order-${tableId}`, null)

  const columnOrder = useMemo(
    () => reconcileOrder(columns, storedOrder),
    [columns, storedOrder]
  )

  const orderedColumns = useMemo(() => {
    const orderIndex = new Map(columnOrder.map((columnId, index) => [columnId, index]))
    const lockedColumns = columns.filter((column) => LOCKED_COLUMN_IDS.has(column.id))
    const movableColumns = columns
      .filter((column) => !LOCKED_COLUMN_IDS.has(column.id))
      .sort((left, right) => {
        const leftIndex = orderIndex.has(left.id) ? orderIndex.get(left.id) : Number.MAX_SAFE_INTEGER
        const rightIndex = orderIndex.has(right.id) ? orderIndex.get(right.id) : Number.MAX_SAFE_INTEGER
        return leftIndex - rightIndex
      })

    return [...lockedColumns, ...movableColumns]
  }, [columnOrder, columns])

  const reorderColumn = useCallback((sourceId, targetId) => {
    if (LOCKED_COLUMN_IDS.has(sourceId) || LOCKED_COLUMN_IDS.has(targetId)) return

    setStoredOrder((currentOrder) => {
      const reconciledOrder = reconcileOrder(columns, currentOrder)
      return moveColumn(reconciledOrder, sourceId, targetId)
    })
  }, [columns, setStoredOrder])

  const resetColumnOrder = useCallback(() => {
    setStoredOrder(null)
  }, [setStoredOrder])

  return {
    columnOrder,
    orderedColumns,
    reorderColumn,
    resetColumnOrder,
  }
}
