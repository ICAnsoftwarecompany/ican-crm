import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Play } from 'lucide-react'
import { useVisualFlowRuntime } from '../VisualFlowProvider'

function StartNodeComponent({ data, selected }) {
  const { capabilities } = useVisualFlowRuntime()
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 bg-[var(--surface)] shadow-sm ${
        selected ? 'border-[#00C2CB] ring-2 ring-[#00C2CB]/50' : 'border-[#6EE7B7]'
      } ${capabilities?.canMoveNodes ? 'cursor-grab active:cursor-grabbing' : ''}`}
      title={data?.label}
    >
      <Play size={18} className="text-[#059669]" />
      <Handle id="output" type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !border-2 !border-[var(--surface)] !bg-[#00C2CB]" />
    </div>
  )
}

export const StartNode = memo(StartNodeComponent)
