import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'

/** Numbered steps; a step opens once every step before it is valid. */
export function RuleBuilderStepper({ steps, current, reachable, onSelect }) {
  const { t } = useTranslation()
  const currentIndex = steps.indexOf(current)

  return (
    <nav aria-label={t('salesTeams.builder.stepsLabel')} className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
      <ol className="flex min-w-max gap-1">
        {steps.map((step, index) => {
          const isCurrent = step === current
          const done = index < currentIndex
          const enabled = reachable.includes(step)
          return (
            <li key={step} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect(step)}
                disabled={!enabled}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-sm transition-colors',
                  isCurrent ? 'bg-[var(--brand-accent-soft)] font-semibold text-[var(--text)]' : 'text-[var(--text-muted)]',
                  enabled && !isCurrent && 'hover:bg-[var(--surface-2)]',
                  !enabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isCurrent && 'bg-[var(--brand-accent)] text-white',
                    done && 'bg-emerald-600 text-white dark:bg-emerald-500',
                    !isCurrent && !done && 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  )}
                >
                  {done ? <Check size={13} aria-hidden="true" /> : index + 1}
                </span>
                <span className="whitespace-nowrap">{t(`salesTeams.builder.steps.${step}.short`)}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
