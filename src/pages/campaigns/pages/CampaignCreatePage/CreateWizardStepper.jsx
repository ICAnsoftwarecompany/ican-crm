import { STAGES } from './state/wizardStages'

export function CreateWizardStepper({ t, activeStep, onSelect }) {
  const activeIndex = STAGES.indexOf(activeStep)

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 overflow-x-auto">
      {STAGES.map((step, index) => {
        const isActive = step === activeStep
        const isReached = index <= activeIndex

        return (
          <div key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(step)}
              disabled={!isReached}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                isActive
                  ? 'border-[#00C2CB] bg-[#00C2CB] text-white'
                  : isReached
                    ? 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-light)] cursor-not-allowed opacity-60'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-latin ${isActive ? 'bg-white/20' : 'bg-[var(--surface-2)]'}`} dir="ltr">
                {index + 1}
              </span>
              {t(`campaigns.create.steps.${step}`)}
            </button>
            {index < STAGES.length - 1 && <div className="h-px w-6 shrink-0 bg-[var(--border)]" />}
          </div>
        )
      })}
    </div>
  )
}
