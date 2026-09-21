import { useState } from 'react'

const TRANSFER_KEY = 'application/x-ican-pipeline-item'

export function usePipelineDragDrop({ onItemMove, isInteractive = true }) {
  const [dropTarget, setDropTarget] = useState(null)

  const getTargetKey = (stageId, laneId) => `${laneId ?? 'all'}:${stageId}`

  const draggableProps = (itemId, fromStageId) => ({
    draggable: isInteractive,
    onDragStart: (event) => {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData(TRANSFER_KEY, JSON.stringify({ itemId, fromStageId }))
    },
  })

  const dropZoneProps = (stageId, laneId) => ({
    onDragOver: (event) => {
      if (!isInteractive) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setDropTarget(getTargetKey(stageId, laneId))
    },
    onDragLeave: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget(null)
    },
    onDrop: async (event) => {
      event.preventDefault()
      setDropTarget(null)
      const raw = event.dataTransfer.getData(TRANSFER_KEY)
      if (!raw) return
      let transfer
      try {
        transfer = JSON.parse(raw)
      } catch {
        return
      }
      const { itemId, fromStageId } = transfer
      if (String(fromStageId) === String(stageId)) return
      await onItemMove?.(itemId, fromStageId, stageId, laneId)
    },
  })

  return { draggableProps, dropZoneProps, isDropTarget: (stageId, laneId) => dropTarget === getTargetKey(stageId, laneId) }
}
