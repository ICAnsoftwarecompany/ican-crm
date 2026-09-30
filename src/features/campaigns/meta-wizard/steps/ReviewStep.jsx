import { useTranslation } from 'react-i18next'
import { ClipboardCheck, ListChecks, Power, Rocket, Route } from 'lucide-react'
import { Callout, ChoiceCard, IssueMessage, SectionCard } from '../components/fields'
import { ReviewSummary } from '../components/review/ReviewSummary'
import { LeadRoutingFields } from '../components/review/LeadRoutingFields'
import { PublishPlanList } from '../components/review/PublishPlanList'
import { useMetaWizard } from '../context/MetaWizardContext'
import { STAGES } from '../state/wizardStages'

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 }

/** Stage 5: full checklist, CRM lead routing, publish status and plan. */
export function ReviewStep({ onEdit, onJumpToIssue }) {
  const { t } = useTranslation()
  const { state, actions, issues } = useMetaWizard()
  const actionable = issues.filter((issue) => issue.severity !== 'info').sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage) || SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  const errors = actionable.filter((issue) => issue.severity === 'error')

  return (
    <div className="grid gap-4">
      <SectionCard icon={ListChecks} title={t('campaignWizard.review.checklistTitle')} description={errors.length ? t('campaignWizard.review.checklistBlocking', { count: errors.length }) : t('campaignWizard.review.checklistReady')}>
        {actionable.length === 0 ? (
          <Callout tone="tip" title={t('campaignWizard.review.allGoodTitle')}>{t('campaignWizard.review.allGoodBody')}</Callout>
        ) : (
          <ul className="grid gap-1">
            {actionable.map((issue) => (
              <li key={issue.id}>
                <button type="button" onClick={() => onJumpToIssue(issue)} className="flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-start hover:bg-[var(--surface-2)]">
                  <span className="mt-0.5 w-24 shrink-0 text-[11px] font-semibold text-[var(--text-light)]">{t(`campaignWizard.stages.${issue.stage}.short`)}</span>
                  <IssueMessage issue={issue} className="flex-1" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard icon={ClipboardCheck} title={t('campaignWizard.review.summaryTitle')} description={t('campaignWizard.review.summaryDescription')}>
        <ReviewSummary onEdit={onEdit} />
      </SectionCard>

      <SectionCard icon={Route} title={t('campaignWizard.review.routingTitle')} description={t('campaignWizard.review.routingDescription')} fieldPath="leadRouting">
        <LeadRoutingFields />
      </SectionCard>

      <SectionCard icon={Power} title={t('campaignWizard.review.statusTitle')} description={t('campaignWizard.review.statusDescription')}>
        <div role="radiogroup" className="grid gap-3 md:grid-cols-2">
          {['PAUSED', 'ACTIVE'].map((status) => (
            <ChoiceCard
              key={status}
              compact
              title={t(`campaignWizard.review.publishStatus.${status}.title`)}
              description={t(`campaignWizard.review.publishStatus.${status}.description`)}
              selected={state.campaign.publishStatus === status}
              onSelect={() => actions.updateCampaign({ publishStatus: status })}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Rocket} title={t('campaignWizard.review.planTitle')} description={t('campaignWizard.review.planDescription')}>
        <PublishPlanList />
      </SectionCard>
    </div>
  )
}
