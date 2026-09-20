import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCampaignCenter } from '../../../../features/campaigns'
import { useFacebookCampaignMutations } from '../../../../features/campaigns/facebook-campaign'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { CampaignUnavailableState } from '../../components/CampaignUnavailableState'
import { CreateWizardHeader } from './CreateWizardHeader'
import { CreateWizardStepper, STEPS } from './CreateWizardStepper'
import { CreateWizardFooter } from './CreateWizardFooter'
import { CampaignStep } from './steps/CampaignStep'
import { NotConfiguredStep } from './steps/NotConfiguredStep'
import { ReviewStep } from './steps/ReviewStep'

export function CampaignCreatePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const context = useCampaignCenter()
  const pages = context.integrations.facebook_pages || []
  const mutations = useFacebookCampaignMutations(context)
  const [form, setForm] = useState({ campaign_name: '', page_id: '', objective: 'OUTCOME_LEADS' })
  const [activeStep, setActiveStep] = useState('campaign')

  if (!context.provider.configured) return <CampaignUnavailableState reason="unavailable" />
  if (context.connectionStatus !== 'connected') return <CampaignUnavailableState reason="disconnected" />
  if (!context.accountId) return <CampaignUnavailableState reason="noAccount" />

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const createCampaign = async () => {
    if (!form.campaign_name.trim() || !form.page_id) {
      toast.error(t('campaigns.create.required'))
      return
    }
    try {
      await mutations.create.mutateAsync({ ad_account_id: context.accountId, ...form })
      toast.success(t('campaigns.create.success'))
      navigate(`/campaigns/${context.platform.id}/list`)
    } catch (error) {
      toast.error(extractMessage(error, t('campaigns.create.error')))
    }
  }

  const stepIndex = STEPS.indexOf(activeStep)
  const isLastStep = stepIndex === STEPS.length - 1

  const handleContinue = () => {
    if (isLastStep) {
      createCampaign()
      return
    }
    setActiveStep(STEPS[stepIndex + 1])
  }

  return (
    <div className="max-w-3xl">
      <CreateWizardHeader
        t={t}
        i18n={i18n}
        platform={context.platform}
        onBack={() => navigate(-1)}
        onSaveDraft={createCampaign}
        savingDraft={mutations.create.isPending}
      />

      <CreateWizardStepper t={t} activeStep={activeStep} onSelect={setActiveStep} />

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
        {activeStep === 'campaign' && <CampaignStep t={t} form={form} onChange={updateField} pages={pages} />}
        {activeStep === 'adSet' && <NotConfiguredStep t={t} />}
        {activeStep === 'audience' && <NotConfiguredStep t={t} />}
        {activeStep === 'creative' && <NotConfiguredStep t={t} />}
        {activeStep === 'review' && <ReviewStep t={t} form={form} pages={pages} />}
      </div>

      <CreateWizardFooter
        t={t}
        isLastStep={isLastStep}
        onCancel={() => navigate(-1)}
        onSaveDraft={createCampaign}
        onContinue={handleContinue}
        savingDraft={mutations.create.isPending}
        submitting={mutations.create.isPending}
      />
    </div>
  )
}
