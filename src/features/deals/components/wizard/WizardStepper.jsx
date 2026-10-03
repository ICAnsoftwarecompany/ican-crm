import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { WIZARD_STEPS, isWizardStepValid } from '../../utils/dealWizard'

/** Numbered steps; a step can be opened when every step before it is valid. */
export function WizardStepper({ step, state, onSelect }) {
  const { t } = useTranslation()
  const current = WIZARD_STEPS.indexOf(step)
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={t('dealWorkspace.wizard.stepsLabel')}>
      {WIZARD_STEPS.map((id, index) => {
        const reachable = WIZARD_STEPS.slice(0, index).every((previous) => isWizardStepValid(previous, state))
        const done = index < current && isWizardStepValid(id, state)
        return (
          <li key={id} className="min-w-[150px] flex-1">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onSelect(id)}
              aria-current={id === step ? 'step' : undefined}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                id === step ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
              )}
            >
              <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', done ? 'bg-[var(--brand-accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text)]')}>
                {done ? <Check size={14} /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[var(--text)]">{t(`dealWorkspace.wizard.steps.${id}.title`)}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">{t(`dealWorkspace.wizard.steps.${id}.hint`)}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
