import { useMemo, useRef } from 'react'
import { PipelineColumn } from './PipelineColumn'
import { PipelineDndBoard } from './PipelineDndBoard'
import { usePipelineDragDrop } from './usePipelineDragDrop'

function matches(value, expected) {
  return String(value ?? '') === String(expected ?? '')
}

function isTerminalStage(stage) {
  return Boolean(stage?.is_won_stage || stage?.is_lost_stage || stage?.is_terminal_won || stage?.is_terminal_lost)
}

/**
 * Kanban board: one column per stage (optionally repeated per lane).
 *
 * dragMode: 'native' (default) drags immediately with HTML5 drag & drop;
 *           'longPress' starts dragging only after a long press (mouse + touch).
 * columnWidth: fixed column width in px. Without it columns stretch (minmax(260px, 1fr)).
 * wrapColumns: (native mode) no horizontal scroll: columns share the width and wrap to new rows when they do
 *   not fit (at least `minColumnWidth` px each, default 260); the page scrolls vertically.
 * columnBodyClassName: e.g. a max height + overflow-y-auto so each column scrolls on its own.
 */
export function PipelineBoard({
  stages = [],
  items = [],
  itemStageKey = 'stage_id',
  itemIdKey = 'id',
  groupBy = null,
  renderCard,
  renderEmpty,
  onItemMove,
  onTerminalStageDrop,
  isInteractive = true,
  dragMode = 'native',
  columnWidth,
  wrapColumns = false,
  minColumnWidth = 260,
  columnBodyClassName,
  pressDelay,
}) {
  const scrollRef = useRef(null)
  const lanes = useMemo(() => (groupBy?.lanes?.length ? groupBy.lanes : [{ id: null, label: null }]), [groupBy])

  const handleItemMove = (itemId, fromStageId, toStageId, laneId) => {
    const stage = stages.find((entry) => matches(entry.id, toStageId))
    if (isTerminalStage(stage)) {
      return onTerminalStageDrop?.({ itemId, fromStageId, stage, laneId })
    }
    return onItemMove?.(itemId, fromStageId, toStageId, laneId)
  }

  const { draggableProps, dropZoneProps, isDropTarget } = usePipelineDragDrop({
    isInteractive: isInteractive && dragMode === 'native',
    onItemMove: handleItemMove,
  })

  const groupedItems = useMemo(() => {
    const map = new Map()
    lanes.forEach((lane) => stages.forEach((stage) => map.set(`${lane.id ?? 'all'}:${stage.id}`, [])))
    items.forEach((item) => {
      const lane = groupBy ? item[groupBy.key] : null
      const key = `${lane ?? 'all'}:${item[itemStageKey]}`
      if (map.has(key)) map.get(key).push(item)
    })
    return map
  }, [groupBy, itemStageKey, items, lanes, stages])

  const columnCount = Math.max(stages.length, 1)
  const gridTemplateColumns = wrapColumns
    ? `repeat(auto-fit, minmax(min(${minColumnWidth}px, 100%), 1fr))`
    : columnWidth
      ? `repeat(${columnCount}, ${columnWidth}px)`
      : `repeat(${columnCount}, minmax(260px, 1fr))`

  if (dragMode === 'longPress') {
    return (
      <div ref={scrollRef} className="min-w-0 overflow-x-auto pb-2">
        <PipelineDndBoard
          stages={stages}
          lanes={lanes}
          groupedItems={groupedItems}
          itemIdKey={itemIdKey}
          itemStageKey={itemStageKey}
          renderCard={renderCard}
          renderEmpty={renderEmpty}
          isInteractive={isInteractive}
          onItemMove={handleItemMove}
          gridTemplateColumns={gridTemplateColumns}
          columnWidth={columnWidth}
          columnBodyClassName={columnBodyClassName}
          pressDelay={pressDelay}
          scrollRef={scrollRef}
        />
      </div>
    )
  }

  return (
    <div className={wrapColumns ? 'min-w-0' : 'min-w-0 overflow-auto'}>
      <div className={wrapColumns ? 'grid gap-4' : 'grid min-w-max gap-4'} style={{ gridTemplateColumns }}>
        {lanes.flatMap((lane) => stages.map((stage) => {
          const key = `${lane.id ?? 'all'}:${stage.id}`
          const stageItems = groupedItems.get(key) || []
          return (
            <PipelineColumn
              key={key}
              stage={stage}
              lane={lane}
              count={stageItems.length}
              isDropTarget={isDropTarget(stage.id, lane.id)}
              bodyClassName={columnBodyClassName}
              {...dropZoneProps(stage.id, lane.id)}
            >
              {stageItems.length
                ? stageItems.map((item) => (
                  <div key={item[itemIdKey]} {...draggableProps(item[itemIdKey], item[itemStageKey])}>
                    {renderCard?.(item, stage, lane)}
                  </div>
                ))
                : renderEmpty?.(stage, lane)}
            </PipelineColumn>
          )
        }))}
      </div>
    </div>
  )
}
