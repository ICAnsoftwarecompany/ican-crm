import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

/**
 * Renders whenever a saved node's `data.type` no longer resolves in the
 * current nodeRegistry (a module was disabled, a node type was renamed/
 * removed, or the flow is simply old). This is the whole reason saved
 * flows never crash the canvas — see docs "Unknown Nodes".
 */
function UnknownNodeComponent({ data, selected }) {
  const { t } = useTranslation()
  return (
    <div className={`w-56 rounded-xl border-2 border-dashed bg-amber-50 p-3 shadow-sm ${selected ? 'border-amber-500' : 'border-amber-300'}`}>
      <Handle id="input" type="target" position={Position.Top} className="!h-2.5 !w-2.5 !border-2 !border-[var(--surface)] !bg-amber-500" />
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="shrink-0 text-amber-600" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-amber-800">{t('visualFlow.unknownNode.title')}</p>
          <p className="truncate text-xs text-amber-700" dir="ltr">{data?.type || '—'}</p>
        </div>
      </div>
      <Handle id="output" type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !border-2 !border-[var(--surface)] !bg-amber-500" />
    </div>
  )
}

export const UnknownNode = memo(UnknownNodeComponent)
