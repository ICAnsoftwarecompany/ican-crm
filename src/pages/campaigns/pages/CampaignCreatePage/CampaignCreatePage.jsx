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
import { AdSetsStep } from './steps/AdSetsStep'
import { NotConfiguredStep } from './steps/NotConfiguredStep'
import { ReviewStep } from './steps/ReviewStep'
import { STAGES } from './state/wizardStages'
import { useCampaignWizardState } from './state/useCampaignWizardState'
import { formatDate } from '../../utils/campaignFormatters'
import { toMinorCurrencyUnit } from './utils/campaignMoney'
import { isMetaCampaignObjective } from './config/metaObjectives'
import { isAdSetCompatibleWithObjective } from './config/metaAdSetCompatibility'

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
    if (!isMetaCampaignObjective(state.objective)) {
      toast.error(t('campaigns.create.validation.invalidObjective'))
      return
    }
    if (!state.campaign.name.trim() || !state.campaign.pageId) {
      toast.error(t('campaigns.create.required'))
      return
    }
    const budgetError = getBudgetError(state, t)
    if (budgetError) {
      toast.error(budgetError)
      return
    }
    if (state.adSets.some((adSet) => adSet.name.trim() && !isAdSetCompatibleWithObjective(state.objective, adSet))) {
      toast.error(t('campaigns.create.validation.incompatibleAdSet'))
      return
    }
    const adSetConfigurationError = getAdSetConfigurationError(state, t)
    if (adSetConfigurationError) {
      toast.error(adSetConfigurationError)
      return
    }
    try {
      const campaignHasBudget = state.campaign.budgetLevel === 'campaign' && isPositiveNumber(state.campaign.budgetAmount)
      const campaignUsesBidCap = ['bid_cap', 'cost_cap'].includes(state.campaign.bidStrategy)
      const campaignPayload = compactPayload({
        ad_account_id: context.accountId,
        campaign_name: state.campaign.name,
        page_id: state.campaign.pageId,
        objective: state.objective,
        budget_type: campaignHasBudget ? state.campaign.budgetType : undefined,
        budget_amount: campaignHasBudget ? toMinorCurrencyUnit(state.campaign.budgetAmount) : undefined,
        stop_time: campaignHasBudget && state.campaign.budgetType === 'lifetime' ? state.campaign.schedule.endTime : undefined,
        bid_strategy: campaignHasBudget ? normalizeBidStrategy(state.campaign.bidStrategy) : undefined,
        bid_amount: campaignHasBudget && campaignUsesBidCap && isPositiveNumber(state.campaign.bidAmount) ? toMinorCurrencyUnit(state.campaign.bidAmount) : undefined,
        special_ad_categories: state.campaign.specialAdCategories,
      })
      const response = await mutations.create.mutateAsync(campaignPayload)
      const campaignId = getCreatedCampaignId(response)
      if (!campaignId && state.adSets.some((adSet) => adSet.name.trim())) throw new Error(t('campaigns.create.adSets.missingCampaignId'))

      for (const adSet of state.adSets.filter((item) => item.name.trim())) {
        const adSetHasBudget = state.campaign.budgetLevel === 'adSet' && isPositiveNumber(adSet.budgetAmount)
        const usesBidCap = ['bid_cap', 'cost_cap'].includes(adSet.bidStrategy)
        await mutations.createAdSet.mutateAsync(compactPayload({
          ad_account_id: context.accountId,
          campaign_id: campaignId,
          page_id: state.campaign.pageId,
          adset_name: adSet.name,
          conversion_location: adSet.conversionLocation,
          optimization_goal: adSet.performanceGoal || undefined,
          countries: adSet.audience.countries.length ? adSet.audience.countries : ['EG'],
          age_min: adSet.audience.ageMin,
          age_max: adSet.audience.ageMax,
          pixel_id: adSet.conversionLocation === 'website' && ['OUTCOME_LEADS', 'OUTCOME_SALES'].includes(state.objective) ? adSet.pixelId || undefined : undefined,
          custom_event_type: adSet.conversionLocation === 'website' && ['OUTCOME_LEADS', 'OUTCOME_SALES'].includes(state.objective) ? adSet.customEventType || undefined : undefined,
          whatsapp_phone_number: adSet.conversionLocation === 'whatsapp' ? adSet.whatsappPhoneNumber || undefined : undefined,
          application_id: adSet.conversionLocation === 'app' ? adSet.applicationId || undefined : undefined,
          object_store_url: adSet.conversionLocation === 'app' ? adSet.objectStoreUrl || undefined : undefined,
          frequency_max: state.objective === 'OUTCOME_AWARENESS' ? Number(adSet.frequencyMax) : undefined,
          frequency_interval_days: state.objective === 'OUTCOME_AWARENESS' ? Number(adSet.frequencyIntervalDays) : undefined,
          daily_budget: adSetHasBudget && adSet.budgetType === 'daily' ? toMinorCurrencyUnit(adSet.budgetAmount) : undefined,
          lifetime_budget: adSetHasBudget && adSet.budgetType === 'lifetime' ? toMinorCurrencyUnit(adSet.budgetAmount) : undefined,
          start_time: adSet.schedule.startType === 'scheduled' ? adSet.schedule.startTime : undefined,
          end_time: adSet.schedule.endType === 'scheduled' ? adSet.schedule.endTime : undefined,
          bid_strategy: adSetHasBudget ? normalizeBidStrategy(adSet.bidStrategy) : undefined,
          bid_amount: adSetHasBudget && usesBidCap && adSet.bidAmount ? toMinorCurrencyUnit(adSet.bidAmount) : undefined,
        }))
      }
      toast.success(t('campaigns.create.success'))
      wizard.discardDraft()
      navigate(`/campaigns/${context.platform.id}/list`)
    } catch (error) {
      toast.error(extractValidationMessage(error, t('campaigns.create.error')))
    }
  }

  const activeStage = state.meta.currentStage
  const stageIndex = STAGES.indexOf(activeStage)
  const isLastStep = stageIndex === STAGES.length - 1

  const handleContinue = () => {
    if (activeStage === 'objective' && !isMetaCampaignObjective(state.objective)) {
      toast.error(t('campaigns.create.validation.invalidObjective'))
      return
    }
    if (activeStage === 'campaignSetup' && (!state.campaign.name.trim() || !state.campaign.pageId)) {
      toast.error(t('campaigns.create.required'))
      return
    }
    if (activeStage === 'campaignSetup' && state.campaign.budgetLevel === 'campaign') {
      const budgetError = getBudgetError(state, t)
      if (budgetError) {
        toast.error(budgetError)
        return
      }
    }
    if (activeStage === 'adSets' && state.adSets.some((adSet) => !adSet.name.trim() || !adSet.conversionLocation)) {
      toast.error(t('campaigns.create.adSets.required'))
      return
    }
    if (activeStage === 'adSets' && state.adSets.some((adSet) => !isAdSetCompatibleWithObjective(state.objective, adSet))) {
      toast.error(t('campaigns.create.validation.incompatibleAdSet'))
      return
    }
    if (activeStage === 'adSets') {
      const adSetConfigurationError = getAdSetConfigurationError(state, t)
      if (adSetConfigurationError) {
        toast.error(adSetConfigurationError)
        return
      }
    }
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
          {activeStage === 'adSets' && <AdSetsStep t={t} objective={state.objective} adSets={state.adSets} campaign={state.campaign} onChangeAdSet={wizard.updateAdSet} onFocusField={onFocusField} onBlurField={onBlurField} />}
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
        submitting={mutations.create.isPending || mutations.createAdSet.isPending}
      />
    </div>
  )
}

function compactPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

function normalizeBidStrategy(value) {
  const map = { highest_volume: 'LOWEST_COST_WITHOUT_CAP', bid_cap: 'LOWEST_COST_WITH_BID_CAP', cost_cap: 'COST_CAP' }
  return map[value] || value || undefined
}

function getCreatedCampaignId(response) {
  return response?.data?.campaign_id || response?.data?.id || response?.campaign_id || response?.id || null
}

function isPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0
}

function getBudgetError(state, t) {
  if (state.campaign.budgetLevel === 'campaign') {
    if (!isPositiveNumber(state.campaign.budgetAmount)) return t('campaigns.create.validation.campaignBudgetRequired')
    if (state.campaign.budgetType === 'lifetime' && !state.campaign.schedule.endTime) return t('campaigns.create.validation.lifetimeEndRequired')
  }

  if (state.campaign.budgetLevel === 'adSet') {
    if (state.adSets.some((adSet) => !isPositiveNumber(adSet.budgetAmount))) return t('campaigns.create.validation.adSetBudgetRequired')
    if (state.adSets.some((adSet) => adSet.budgetType === 'lifetime' && !adSet.schedule.endTime)) return t('campaigns.create.validation.lifetimeEndRequired')
  }

  return null
}

function getAdSetConfigurationError(state, t) {
  const configuredAdSets = state.adSets.filter((adSet) => adSet.name.trim())

  if (configuredAdSets.some((adSet) => adSet.conversionLocation === 'whatsapp' && !String(adSet.whatsappPhoneNumber || '').trim())) {
    return t('campaigns.create.validation.whatsappPhoneRequired')
  }
  if (configuredAdSets.some((adSet) => adSet.conversionLocation === 'website' && ['OUTCOME_LEADS', 'OUTCOME_SALES'].includes(state.objective) && (!String(adSet.pixelId || '').trim() || !String(adSet.customEventType || '').trim()))) {
    return t('campaigns.create.validation.websiteConversionRequired')
  }
  if (configuredAdSets.some((adSet) => adSet.conversionLocation === 'app' && (!String(adSet.applicationId || '').trim() || !String(adSet.objectStoreUrl || '').trim()))) {
    return t('campaigns.create.validation.appDetailsRequired')
  }
  if (configuredAdSets.some((adSet) => state.objective === 'OUTCOME_AWARENESS' && (!isPositiveNumber(adSet.frequencyMax) || !isPositiveNumber(adSet.frequencyIntervalDays)))) {
    return t('campaigns.create.validation.frequencyRequired')
  }

  return null
}

function extractValidationMessage(error, fallback) {
  const errors = error?.response?.data?.errors
  const firstError = errors && Object.values(errors).flat().find(Boolean)
  return firstError || extractMessage(error, fallback)
}
