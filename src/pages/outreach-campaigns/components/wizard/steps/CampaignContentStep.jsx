import { useTranslation } from 'react-i18next'
import { WhatsAppCampaignContent } from '../channels/WhatsAppCampaignContent'
import { GmailCampaignContent } from '../channels/GmailCampaignContent'
import { MessengerCampaignContent } from '../channels/MessengerCampaignContent'
import { CampaignAttachments } from '../../CampaignAttachments'
import { getChannelDefinition } from '../../../../../features/outreach-campaigns/config/campaignChannels'

/**
 * Step 4 — Content. Dispatches to the channel-specific content component
 * from the channel registry's capabilities — never a hard-coded
 * `if (channel === 'whatsapp')` chain outside this one dispatch point.
 */
export function CampaignContentStep({ form, onChange }) {
  const { t } = useTranslation()
  const definition = getChannelDefinition(form.channel)

  const updateContent = (patch) => onChange({ content: { ...form.content, ...patch } })

  const addStagedFiles = (files) => onChange({ stagedAttachments: [...form.stagedAttachments, ...files] })
  const removeStagedFile = (index) => onChange({ stagedAttachments: form.stagedAttachments.filter((_, i) => i !== index) })

  if (!definition) {
    return <p className="text-sm text-[var(--text-muted)]">{t('outreachCampaigns.content.pickChannelFirst')}</p>
  }

  return (
    <div className="space-y-6">
      {form.channel === 'whatsapp' && (
        <WhatsAppCampaignContent whatsapp={form.content.whatsapp} onChange={(whatsapp) => updateContent({ whatsapp })} />
      )}

      {form.channel === 'gmail' && (
        <GmailCampaignContent
          gmail={form.content.gmail}
          subject={form.content.subject}
          message={form.content.message}
          onChangeGmail={(gmail) => updateContent({ gmail })}
          onChangeSubject={(subject) => updateContent({ subject })}
          onChangeMessage={(message) => updateContent({ message })}
        />
      )}

      {form.channel === 'messenger' && (
        <MessengerCampaignContent
          messenger={form.content.messenger}
          message={form.content.message}
          onChangeMessenger={(messenger) => updateContent({ messenger })}
          onChangeMessage={(message) => updateContent({ message })}
        />
      )}

      {definition.supportsAttachments && (
        <CampaignAttachments
          mode="staged"
          stagedFiles={form.stagedAttachments}
          onAddStagedFiles={addStagedFiles}
          onRemoveStagedFile={removeStagedFile}
        />
      )}
    </div>
  )
}
