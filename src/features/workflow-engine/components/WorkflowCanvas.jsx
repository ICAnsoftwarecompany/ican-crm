import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { WorkflowTriggerNode } from '../nodes/WorkflowTriggerNode'
import { WorkflowActionNode } from '../nodes/WorkflowActionNode'
import { WorkflowConditionNode } from '../nodes/WorkflowConditionNode'
import { WorkflowWaitNode } from '../nodes/WorkflowWaitNode'
import { WorkflowEventWaitNode } from '../nodes/WorkflowEventWaitNode'
import { WorkflowEndNode } from '../nodes/WorkflowEndNode'

const BRANCH_LABEL_KEYS = {
  true: 'workflow.builder.branch.true',
  false: 'workflow.builder.branch.false',
  resolved: 'workflow.builder.branch.resolved',
  timeout: 'workflow.builder.branch.timeout',
}

function AddStepButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[#00C2CB] hover:text-[#00C2CB]"
      aria-label={label}
      title={label}
    >
      <Plus size={16} />
    </button>
  )
}

function Connector() {
  return <div className="h-6 w-px bg-[var(--border)]" />
}

function StepChain({ step, anchor, selection, onSelect, onAddStep, onRemoveStep }) {
  const { t } = useTranslation()

  if (!step) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Connector />
        <AddStepButton onClick={() => onAddStep(anchor)} label={t('workflow.builder.addStep')} />
      </div>
    )
  }

  const selected = selection?.kind === 'step' && selection.stepId === step.id
  const commonProps = { selected, onClick: () => onSelect({ kind: 'step', stepId: step.id }), onRemove: () => onRemoveStep(step.id) }

  let card = null
  if (step.type === 'action') card = <WorkflowActionNode step={step} {...commonProps} />
  else if (step.type === 'condition') card = <WorkflowConditionNode step={step} {...commonProps} />
  else if (step.type === 'wait') card = <WorkflowWaitNode step={step} {...commonProps} />
  else if (step.type === 'wait_for_event') card = <WorkflowEventWaitNode step={step} {...commonProps} />
  else if (step.type === 'end') card = <WorkflowEndNode {...commonProps} />

  if (step.type === 'condition' || step.type === 'wait_for_event') {
    const branchKeys = step.type === 'condition' ? ['true', 'false'] : ['resolved', 'timeout']
    return (
      <div className="flex flex-col items-center gap-2">
        <Connector />
        {card}
        <div className="mt-2 flex items-start gap-10">
          {branchKeys.map((branchKey) => (
            <div key={branchKey} className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-black text-[var(--text-muted)]">
                {t(BRANCH_LABEL_KEYS[branchKey])}
              </span>
              <StepChain
                step={step.branches?.[branchKey] || null}
                anchor={{ parent: step.id, slot: branchKey }}
                selection={selection}
                onSelect={onSelect}
                onAddStep={onAddStep}
                onRemoveStep={onRemoveStep}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Connector />
      {card}
      {step.type !== 'end' && (
        <StepChain
          step={step.next || null}
          anchor={{ parent: step.id, slot: 'next' }}
          selection={selection}
          onSelect={onSelect}
          onAddStep={onAddStep}
          onRemoveStep={onRemoveStep}
        />
      )}
    </div>
  )
}

/**
 * Renders the workflow as a step tree (trigger at top, sequential steps
 * below, condition/wait-for-event nodes branching into two columns). This
 * engine represents every workflow as a tree rather than an arbitrary
 * graph — sufficient for every example in the product spec (sequential
 * steps + two-way branches, no merges/loops) — see docs "لماذا Tree
 * وليس Canvas حر".
 */
export function WorkflowCanvas({ workflow, selection, onSelect, onAddStep, onRemoveStep }) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-full flex-col items-center overflow-auto p-6">
      <WorkflowTriggerNode
        trigger={workflow.trigger}
        selected={selection?.kind === 'trigger'}
        onClick={() => onSelect({ kind: 'trigger' })}
      />
      {!workflow.trigger?.definitionId && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">{t('workflow.builder.pickTriggerHint')}</p>
      )}
      <StepChain
        step={workflow.rootStep}
        anchor={{ parent: 'root' }}
        selection={selection}
        onSelect={onSelect}
        onAddStep={onAddStep}
        onRemoveStep={onRemoveStep}
      />
    </div>
  )
}
