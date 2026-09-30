import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, Sparkles, UserPlus, X } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useCaseMutations } from '../../cases/hooks/useCases'
import { useAiAssignment, useAiInsights, useAiMutations } from '../api/aiApi'
import { AiDuplicates } from './AiDuplicates'
import { AiSummary } from './AiSummary'

/**
 * AI assistant on a case (spec §45.2): triage suggestion, summary, possible duplicates and who could take it.
 * Every suggestion needs the agent's click; accept / dismiss is sent back as feedback.
 */
export function AiCasePanel({ caseItem, setup, open }) {
  const { t, i18n } = useTranslation()
  const insights = useAiInsights(caseItem.id, caseItem.version)
  const features = insights.data?.features || {}
  const assignment = useAiAssignment(caseItem.id, open && features.smart_assignment !== false)
  const { update, assign } = useCaseMutations()
  const { feedback } = useAiMutations()
  const [dismissed, setDismissed] = useState(false)
  const base = { caseId: caseItem.id, version: caseItem.version }
  const triage = insights.data?.triage
  const suggestedType = setup?.case_types?.find((type) => type.id === triage?.type_id)
  const showTriage = open && triage?.differs && triage.confidence > 0 && !dismissed

  const acceptTriage = () =>
    update.mutate({ ...base, ...(triage.type_id && { type_id: triage.type_id }), priority: triage.priority }, {
      onSuccess: () => {
        feedback.mutate({ caseId: caseItem.id, feature: 'triage', accepted: true })
        toast.success(t('service.ai.triage.applied'))
      },
    })
  const dismissTriage = () => {
    setDismissed(true)
    feedback.mutate({ caseId: caseItem.id, feature: 'triage', accepted: false })
  }

  if (insights.isLoading || !Object.values(features).some(Boolean)) return null
  return (
    <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.ai.panelTitle')}>
      <header className="grid gap-0.5">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]"><Sparkles size={16} className="text-[var(--ai-color)]" aria-hidden="true" />{t('service.ai.panelTitle')}</h2>
        <p className="text-xs text-[var(--text-muted)]">{t('service.ai.panelHint')}</p>
      </header>

      {showTriage && (
        <div className="grid gap-2 rounded-md border border-[var(--ai-border)] bg-[var(--ai-bg)] p-3">
          <span className="text-xs font-semibold text-[var(--ai-text)]">{t('service.ai.triage.title', { value: Math.round(triage.confidence * 100) })}</span>
          <span className="text-sm text-[var(--text)]">
            {[suggestedType && localizeLabel(suggestedType.label, i18n.language, suggestedType.key), t(`service.cases.priority.${triage.priority}`)].filter(Boolean).join(' · ')}
          </span>
          {triage.reasons.length > 0 && <span className="text-xs text-[var(--text-muted)]">{t('service.ai.because')} <bdi>{triage.reasons.join(', ')}</bdi></span>}
          <div className="flex gap-2">
            <Button size="sm" loading={update.isPending} onClick={acceptTriage}><Check size={14} aria-hidden="true" />{t('service.ai.apply')}</Button>
            <Button size="sm" variant="ghost" onClick={dismissTriage}><X size={14} aria-hidden="true" />{t('service.ai.dismiss')}</Button>
          </div>
        </div>
      )}

      {features.summaries && <AiSummary caseItem={caseItem} />}
      <AiDuplicates caseItem={caseItem} enabled={open && features.duplicates !== false} />

      {open && (assignment.data || []).length > 0 && (
        <div className="grid gap-2">
          <h3 className="text-xs font-semibold text-[var(--text)]">{t('service.ai.assignment.title')}</h3>
          <ul className="grid gap-1.5">
            {assignment.data.map((entry) => (
              <li key={entry.agent.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="grid">
                  <span className="text-[var(--text)]">{entry.agent.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">{entry.reasons.map((reason) => t(`service.ai.assignment.reasons.${reason}`, { count: entry.load })).join(' · ')}</span>
                </span>
                <Button size="sm" variant="outline" disabled={assign.isPending} onClick={() => assign.mutate({ ...base, assignee_id: entry.agent.id }, { onSuccess: () => { feedback.mutate({ caseId: caseItem.id, feature: 'smart_assignment', accepted: true }); toast.success(t('service.ai.assignment.done', { name: entry.agent.name })) } })}>
                  <UserPlus size={14} aria-hidden="true" />
                  {t('service.ai.assignment.assign')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
