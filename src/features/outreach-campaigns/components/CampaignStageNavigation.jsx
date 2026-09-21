import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'

export function CampaignStageNavigation({ steps, activeIndex, onSelect, canAdvance = false, disabled = false }) {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('outreachCampaigns.navigation.create')} className="overflow-x-auto border-b border-[var(--border)] pb-5">
      <ol className="flex min-w-[700px] items-start">
        {steps.map((step, index) => {
          const isPast = index < activeIndex
          const isCurrent = index === activeIndex
          const isNext = index === activeIndex + 1
          const canSelect = isPast || (isNext && canAdvance)
          return (
            <li key={step.id} className="relative min-w-0 flex-1">
              {index < steps.length - 1 && <span aria-hidden="true" className={cn('absolute top-[15px] start-1/2 h-px w-full', isPast ? 'bg-[#00A8B0]' : 'bg-[var(--border)]')} />}
              <button
                type="button"
                onClick={() => canSelect && onSelect(index)}
                disabled={!canSelect || disabled}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn('relative z-10 flex w-full flex-col items-center gap-2 px-1 text-center', canSelect && !disabled ? 'cursor-pointer hover:text-[#007A80]' : 'cursor-default')}
              >
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold', isCurrent ? 'border-[#00858c] bg-[#00858c] text-white' : isPast ? 'border-[#00A8B0] bg-[var(--surface)] text-[#007A80]' : isNext && canAdvance ? 'border-[#00A8B0] bg-[var(--surface)] text-[#007A80] ring-2 ring-[#00A8B0]/15' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]')}>
                  {isPast ? <Check size={15} /> : index + 1}
                </span>
                <span className={cn('text-xs leading-5', isCurrent ? 'font-bold text-[var(--text)]' : 'text-[var(--text-muted)]')}>{t(step.labelKey)}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
