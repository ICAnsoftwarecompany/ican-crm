import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle } from 'lucide-react'

/**
 * The explanation at the top of every stage: what this stage decides, and
 * what the user should have ready before filling it in.
 */
export function StageIntro({ stage, stepNumber, totalSteps, children }) {
  const { t } = useTranslation()
  const needs = ['need1', 'need2', 'need3']
    .map((key) => t(`campaignWizard.stages.${stage}.${key}`, { defaultValue: '' }))
    .filter(Boolean)
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--brand-accent)]">
        {t('campaignWizard.common.stepOf', { current: stepNumber, total: totalSteps })}
      </p>
      <h2 className="mt-1 text-lg font-bold text-[var(--text)]">{t(`campaignWizard.stages.${stage}.title`)}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">{t(`campaignWizard.stages.${stage}.intro`)}</p>
      {needs.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold text-[var(--text)]">{t('campaignWizard.common.youWillNeed')}</p>
          <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
            {needs.map((need) => (
              <li key={need} className="flex items-start gap-2 text-xs leading-5 text-[var(--text-muted)]">
                <Circle size={6} className="mt-2 shrink-0 fill-current" />
                {need}
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </div>
  )
}

export function CompletedMark({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--notification-success)]">
      <CheckCircle2 size={14} />
      {label}
    </span>
  )
}
