import { useMemo } from 'react'
import { cn } from '../../utils/cn'
import { usePipelineDragDrop } from './usePipelineDragDrop'

function matches(value, expected) {
  return String(value ?? '') === String(expected ?? '')
}

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
}) {
  const lanes = groupBy?.lanes?.length ? groupBy.lanes : [{ id: null, label: null }]
  const { draggableProps, dropZoneProps, isDropTarget } = usePipelineDragDrop({
    isInteractive,
    onItemMove: (itemId, fromStageId, toStageId, laneId) => {
      const stage = stages.find((entry) => matches(entry.id, toStageId))
      if (stage?.is_won_stage || stage?.is_lost_stage || stage?.is_terminal_won || stage?.is_terminal_lost) {
        return onTerminalStageDrop?.({ itemId, fromStageId, stage, laneId })
      }
      return onItemMove?.(itemId, fromStageId, toStageId, laneId)
    },
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

  return (
    <div className="min-w-0 overflow-auto">
      <div className="grid min-w-max gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(stages.length, 1)}, minmax(260px, 1fr))` }}>
        {lanes.flatMap((lane) => stages.map((stage) => {
          const key = `${lane.id ?? 'all'}:${stage.id}`
          const stageItems = groupedItems.get(key) || []
          return (
            <section
              key={key}
              {...dropZoneProps(stage.id, lane.id)}
              className={cn(
                'min-h-48 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2 transition-colors',
                isDropTarget(stage.id, lane.id) && 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
              )}
            >
              <header className="mb-2 flex items-center gap-2 border-b border-[var(--border)] px-1 pb-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color || 'var(--text-muted)' }} />
                <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--text)]">{stage.label || stage.name}</h3>
                <span className="text-xs font-semibold text-[var(--text-muted)]">{stageItems.length}</span>
              </header>
              {lane.label && <div className="mb-2 text-xs font-semibold text-[var(--text-muted)]">{lane.label}</div>}
              <div className="space-y-2">
                {stageItems.length
                  ? stageItems.map((item) => (
                    <div key={item[itemIdKey]} {...draggableProps(item[itemIdKey], item[itemStageKey])}>
                      {renderCard?.(item, stage, lane)}
                    </div>
                  ))
                  : renderEmpty?.(stage, lane)}
              </div>
            </section>
          )
        }))}
      </div>
    </div>
  )
}
