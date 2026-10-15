import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Info } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { ASSIGN_TYPES } from '../utils/ruleModel'
import { ASSIGN_TYPE_ICONS } from './AssignTypePicker'

/** Collapsible "how distribution works": matching, priority and the four assign types. */
export function RulesGuide() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center gap-2 px-4 py-3 text-start">
        <Info size={16} className="shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold text-[var(--text)]">{t('salesTeams.guide.title')}</span>
        <ChevronDown size={16} className={cn('shrink-0 text-[var(--text-muted)] transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <div className="grid gap-3 border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]">
          <ol className="grid list-decimal gap-1 ps-5 leading-6">
            <li>{t('salesTeams.guide.step1')}</li>
            <li>{t('salesTeams.guide.step2')}</li>
            <li>{t('salesTeams.guide.step3')}</li>
          </ol>
          <div className="grid gap-2 sm:grid-cols-2">
            {ASSIGN_TYPES.map((type) => {
              const Icon = ASSIGN_TYPE_ICONS[type]
              return (
                <div key={type} className="flex items-start gap-2 rounded-lg bg-[var(--surface-2)] p-2.5">
                  <Icon size={15} className="mt-0.5 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block font-semibold text-[var(--text)]">{t(`salesTeams.assignTypes.${type}.label`)}</span>
                    <span className="block text-xs leading-5">{t(`salesTeams.assignTypes.${type}.description`)}</span>
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs">{t('salesTeams.guide.backendNote')}</p>
        </div>
      )}
    </div>
  )
}
