import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { FollowUpStepEditor } from './FollowUpStepEditor'

const newStep = (index) => ({ key: `step${index + 1}`, offset: '+7 day', channel: 'call', task_title: { ar: '', en: '' }, checklist: [], outcomes: ['satisfied', 'issue_found', 'no_answer'], on_outcome: {} })
const clean = (step) => Object.fromEntries(Object.entries(step).filter(([key]) => !key.startsWith('_draft_')))

/** Settings field: the ordered steps of a follow-up program (spec §39.2). */
export function FollowUpStepsField({ label, value = [], onChange, error, ctx }) {
  const { t } = useTranslation()
  const steps = value || []
  const caseTypes = ctx?.setup?.case_types || []
  const update = (index, patch) => onChange(steps.map((step, stepIndex) => (stepIndex === index ? { ...step, ...patch } : step)))
  const move = (index, delta) => {
    const next = [...steps]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    onChange(next)
  }
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <p className="-mt-1 text-xs text-[var(--text-muted)]">{t('service.followUps.stepsHint')}</p>
      {steps.map((step, index) => (
        <FollowUpStepEditor key={index} step={step} index={index} count={steps.length} caseTypes={caseTypes} onChange={(patch) => update(index, patch)} onMove={(delta) => move(index, delta)} onRemove={() => onChange(steps.filter((_, stepIndex) => stepIndex !== index))} />
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange([...steps.map(clean), newStep(steps.length)])}>
        <Plus size={14} aria-hidden="true" />
        {t('service.followUps.addStep')}
      </Button>
      {error && <p className="text-xs text-status-lost">{t('service.followUps.validation.steps')}</p>}
    </fieldset>
  )
}
