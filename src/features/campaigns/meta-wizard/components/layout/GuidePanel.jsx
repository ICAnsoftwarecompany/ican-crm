import { useTranslation } from 'react-i18next'
import { ArrowUpRight, BookOpen, CheckCircle2, Lightbulb } from 'lucide-react'
import { IssueMessage } from '../fields'
import { issuesForStage } from '../../domain/validateWizard'

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 }

/**
 * Always-visible assistant:
 *  1. explains the field the user is on (focus/hover),
 *  2. lists exactly what is still missing in this stage (click to jump),
 *  3. gives the stage's best-practice tips.
 */
export function GuidePanel({ stage, focusedField, issues, onJumpToIssue }) {
  const { t } = useTranslation()
  const fieldTitle = focusedField ? t(`campaignWizard.guide.fields.${focusedField}.title`, { defaultValue: '' }) : ''
  const fieldBody = focusedField ? t(`campaignWizard.guide.fields.${focusedField}.body`, { defaultValue: '' }) : ''
  const stageIssues = issuesForStage(issues, stage)
    .filter((issue) => issue.severity !== 'info' || issue.code === 'adsApiPending' || issue.code === 'leadRoutingRecommended')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  const blocking = stageIssues.filter((issue) => issue.severity === 'error')
  const tips = ['tip1', 'tip2', 'tip3'].map((key) => t(`campaignWizard.stages.${stage}.${key}`, { defaultValue: '' })).filter(Boolean)

  return (
    <aside aria-label={t('campaignWizard.guide.title')} className="grid gap-3 lg:sticky lg:top-3">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--brand-accent)]">
          <BookOpen size={16} />
          {t('campaignWizard.guide.title')}
        </div>
        {fieldTitle || fieldBody ? (
          <div>
            {fieldTitle && <p className="text-sm font-bold text-[var(--text)]">{fieldTitle}</p>}
            {fieldBody && <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{fieldBody}</p>}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--text-muted)]">{t(`campaignWizard.stages.${stage}.guide`)}</p>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-2 text-sm font-bold text-[var(--text)]">
          {blocking.length ? t('campaignWizard.guide.missingTitle', { count: blocking.length }) : t('campaignWizard.guide.checklistTitle')}
        </p>
        {stageIssues.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-[var(--notification-success)]">
            <CheckCircle2 size={16} />
            {t('campaignWizard.guide.stageComplete')}
          </p>
        ) : (
          <ul className="grid gap-1.5">
            {stageIssues.slice(0, 12).map((issue) => (
              <li key={issue.id}>
                <button type="button" onClick={() => onJumpToIssue(issue)} className="group flex w-full items-start gap-1 rounded-md px-1.5 py-1 text-start hover:bg-[var(--surface-2)]">
                  <IssueMessage issue={issue} className="flex-1" />
                  <ArrowUpRight size={13} className="mt-1 shrink-0 text-[var(--text-light)] opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100" />
                </button>
              </li>
            ))}
            {stageIssues.length > 12 && <li className="px-1.5 text-xs text-[var(--text-muted)]">{t('campaignWizard.guide.more', { count: stageIssues.length - 12 })}</li>}
          </ul>
        )}
      </section>

      {tips.length > 0 && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text)]">
            <Lightbulb size={15} className="text-[var(--notification-warning)]" />
            {t('campaignWizard.guide.tipsTitle')}
          </p>
          <ul className="grid gap-2">
            {tips.map((tip) => <li key={tip} className="text-xs leading-5 text-[var(--text-muted)]">{tip}</li>)}
          </ul>
        </section>
      )}
    </aside>
  )
}
