import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Circle, MoreVertical } from 'lucide-react'
import { useVisualFlowRuntime } from '../VisualFlowProvider'
import { EXECUTION_STATE_TONE } from '../constants/executionStates'
import { DEFAULT_PORT_IDS } from '../constants/defaults'
import { cn } from '../../../utils/cn'

const TONE_CLASSES = {
  neutral: 'border-[var(--border)]',
  info: 'border-[#93C5FD]',
  warning: 'border-[#FCD34D]',
  success: 'border-[#6EE7B7]',
  danger: 'border-[#FCA5A5]',
}

/**
 * The universal node renderer. Nearly every node type in the system — not
 * just generic ones — renders through THIS component; a definition
 * chooses its icon/color/ports/summary via data, not by shipping a new
 * React component (see docs "Node Components" for why Trigger/Action/
 * Condition/Delay/Branch/Data/Group are registry entries, not separate
 * files). Only Start/End/Unknown get their own component because their
 * shape is genuinely different (see StartNode.jsx/EndNode.jsx/UnknownNode.jsx).
 */
function BaseNodeComponent({ id, data, selected }) {
  const { nodeRegistry, capabilities, executionState, resolveIcon } = useVisualFlowRuntime()
  const definition = nodeRegistry?.get(data?.type) || null
  const execution = executionState?.nodes?.[id]
  const tone = capabilities?.showExecutionState && execution?.status ? EXECUTION_STATE_TONE[execution.status] : null

  const Icon = (resolveIcon && definition?.icon && resolveIcon(definition.icon)) || Circle
  const label = data?.label || (definition?.labelKey ? data?.resolvedLabel : null) || definition?.type || 'Node'
  const summary = data?.summary
  const inputs = definition?.ports?.inputs || []
  const outputs = definition?.ports?.outputs || []

  return (
    <div
      className={cn(
        'w-56 rounded-xl border bg-[var(--surface)] shadow-sm transition-shadow',
        selected ? 'ring-2 ring-[#00C2CB]/50 border-[#00C2CB]' : tone ? TONE_CLASSES[tone] : 'border-[var(--border)]',
        capabilities?.canMoveNodes ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      )}
    >
      {inputs.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Top}
          style={{ left: `${((index + 1) / (inputs.length + 1)) * 100}%` }}
          className="!h-2.5 !w-2.5 !border-2 !border-[var(--surface)] !bg-[var(--text-muted)]"
        />
      ))}

      <div className="flex items-center gap-2 p-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: definition?.colorToken ? `var(${definition.colorToken}-tint, var(--surface-2))` : 'var(--surface-2)' }}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[var(--text)]">{label}</p>
          {summary && <p className="truncate text-xs text-[var(--text-muted)]">{summary}</p>}
        </div>
        {data?.onOpenMenu && (
          <button type="button" onClick={() => data.onOpenMenu(id)} className="shrink-0 rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]" aria-label="Node menu">
            <MoreVertical size={14} />
          </button>
        )}
      </div>

      {outputs.length > 1 && (
        <div className="flex justify-around px-3 pb-2 text-[10px] font-bold text-[var(--text-muted)]">
          {outputs.map((port) => (
            <span key={port.id}>{port.labelKey ? data?.portLabels?.[port.id] || port.id : port.id}</span>
          ))}
        </div>
      )}

      {outputs.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Bottom}
          style={{ left: `${((index + 1) / (outputs.length + 1)) * 100}%` }}
          className="!h-2.5 !w-2.5 !border-2 !border-[var(--surface)] !bg-[#00C2CB]"
        />
      ))}
    </div>
  )
}

BaseNodeComponent.defaultPorts = { input: DEFAULT_PORT_IDS.INPUT, output: DEFAULT_PORT_IDS.OUTPUT }

export const BaseNode = memo(BaseNodeComponent)
