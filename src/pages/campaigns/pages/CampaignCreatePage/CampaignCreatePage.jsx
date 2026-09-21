import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCampaignCenter } from '../../../../features/campaigns'
import { useFacebookCampaignMutations } from '../../../../features/campaigns/facebook-campaign'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { Button } from '../../../../shared/components/ui/Button'
import { CampaignUnavailableState } from '../../components/CampaignUnavailableState'
import { CreateWizardHeader } from './CreateWizardHeader'
import { CreateWizardStepper } from './CreateWizardStepper'
import { CreateWizardFooter } from './CreateWizardFooter'
import { GuidePanel } from './components/GuidePanel'
import { ObjectiveStep } from './steps/ObjectiveStep'
import { CampaignSetupStep } from './steps/CampaignSetupStep'
import { NotConfiguredStep } from './steps/NotConfiguredStep'
import { ReviewStep } from './steps/ReviewStep'
import { STAGES } from './state/wizardStages'
import { useCampaignWizardState } from './state/useCampaignWizardState'
import { formatDate } from '../../utils/campaignFormatters'

export function CampaignCreatePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const context = useCampaignCenter()
  const pages = context.integrations.facebook_pages || []
  const mutations = useFacebookCampaignMutations(context)
  const wizard = useCampaignWizardState({
    tenantId: context.tenantId,
    platformId: context.platform?.id,
    accountId: context.accountId,
  })
  const { state } = wizard

  if (!context.provider.configured) return <CampaignUnavailableState reason="unavailable" />
  if (context.connectionStatus !== 'connected') return <CampaignUnavailableState reason="disconnected" />
  if (!context.accountId) return <CampaignUnavailableState reason="noAccount" />

  const onFocusField = (fieldId) => wizard.setFocusedField(fieldId)
  const onBlurField = () => wizard.setFocusedField(null)

  const publishCampaign = async () => {
    if (!state.campaign.name.trim() || !state.campaign.pageId) {
      toast.error(t('campaigns.create.required'))
      return
    }
    try {
      await mutations.create.mutateAsync({
        ad_account_id: context.accountId,
        campaign_name: state.campaign.name,
        page_id: state.campaign.pageId,
        objective: state.objective,
      })
      toast.success(t('campaigns.create.success'))
      wizard.discardDraft()
      navigate(`/campaigns/${context.platform.id}/list`)
    } catch (error) {
      toast.error(extractMessage(error, t('campaigns.create.error')))
    }
  }

  const activeStage = state.meta.currentStage
  const stageIndex = STAGES.indexOf(activeStage)
  const isLastStep = stageIndex === STAGES.length - 1

  const handleContinue = () => {
    if (isLastStep) {
      publishCampaign()
      return
    }
    wizard.setStage(STAGES[stageIndex + 1])
  }

  return (
    <div className="max-w-5xl">
      <CreateWizardHeader
        t={t}
        i18n={i18n}
        platform={context.platform}
        onBack={() => navigate(-1)}
        onSaveDraft={wizard.saveDraftNow}
        lastSavedAt={state.meta.lastSavedAt}
      />

      {wizard.draftPromptOpen && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#00C2CB]/40 bg-[#E8F9FA] p-3">
          <p className="text-sm font-bold text-[#007A80]">
            {t('campaigns.create.draft.resumePrompt', {
              time: formatDate(wizard.draftSavedAt, i18n.language),
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={wizard.discardDraft}>
              {t('campaigns.create.draft.startFresh')}
            </Button>
            <Button size="sm" onClick={wizard.resumeDraft}>
              {t('campaigns.create.draft.resume')}
            </Button>
          </div>
        </div>
      )}

      <CreateWizardStepper t={t} activeStep={activeStage} onSelect={wizard.setStage} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          {activeStage === 'objective' && (
            <ObjectiveStep
              t={t}
              objective={state.objective}
              onChange={wizard.setObjective}
              onFocusField={onFocusField}
              onBlurField={onBlurField}
            />
          )}
          {activeStage === 'campaignSetup' && (
            <CampaignSetupStep
              t={t}
              campaign={state.campaign}
              pages={pages}
              onChangeCampaign={wizard.updateCampaign}
              onFocusField={onFocusField}
              onBlurField={onBlurField}
            />
          )}
          {activeStage === 'adSets' && <NotConfiguredStep t={t} />}
          {activeStage === 'ads' && <NotConfiguredStep t={t} />}
          {activeStage === 'review' && <ReviewStep t={t} state={state} pages={pages} />}
        </div>

        <GuidePanel stage={activeStage} focusedField={state.meta.focusedField} />
      </div>

      <CreateWizardFooter
        t={t}
        isLastStep={isLastStep}
        onCancel={() => navigate(-1)}
        onSaveDraft={wizard.saveDraftNow}
        onContinue={handleContinue}
        submitting={mutations.create.isPending}
      />
    </div>
  )
}
