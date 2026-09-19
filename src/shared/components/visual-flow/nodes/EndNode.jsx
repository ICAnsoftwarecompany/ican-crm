import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Flag } from 'lucide-react'
import { useVisualFlowRuntime } from '../VisualFlowProvider'

function EndNodeComponent({ data, selected }) {
  const { capabilities } = useVisualFlowRuntime()
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 bg-[var(--surface)] shadow-sm ${
        selected ? 'border-[#00C2CB] ring-2 ring-[#00C2CB]/50' : 'border-[var(--border)]'
      } ${capabilities?.canMoveNodes ? 'cursor-grab active:cursor-grabbing' : ''}`}
      title={data?.label}
    >
      <Handle id="input" type="target" position={Position.Top} className="!h-2.5 !w-2.5 !border-2 !border-[var(--surface)] !bg-[var(--text-muted)]" />
      <Flag size={18} className="text-[var(--text-muted)]" />
    </div>
  )
}

export const EndNode = memo(EndNodeComponent)
