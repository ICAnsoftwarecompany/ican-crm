import { useTranslation } from 'react-i18next'
import { BookOpen, MousePointerClick } from 'lucide-react'
import { useActiveHelp } from './HelpTip'

/**
 * Side panel of the tutorial mode: what this step is for, what to do in it, and the explanation of the field the
 * user is pointing at (from HelpField). Copy: `catalogSetup.typeWizard.steps.<step>.guide.*`.
 */
export function TutorialPanel({ step }) {
  const { t } = useTranslation()
  const active = useActiveHelp()
  const rawPoints = t(`catalogSetup.typeWizard.steps.${step}.guide.points`, { returnObjects: true })
  const points = rawPoints && typeof rawPoints === 'object' ? Object.values(rawPoints) : []

  return (
    <aside className="space-y-3 lg:sticky lg:top-4" aria-label={t('catalogSetup.typeWizard.tutorial.panelLabel')}>
      <section className="rounded-lg border border-[var(--ai-border)] bg-[var(--ai-bg)] p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--ai-text)]">
          <BookOpen size={16} aria-hidden="true" />
          {t(`catalogSetup.typeWizard.steps.${step}.guide.title`)}
        </h3>
        <p className="text-sm leading-6 text-[var(--text)]">{t(`catalogSetup.typeWizard.steps.${step}.guide.text`)}</p>
        {points.length > 0 && (
          <ol className="mt-3 list-decimal space-y-1 ps-5 text-sm leading-6 text-[var(--text)]">
            {points.map((point) => <li key={point}>{point}</li>)}
          </ol>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-live="polite">
        {active ? (
          <>
            <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">{active.title}</h3>
            <p className="text-sm leading-6 text-[var(--text-muted)]">{active.text}</p>
          </>
        ) : (
          <p className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
            <MousePointerClick size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {t('catalogSetup.typeWizard.tutorial.hoverHint')}
          </p>
        )}
      </section>
    </aside>
  )
}
