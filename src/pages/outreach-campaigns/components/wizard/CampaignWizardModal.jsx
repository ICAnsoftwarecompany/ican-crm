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
import { CampaignStageNavigation } from '../../../../features/outreach-campaigns/components/CampaignStageNavigation'

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
export function CampaignWizardModal({ open, onClose, mode = 'create', campaign = null, onSuccess, variant = 'modal', initialChannel = '' }) {
  const { t } = useTranslation()
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState(() => ({ ...createInitialCampaignForm(campaign), channel: campaign?.channel || initialChannel }))
  const [fieldErrors, setFieldErrors] = useState(null)
  const mutations = useOutreachCampaignMutations()

  useEffect(() => {
    if (open) {
      setForm({ ...createInitialCampaignForm(campaign), channel: campaign?.channel || initialChannel })
      setStepIndex(0)
      setFieldErrors(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaign?.id, initialChannel])

  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }))

  const currentStepId = CAMPAIGN_WIZARD_STEPS[stepIndex].id

  const canMoveNext = () => {
    if (currentStepId === 'setup') return Boolean(form.name.trim())
    if (currentStepId === 'audience') return form.audience.customers.length > 0
    if (currentStepId === 'channel') return Boolean(form.channel)
    if (currentStepId === 'content' && form.channel === 'whatsapp') {
      return Boolean(form.content.whatsapp.phoneNumberId && form.content.whatsapp.templateId)
    }
    if (currentStepId === 'content' && form.channel === 'gmail') {
      return Boolean(form.content.gmail.mailboxEmail && form.content.subject.trim() && form.content.message.trim())
    }
    if (currentStepId === 'content' && form.channel === 'messenger') {
      return Boolean(form.content.messenger.externalId && form.content.message.trim())
    }
    if (currentStepId === 'content') return false
    if (currentStepId === 'schedule') return Boolean(form.schedule.date && form.schedule.time)
    return true
  }

  const canAdvance = canMoveNext()

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
      if (variant !== 'page') onClose()
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
        <Button disabled={!canAdvance} onClick={() => setStepIndex((index) => index + 1)}>
          {t('actions.next')}
        </Button>
      ) : (
        <Button onClick={handleSubmit} loading={isSubmitting}>
          {mode === 'edit' ? t('outreachCampaigns.wizard.saveChanges') : t('outreachCampaigns.wizard.launch')}
        </Button>
      )}
    </div>
  )

  const content = (
    <>
      <CampaignStageNavigation steps={CAMPAIGN_WIZARD_STEPS} activeIndex={stepIndex} onSelect={setStepIndex} canAdvance={canAdvance} disabled={isSubmitting} />
      {currentStepId === 'setup' && <CampaignSetupStep form={form} onChange={updateForm} errors={errors} />}
      {currentStepId === 'audience' && <CampaignAudienceStep form={form} onChange={updateForm} />}
      {currentStepId === 'channel' && <CampaignChannelStep form={form} onChange={updateForm} />}
      {currentStepId === 'content' && <CampaignContentStep form={form} onChange={updateForm} />}
      {currentStepId === 'schedule' && <CampaignScheduleStep form={form} onChange={updateForm} errors={errors} />}
      {currentStepId === 'team' && <CampaignTeamStep form={form} onChange={updateForm} />}
      {currentStepId === 'review' && <CampaignReviewStep form={form} />}
    </>
  )

  if (variant === 'page') {
    return <div className="flex min-h-[calc(100vh-11rem)] w-full flex-col bg-[var(--surface-2)] p-4 sm:p-6"><div className="space-y-6 bg-[var(--surface)] p-4 sm:p-6">{content}</div><div className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] p-4">{footer}</div></div>
  }

  return (
    <AppModal
      isOpen={open}
      onClose={handleClose}
      title={mode === 'edit' ? t('outreachCampaigns.wizard.editTitle') : t('outreachCampaigns.wizard.createTitle')}
      size="lg"
      className="max-w-3xl"
      footer={footer}
    >
      {content}
    </AppModal>
  )
}
