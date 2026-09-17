import { splitCampaignStartsAt } from '../../../../features/outreach-campaigns/utils/campaignDateTime'

export const CAMPAIGN_WIZARD_STEPS = [
  { id: 'setup', labelKey: 'outreachCampaigns.wizard.steps.setup' },
  { id: 'audience', labelKey: 'outreachCampaigns.wizard.steps.audience' },
  { id: 'channel', labelKey: 'outreachCampaigns.wizard.steps.channel' },
  { id: 'content', labelKey: 'outreachCampaigns.wizard.steps.content' },
  { id: 'schedule', labelKey: 'outreachCampaigns.wizard.steps.schedule' },
  { id: 'team', labelKey: 'outreachCampaigns.wizard.steps.team' },
  { id: 'review', labelKey: 'outreachCampaigns.wizard.steps.review' },
]

export function createInitialCampaignForm(existingCampaign = null) {
  if (!existingCampaign) {
    return {
      name: '',
      objective: '',
      channel: '',
      audience: { customers: [] },
      content: {
        message: '',
        subject: '',
        whatsapp: { phoneNumberId: '', templateId: '', templateGeneral: false, headerParams: [], bodyParams: [] },
        gmail: { mailboxEmail: '' },
        messenger: { externalId: '' },
      },
      schedule: { date: '', time: '' },
      team: { userIds: [] },
      stagedAttachments: [],
    }
  }

  // Edit mode: normalized campaign (see utils/normalizeCampaign.js) → form state.
  const { date, time } = splitCampaignStartsAt(existingCampaign.startsAt)

  return {
    id: existingCampaign.id,
    name: existingCampaign.name || '',
    objective: '',
    channel: existingCampaign.channel || '',
    audience: { customers: existingCampaign.customers || [] },
    content: {
      message: existingCampaign.message || '',
      subject: existingCampaign.subject || '',
      whatsapp: {
        phoneNumberId: existingCampaign.metadata?.phone_number_id || '',
        templateId: existingCampaign.whatsappTemplateId || '',
        templateGeneral: Boolean(existingCampaign.whatsappTemplateGeneral),
        headerParams: existingCampaign.metadata?.template_params?.header || [],
        bodyParams: existingCampaign.metadata?.template_params?.body || [],
      },
      gmail: { mailboxEmail: existingCampaign.metadata?.mailbox_email || '' },
      messenger: { externalId: existingCampaign.externalId || '' },
    },
    schedule: { date, time },
    team: { userIds: (existingCampaign.users || []).map((user) => user?.id ?? user?.user_id ?? user) },
    stagedAttachments: [],
  }
}
