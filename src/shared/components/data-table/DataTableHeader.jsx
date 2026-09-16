import { ChevronUp, ChevronDown, Lock, LockOpen } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn'

function toExcelColumnLabel(index) {
  let n = index + 1
  let label = ''

  while (n > 0) {
    const remainder = (n - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    n = Math.floor((n - 1) / 26)
  }

  return label
}

export function DataTableHeader({
  columns,
  sorting,
  onSort,
  onPinColumn,
  isPinned,
  onColumnReorder,
  onStartResize,
  selectionState,
  onSelectPage,
  onSelectAllFiltered,
}) {
  const [showSelectMenu, setShowSelectMenu] = useState(false)
  const [draggedColumnId, setDraggedColumnId] = useState(null)
  const [dragOverColumnId, setDragOverColumnId] = useState(null)
  const pageSelectRef = useRef(null)

  const getStickyHeaderStyle = (col) => {
    if (!col._isPinned) return undefined

    return {
      position: 'sticky',
      insetInlineStart: `${Number(col._stickyOffset) || 0}px`,
      zIndex: 30,
      backgroundColor: 'var(--surface-2)',
      boxShadow: '1px 0 0 var(--border)',
    }
  }

  useEffect(() => {
    if (!pageSelectRef.current) return
    pageSelectRef.current.indeterminate = Boolean(selectionState?.somePageSelected)
  }, [selectionState?.somePageSelected])

  return (
    <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
      {columns.map((col, index) => {
        const excelLabel = col._excelLabel || toExcelColumnLabel(index)
        const canMoveColumn = !['__select', '__serial'].includes(col.id)
        const isDragging = draggedColumnId === col.id
        const isDragTarget = dragOverColumnId === col.id && draggedColumnId !== col.id

        if (col.id === '__select') {
          return (
            <th
              key={col.id}
              className={cn(
                'px-2 py-2 text-center align-middle border-e border-[var(--border)] relative',
                col._isPinned && 'sticky'
              )}
              style={getStickyHeaderStyle(col)}
            >
              <div className="flex items-center justify-center gap-1">
                <input
                  ref={pageSelectRef}
                  type="checkbox"
                  checked={Boolean(selectionState?.allPageSelected)}
                  onChange={(e) => onSelectPage?.(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                  title="تحديد عناصر الصفحة الحالية"
                />
                <button
                  type="button"
                  className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text)]"
                  onClick={() => setShowSelectMenu((value) => !value)}
                  title="خيارات التحديد"
                >
                  ▾
                </button>
              </div>

              {showSelectMenu && (
                <div className="absolute top-full start-0 z-50 mt-1 w-56 max-w-[calc(100vw-1.5rem)] bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-1 text-start">
                  <button
                    type="button"
                    className="w-full text-start px-2 py-1.5 text-xs hover:bg-[var(--surface-2)] rounded"
                    onClick={() => {
                      onSelectPage?.(true)
                      setShowSelectMenu(false)
                    }}
                  >
                    تحديد الصفحة الحالية
                  </button>
                  <button
                    type="button"
                    className="w-full text-start px-2 py-1.5 text-xs hover:bg-[var(--surface-2)] rounded"
                    onClick={() => {
                      onSelectAllFiltered?.(true)
                      setShowSelectMenu(false)
                    }}
                  >
                    {selectionState?.hasMoreOnServer ? 'تحديد كل العملاء المحمّلة' : 'تحديد كل العملاء'}
                  </button>
                  <button
                    type="button"
                    className="w-full text-start px-2 py-1.5 text-xs hover:bg-[var(--surface-2)] rounded"
                    onClick={() => {
                      onSelectPage?.(false)
                      setShowSelectMenu(false)
                    }}
                  >
                    إلغاء تحديد الصفحة
                  </button>
                  <button
                    type="button"
                    className="w-full text-start px-2 py-1.5 text-xs hover:bg-[var(--surface-2)] rounded"
                    onClick={() => {
                      onSelectAllFiltered?.(false)
                      setShowSelectMenu(false)
                    }}
                  >
                    {selectionState?.hasMoreOnServer ? 'إلغاء تحديد العملاء المحمّلة' : 'إلغاء تحديد الكل'}
                  </button>
                </div>
              )}
            </th>
          )
        }

        return (
          <th
            key={col.id}
            className={cn(
              'px-3 py-2.5 text-start font-medium text-sm text-[var(--text)] font-arabic',
              'relative group border-e border-[var(--border)]',
              col._isPinned && 'sticky',
              canMoveColumn && 'cursor-grab active:cursor-grabbing',
              col.sortable && 'hover:bg-[var(--surface)]/50 transition-colors',
              isDragging && 'opacity-50',
              isDragTarget && 'bg-[#E8F9FA] ring-2 ring-inset ring-[#00C2CB]/50'
            )}
            style={getStickyHeaderStyle(col)}
            draggable={canMoveColumn}
            onClick={() => col.sortable && onSort?.(col.id)}
            onDragStart={(event) => {
              if (!canMoveColumn) return
              setDraggedColumnId(col.id)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', col.id)
            }}
            onDragOver={(event) => {
              if (!canMoveColumn || !draggedColumnId || draggedColumnId === col.id) return
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              setDragOverColumnId(col.id)
            }}
            onDragLeave={() => {
              if (dragOverColumnId === col.id) {
                setDragOverColumnId(null)
              }
            }}
            onDrop={(event) => {
              if (!canMoveColumn) return
              event.preventDefault()
              const sourceColumnId = event.dataTransfer.getData('text/plain') || draggedColumnId
              onColumnReorder?.(sourceColumnId, col.id)
              setDraggedColumnId(null)
              setDragOverColumnId(null)
            }}
            onDragEnd={() => {
              setDraggedColumnId(null)
              setDragOverColumnId(null)
            }}
            title={canMoveColumn ? 'اسحب لتغيير ترتيب العمود، واضغط للفرز' : undefined}
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              {/* Header label + sort indicator */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="min-w-0">
                  {excelLabel ? (
                    <div className="text-[10px] leading-none text-[var(--text-muted)]/70 font-semibold tracking-wide mb-0.5 select-none">
                      {excelLabel}
                    </div>
                  ) : null}
                  <span className="block truncate">{col.header}</span>
                </div>
                {col.sortable && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {sorting?.column === col.id ? (
                      sorting?.direction === 'asc' ? (
                        <ChevronUp size={14} className="text-[#00C2CB]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#00C2CB]" />
                      )
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>

              {/* Pin/Unpin button (appears on hover) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onPinColumn?.(col.id)
                }}
                className="opacity-100 transition-opacity p-1 hover:bg-[var(--surface)] rounded-md flex-shrink-0 md:opacity-0 md:group-hover:opacity-100"
                title={isPinned?.(col.id) ? 'إلغاء تثبيت العمود' : 'تثبيت العمود'}
                aria-label={isPinned?.(col.id) ? 'Unpin column' : 'Pin column'}
              >
                {isPinned?.(col.id) ? (
                  <Lock size={14} className="text-[#00C2CB]" />
                ) : (
                  <LockOpen size={14} className="text-[#9CA3AF]" />
                )}
              </button>
            </div>

            {/* Resize handle (right edge of header) */}
            <div
              draggable={false}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onStartResize?.(e, col.id)
              }}
              onDoubleClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className={cn(
                'absolute top-0 end-0 w-1 h-full cursor-col-resize group-hover:bg-[#00C2CB]/50 opacity-0 group-hover:opacity-100 transition-all',
                'hover:w-1.5 hover:bg-[#00C2CB]'
              )}
              title="اسحب لتغيير عرض العمود"
              style={{ touchAction: 'none' }}
            />
          </th>
        )
      })}
    </tr>
  )
}
