import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'
import { CAMPAIGN_WIZARD_STEPS, createInitialCampaignForm } from './CampaignWizardSteps'
import { CampaignSetupStep } from './steps/CampaignSetupStep'
import { CampaignAudienceStep } from './steps/CampaignAudienceStep'
import { CampaignChannelStep } from './steps/CampaignChannelStep'
import { CampaignContentStep } from './steps/CampaignContentStep'
import { CampaignScheduleStep } from './steps/CampaignScheduleStep'
import { CampaignTeamStep } from './steps/CampaignTeamStep'
import { CampaignReviewStep } from './steps/CampaignReviewStep'
import { campaignFormSchema } from '../../../../features/outreach-campaigns/schemas/campaignSchema'
import { buildCampaignPayload } from '../../../../features/outreach-campaigns/utils/buildCampaignPayload'
import { useOutreachCampaignMutations } from '../../../../features/outreach-campaigns/hooks/useOutreachCampaigns'
import { extractMessage } from '../../../../shared/utils/apiResponse'

function getFieldError(zodError, path) {
  const issue = zodError?.issues?.find((item) => item.path.join('.') === path)
  return issue?.message
}

/**
 * The Campaign Wizard — same component for create and edit (mode prop),
 * per the spec's "no duplicated create/edit forms" rule. Backward
 * navigation never discards entered data (all state lives in `form` for
 * the whole modal lifetime, reset only when the modal is freshly opened).
 */
export function CampaignWizardModal({ open, onClose, mode = 'create', campaign = null, onSuccess }) {
  const { t } = useTranslation()
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState(() => createInitialCampaignForm(campaign))
  const [fieldErrors, setFieldErrors] = useState(null)
  const mutations = useOutreachCampaignMutations()

  useEffect(() => {
    if (open) {
      setForm(createInitialCampaignForm(campaign))
      setStepIndex(0)
      setFieldErrors(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaign?.id])

  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }))

  const currentStepId = CAMPAIGN_WIZARD_STEPS[stepIndex].id

  const canMoveNext = () => {
    if (currentStepId === 'setup') return Boolean(form.name.trim())
    if (currentStepId === 'audience') return form.audience.customers.length > 0
    if (currentStepId === 'channel') return Boolean(form.channel)
    if (currentStepId === 'schedule') return Boolean(form.schedule.date && form.schedule.time)
    return true
  }

  const handleClose = () => {
    if (mutations.createCampaign.isPending || mutations.updateCampaign.isPending) return
    onClose()
  }

  const handleSubmit = async () => {
    const parsed = campaignFormSchema.safeParse(form)
    if (!parsed.success) {
      setFieldErrors(parsed.error)
      const firstIssuePath = parsed.error.issues[0]?.path?.[0]
      const stepForField = {
        name: 'setup',
        channel: 'channel',
        audience: 'audience',
        content: 'content',
        schedule: 'schedule',
      }[firstIssuePath]
      const stepIndexForField = CAMPAIGN_WIZARD_STEPS.findIndex((step) => step.id === (stepForField === 'content' ? 'content' : stepForField))
      if (stepIndexForField >= 0) setStepIndex(stepIndexForField)
      toast.error(t('outreachCampaigns.wizard.fixErrors'))
      return
    }

    setFieldErrors(null)
    const payload = buildCampaignPayload(form)

    try {
      let campaignId = form.id
      if (mode === 'edit' && campaignId) {
        await mutations.updateCampaign.mutateAsync({ campaignId, payload })
      } else {
        const response = await mutations.createCampaign.mutateAsync(payload)
        campaignId = response?.data?.id ?? response?.campaign?.id ?? response?.id ?? null
      }

      if (campaignId && form.stagedAttachments.length > 0) {
        await mutations.addCampaignImages.mutateAsync({ campaignId, payload: { files: form.stagedAttachments } })
      }

      toast.success(mode === 'edit' ? t('outreachCampaigns.wizard.updateSuccess') : t('outreachCampaigns.wizard.createSuccess'))
      onSuccess?.(campaignId)
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('outreachCampaigns.wizard.submitError')))
    }
  }

  const errors = fieldErrors
    ? {
        name: getFieldError(fieldErrors, 'name'),
        date: getFieldError(fieldErrors, 'schedule.date'),
        time: getFieldError(fieldErrors, 'schedule.time'),
      }
    : {}

  const isSubmitting = mutations.createCampaign.isPending || mutations.updateCampaign.isPending || mutations.addCampaignImages.isPending

  const footer = (
    <div className="flex w-full items-center justify-between gap-3">
      <Button variant="ghost" onClick={() => (stepIndex === 0 ? handleClose() : setStepIndex((index) => index - 1))} disabled={isSubmitting}>
        {stepIndex === 0 ? t('actions.cancel') : t('actions.back')}
      </Button>
      {stepIndex < CAMPAIGN_WIZARD_STEPS.length - 1 ? (
        <Button disabled={!canMoveNext()} onClick={() => setStepIndex((index) => index + 1)}>
          {t('actions.next')}
        </Button>
      ) : (
        <Button onClick={handleSubmit} loading={isSubmitting}>
          {mode === 'edit' ? t('outreachCampaigns.wizard.saveChanges') : t('outreachCampaigns.wizard.launch')}
        </Button>
      )}
    </div>
  )

  return (
    <AppModal
      isOpen={open}
      onClose={handleClose}
      title={mode === 'edit' ? t('outreachCampaigns.wizard.editTitle') : t('outreachCampaigns.wizard.createTitle')}
      size="lg"
      className="max-w-3xl"
      footer={footer}
    >
      <div className="mb-6 grid grid-cols-7 gap-1">
        {CAMPAIGN_WIZARD_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`rounded-lg border px-2 py-2 text-center text-[11px] font-black ${
              index <= stepIndex ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]' : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {t(step.labelKey)}
          </div>
        ))}
      </div>

      {currentStepId === 'setup' && <CampaignSetupStep form={form} onChange={updateForm} errors={errors} />}
      {currentStepId === 'audience' && <CampaignAudienceStep form={form} onChange={updateForm} />}
      {currentStepId === 'channel' && <CampaignChannelStep form={form} onChange={updateForm} />}
      {currentStepId === 'content' && <CampaignContentStep form={form} onChange={updateForm} />}
      {currentStepId === 'schedule' && <CampaignScheduleStep form={form} onChange={updateForm} errors={errors} />}
      {currentStepId === 'team' && <CampaignTeamStep form={form} onChange={updateForm} />}
      {currentStepId === 'review' && <CampaignReviewStep form={form} />}
    </AppModal>
  )
}
