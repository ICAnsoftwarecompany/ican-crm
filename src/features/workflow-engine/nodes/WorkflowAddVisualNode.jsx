import { Handle, Position } from '@xyflow/react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function WorkflowAddVisualNode() {
  const { t } = useTranslation()
  return (
    <div className="flex w-56 justify-center" title={t('workflow.builder.addStep')}>
      <Handle id="in" type="target" position={Position.Top} className="!h-2 !w-2" />
      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm hover:border-[var(--accent)] hover:text-[var(--accent)]">
        <Plus size={20} aria-label={t('workflow.builder.addStep')} />
      </span>
    </div>
  )
}
