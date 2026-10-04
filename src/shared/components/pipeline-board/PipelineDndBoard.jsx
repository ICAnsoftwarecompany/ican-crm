import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { cn } from '../../utils/cn'
import { PipelineColumn } from './PipelineColumn'
import { startEdgeScroll } from './edgeScroll'

// dnd-kit keeps vertical auto-scroll (inside columns); horizontal is ours (RTL-safe, see edgeScroll.js).
const AUTO_SCROLL = { threshold: { x: 0, y: 0.2 } }

const CLICK_SUPPRESS_MS = 250

function getZoneKey(stageId, laneId) {
  return `${laneId ?? 'all'}:${stageId}`
}

// Drop on the column under the pointer; fall back to overlap when the pointer is between columns.
function collisionDetection(args) {
  const hits = pointerWithin(args)
  return hits.length ? hits : rectIntersection(args)
}

function DroppableColumn({ stage, lane, disabled, ...props }) {
  const { setNodeRef, isOver } = useDroppable({
    id: getZoneKey(stage.id, lane.id),
    data: { stageId: stage.id, laneId: lane.id },
    disabled,
  })
  return <PipelineColumn ref={setNodeRef} stage={stage} lane={lane} isDropTarget={isOver} {...props} />
}

function DraggableItem({ id, itemId, stageId, disabled, lastDropRef, children }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { itemId, fromStageId: stageId },
    disabled,
    attributes: { role: 'group', tabIndex: -1 },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClickCapture={(event) => {
        // The pointer-up that ends a drag must not also open the card.
        if (Date.now() - lastDropRef.current < CLICK_SUPPRESS_MS) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      className={cn('rounded-md transition-opacity [-webkit-touch-callout:none]', isDragging && 'opacity-40')}
    >
      {children}
    </div>
  )
}

/**
 * Board where a card only starts dragging after a long press (mouse or touch), so short
 * clicks, scrolling and text selection keep working. Built on @dnd-kit.
 */
export function PipelineDndBoard({
  stages,
  lanes,
  groupedItems,
  itemIdKey,
  itemStageKey,
  renderCard,
  renderEmpty,
  isInteractive,
  onItemMove,
  gridTemplateColumns,
  columnWidth,
  columnBodyClassName,
  pressDelay = 250,
  scrollRef,
}) {
  const [activeItem, setActiveItem] = useState(null)
  const dragging = Boolean(activeItem)
  useEffect(() => (dragging ? startEdgeScroll(scrollRef?.current) : undefined), [dragging, scrollRef])
  const lastDropRef = useRef(0)
  const activation = { delay: pressDelay, tolerance: 8 }
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: activation }),
    useSensor(TouchSensor, { activationConstraint: activation })
  )

  const findItem = (itemId) => {
    for (const items of groupedItems.values()) {
      const found = items.find((item) => String(item[itemIdKey]) === String(itemId))
      if (found) return found
    }
    return null
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveItem(null)
    lastDropRef.current = Date.now()
    const target = over?.data?.current
    const source = active?.data?.current
    if (!target || !source || String(target.stageId) === String(source.fromStageId)) return
    onItemMove?.(source.itemId, source.fromStageId, target.stageId, target.laneId)
  }

  const activeStage = activeItem ? stages.find((stage) => String(stage.id) === String(activeItem[itemStageKey])) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      autoScroll={AUTO_SCROLL}
      onDragStart={({ active }) => setActiveItem(findItem(active?.data?.current?.itemId))}
      onDragCancel={() => {
        setActiveItem(null)
        lastDropRef.current = Date.now()
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="grid min-w-max gap-3" style={{ gridTemplateColumns }}>
        {lanes.flatMap((lane) => stages.map((stage) => {
          const key = getZoneKey(stage.id, lane.id)
          const stageItems = groupedItems.get(key) || []
          return (
            <DroppableColumn
              key={key}
              stage={stage}
              lane={lane}
              count={stageItems.length}
              disabled={!isInteractive}
              bodyClassName={columnBodyClassName}
            >
              {stageItems.length
                ? stageItems.map((item) => (
                  <DraggableItem
                    key={item[itemIdKey]}
                    id={`item:${item[itemIdKey]}`}
                    itemId={item[itemIdKey]}
                    stageId={item[itemStageKey]}
                    disabled={!isInteractive}
                    lastDropRef={lastDropRef}
                  >
                    {renderCard?.(item, stage, lane)}
                  </DraggableItem>
                ))
                : renderEmpty?.(stage, lane)}
            </DroppableColumn>
          )
        }))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="rotate-1 cursor-grabbing shadow-xl" style={columnWidth ? { width: columnWidth - 16 } : undefined}>
            {renderCard?.(activeItem, activeStage, null)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
