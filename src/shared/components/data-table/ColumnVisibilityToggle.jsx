import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GripVertical, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

export function ColumnVisibilityToggle({
  columns,
  columnVisibility,
  onToggle,
  onReorder,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [draggedColumnId, setDraggedColumnId] = useState('')
  const [dragOverColumnId, setDragOverColumnId] = useState('')
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const longPressTimerRef = useRef(null)
  const [panelStyle, setPanelStyle] = useState(null)
  const canReorder = typeof onReorder === 'function'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current?.contains(event.target)) return
      if (panelRef.current?.contains(event.target)) return
      setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }

    return undefined
  }, [isOpen])

  useEffect(() => () => {
    window.clearTimeout(longPressTimerRef.current)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    const updatePanelPosition = () => {
      const trigger = triggerRef.current
      if (!trigger || typeof window === 'undefined') return

      const rect = trigger.getBoundingClientRect()
      const width = Math.min(window.innerWidth - 24, 340)
      const left = Math.min(Math.max(rect.right - width, 12), window.innerWidth - width - 12)
      const availableHeight = Math.max(280, window.innerHeight - rect.bottom - 24)

      setPanelStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${left}px`,
        width: `${width}px`,
        maxHeight: `${Math.min(availableHeight, Math.max(420, window.innerHeight * 0.72))}px`,
        zIndex: 9999,
      })
    }

    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)

    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [isOpen])

  const configurableColumns = columns.filter((col) => col.canHide !== false)
  const visibleCount = configurableColumns.filter((col) => columnVisibility[col.id] !== false).length

  const finishDrag = () => {
    window.clearTimeout(longPressTimerRef.current)
    setDraggedColumnId('')
    setDragOverColumnId('')
  }

  const startPointerReorder = (event, columnId) => {
    if (!canReorder) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    window.clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = window.setTimeout(() => {
      setDraggedColumnId(columnId)
      event.currentTarget?.setPointerCapture?.(event.pointerId)
    }, 300)
  }

  const handlePointerMove = (event) => {
    if (!draggedColumnId) return
    event.preventDefault()

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest?.('[data-column-id]')
      ?.getAttribute('data-column-id')

    if (target && target !== draggedColumnId) {
      setDragOverColumnId(target)
    }
  }

  const handlePointerUp = () => {
    window.clearTimeout(longPressTimerRef.current)
    if (canReorder && draggedColumnId && dragOverColumnId && draggedColumnId !== dragOverColumnId) {
      onReorder(draggedColumnId, dragOverColumnId)
    }
    finishDrag()
  }

  const handleDragStart = (event, columnId) => {
    if (!canReorder) return
    setDraggedColumnId(columnId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', columnId)
  }

  const handleDragOver = (event, columnId) => {
    if (!canReorder || !draggedColumnId || draggedColumnId === columnId) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverColumnId(columnId)
  }

  const handleDrop = (event, targetColumnId) => {
    event.preventDefault()
    const sourceColumnId = event.dataTransfer.getData('text/plain') || draggedColumnId
    if (canReorder && sourceColumnId && targetColumnId && sourceColumnId !== targetColumnId) {
      onReorder(sourceColumnId, targetColumnId)
    }
    finishDrag()
  }

  const panel = isOpen && typeof document !== 'undefined'
    ? createPortal(
      <div
        ref={panelRef}
        className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        style={panelStyle || { position: 'fixed', top: 0, left: 0, width: 340, maxHeight: 560, zIndex: 9999 }}
      >
        <div className="border-b border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--text-muted)] font-arabic">
          إظهار / إخفاء وترتيب الأعمدة
        </div>

        {canReorder ? (
          <div className="border-b border-[var(--border)] px-3 py-2 text-[11px] font-semibold leading-5 text-[var(--text-muted)]">
          </div>
        ) : null}

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {configurableColumns.map((col) => (
            <div
              key={col.id}
              data-column-id={col.id}
              draggable={canReorder}
              onDragStart={(event) => handleDragStart(event, col.id)}
              onDragOver={(event) => handleDragOver(event, col.id)}
              onDragLeave={() => setDragOverColumnId((current) => (current === col.id ? '' : current))}
              onDrop={(event) => handleDrop(event, col.id)}
              onDragEnd={finishDrag}
              className={[
                'flex min-w-0 items-center gap-2 rounded-lg border p-2 transition-colors',
                draggedColumnId === col.id ? 'border-[#9EDCFF] bg-[#EEF7FF] opacity-70' : 'border-transparent hover:bg-[var(--surface-2)]',
                dragOverColumnId === col.id ? 'border-[#00A3AD] bg-[#E8F9FA]' : '',
                canReorder ? 'cursor-grab active:cursor-grabbing' : '',
              ].join(' ')}
            >
              {canReorder ? (
                <span
                  className="shrink-0 touch-none text-[var(--text-muted)]"
                  aria-hidden="true"
                  onPointerDown={(event) => startPointerReorder(event, col.id)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={finishDrag}
                >
                  <GripVertical size={15} />
                </span>
              ) : null}

              <input
                type="checkbox"
                checked={columnVisibility[col.id] !== false}
                onChange={() => onToggle(col.id)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded"
              />

              <span className="min-w-0 flex-1 truncate text-sm text-[var(--text)] font-arabic">
                {col.header}
              </span>
            </div>
          ))}
        </div>
      </div>,
      document.body
    )
    : null

  return (
    <div className="relative min-w-0" ref={triggerRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="max-w-full gap-2"
      >
        <Settings size={16} />
        الأعمدة ({visibleCount})
      </Button>
      {panel}
    </div>
  )
}
