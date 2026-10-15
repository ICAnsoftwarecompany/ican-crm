import { useTranslation } from 'react-i18next'
import { Lightbulb } from 'lucide-react'

/** "What to do here" for the current step: a short explanation, tips and an example (all from i18n). */
export function StepHelpPanel({ step }) {
  const { t } = useTranslation()
  const tips = t(`salesTeams.builder.steps.${step}.tips`, { returnObjects: true })
  const tipList = tips && typeof tips === 'object' ? Object.values(tips) : []
  const example = t(`salesTeams.builder.steps.${step}.example`, { defaultValue: '' })

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-labelledby="rule-help-title">
      <h3 id="rule-help-title" className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
        <Lightbulb size={16} className="text-amber-600 dark:text-amber-300" aria-hidden="true" />
        {t('salesTeams.builder.helpTitle')}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t(`salesTeams.builder.steps.${step}.help`)}</p>
      {tipList.length > 0 && (
        <ul className="mt-3 grid list-disc gap-1.5 ps-5 text-xs leading-5 text-[var(--text-muted)]">
          {tipList.map((tip) => <li key={tip}>{tip}</li>)}
        </ul>
      )}
      {example && (
        <p className="mt-3 rounded-md bg-[var(--surface-2)] p-2.5 text-xs leading-5 text-[var(--text)]">
          <span className="font-semibold">{t('salesTeams.builder.exampleLabel')}: </span>{example}
        </p>
      )}
    </section>
  )
}
