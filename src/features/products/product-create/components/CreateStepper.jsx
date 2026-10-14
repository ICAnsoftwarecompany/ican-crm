import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'

/** Steps of the product wizard (they follow the item type, see utils/createSteps.js). */
export function CreateStepper({ steps, step, done, onSelect }) {
  const { t } = useTranslation()
  const current = steps.indexOf(step)
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={t('catalog.create.stepsLabel')}>
      {steps.map((id, index) => (
        <li key={id} className="min-w-[140px] flex-1">
          <button
            type="button"
            onClick={() => onSelect(id)}
            aria-current={id === step ? 'step' : undefined}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-start transition-colors',
              id === step ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
            )}
          >
            <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', index < current || done ? 'bg-[var(--brand-accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text)]')}>
              {index < current || done ? <Check size={14} /> : index + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--text)]">{t(`catalog.create.steps.${id}.title`)}</span>
              <span className="block truncate text-xs text-[var(--text-muted)]">{t(`catalog.create.steps.${id}.hint`)}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}
