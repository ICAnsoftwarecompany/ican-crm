import { useTranslation } from 'react-i18next'
import { Lightbulb } from 'lucide-react'

/**
 * "How this step works" for each wizard step (2026-10-16): what the step is, why it matters, what to watch for and a
 * practical example. Keys: `dealWorkspace.wizard.guide.<step>.{title, points.<id>, example}` (ids in WIZARD_GUIDE).
 */
export const WIZARD_GUIDE = {
  pipeline: ['what', 'existing', 'new', 'wonLost', 'later'],
  basics: ['what', 'type', 'period', 'targets', 'owner'],
  products: ['what', 'single', 'units', 'multi', 'later'],
  team: ['what', 'teams', 'users', 'roles', 'notify'],
  source: ['what', 'campaigns', 'free', 'newLeads', 'owner', 'later'],
  review: ['what', 'order', 'retry', 'after'],
}

export function StepGuide({ step }) {
  const { t } = useTranslation()
  const points = WIZARD_GUIDE[step] || []
  return (
    <aside className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('dealWorkspace.wizard.guide.label')}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"><Lightbulb size={15} /></span>
        {t(`dealWorkspace.wizard.guide.${step}.title`)}
      </h3>
      <ul className="space-y-2.5">
        {points.map((id) => (
          <li key={id} className="text-xs leading-5 text-[var(--text-muted)]">
            <span className="block font-semibold text-[var(--text)]">{t(`dealWorkspace.wizard.guide.${step}.points.${id}.title`)}</span>
            {t(`dealWorkspace.wizard.guide.${step}.points.${id}.text`)}
          </li>
        ))}
      </ul>
      <p className="rounded-md bg-[var(--surface-2)] p-2.5 text-xs leading-5 text-[var(--text)]">
        <span className="font-semibold">{t('dealWorkspace.wizard.guide.exampleLabel')} </span>
        {t(`dealWorkspace.wizard.guide.${step}.example`)}
      </p>
    </aside>
  )
}
