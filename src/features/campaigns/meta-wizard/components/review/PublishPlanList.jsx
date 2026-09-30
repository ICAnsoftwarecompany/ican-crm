import { useTranslation } from 'react-i18next'
import { CheckCircle2, CircleDashed, Clock3, Loader2, XCircle } from 'lucide-react'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { buildPublishPlan } from '../../publish/publishPlan'
import { WIZARD_PUBLISH_CAPABILITIES } from '../../config/wizardCapabilities'
import { getEffectiveAdName, getEffectiveAdSetName, getEffectiveCampaignName } from '../../domain/naming'

/** The ordered publish steps with their live status (also used inside the publish dialog). */
export function PublishPlanList() {
  const { t, i18n } = useTranslation()
  const { state } = useMetaWizard()
  const publish = state.publish
  const steps = buildPublishPlan(state, WIZARD_PUBLISH_CAPABILITIES)

  const labelOf = (step) => {
    if (step.kind === 'campaign') return t('campaignWizard.publish.steps.campaign', { name: getEffectiveCampaignName(state, t) })
    const adSet = state.adSets.find((item) => item.id === step.adSetId)
    if (step.kind === 'adSet') return t('campaignWizard.publish.steps.adSet', { name: getEffectiveAdSetName(adSet, t, i18n.language) })
    const ad = adSet.ads.find((item) => item.id === step.adId)
    return t('campaignWizard.publish.steps.ad', { name: getEffectiveAdName(ad, t) })
  }

  return (
    <ol className="grid gap-1.5">
      {steps.map((step) => {
        const running = publish.currentStepId === step.id
        const failed = publish.failedStepId === step.id
        const Icon = step.done ? CheckCircle2 : running ? Loader2 : failed ? XCircle : step.pendingApi ? Clock3 : CircleDashed
        const color = step.done ? 'text-[var(--notification-success)]' : failed ? 'text-[var(--notification-danger)]' : step.pendingApi ? 'text-[var(--notification-warning)]' : 'text-[var(--text-muted)]'
        return (
          <li key={step.id} className={step.kind === 'ad' ? 'ps-10' : step.kind === 'adSet' ? 'ps-5' : ''}>
            <span className="flex items-start gap-2 text-sm text-[var(--text)]">
              <Icon size={16} className={`mt-0.5 shrink-0 ${color} ${running ? 'animate-spin' : ''}`} />
              <span className="min-w-0">
                {labelOf(step)}
                {step.pendingApi && !step.done && <span className="block text-xs text-[var(--notification-warning)]">{t('campaignWizard.publish.pendingApi')}</span>}
                {failed && publish.lastError?.message && <span className="block text-xs text-[var(--notification-danger)]">{publish.lastError.message}</span>}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
