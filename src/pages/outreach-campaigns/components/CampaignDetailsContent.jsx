import { useTranslation } from 'react-i18next'
import { WhatsAppMessagePreview } from './preview/WhatsAppMessagePreview'
import { EmailMessagePreview } from './preview/EmailMessagePreview'
import { MessengerMessagePreview } from './preview/MessengerMessagePreview'
import { CampaignAttachments } from './CampaignAttachments'
import { useOutreachCampaignMutations } from '../../../features/outreach-campaigns/hooks/useOutreachCampaigns'

export function CampaignDetailsContent({ campaign }) {
  const { t } = useTranslation()
  const mutations = useOutreachCampaignMutations()

  return (
    <div className="space-y-6">
      {campaign.channel === 'whatsapp' && (
        <WhatsAppMessagePreview
          headerText={campaign.metadata?.template_params?.header?.join(' ') || ''}
          bodyText={campaign.message}
          footerText=""
        />
      )}
      {campaign.channel === 'gmail' && (
        <EmailMessagePreview fromMailbox={campaign.metadata?.mailbox_email} subject={campaign.subject} bodyText={campaign.message} />
      )}
      {campaign.channel === 'messenger' && <MessengerMessagePreview bodyText={campaign.message} />}

      <CampaignAttachments
        mode="uploaded"
        uploadedAttachments={campaign.attachments}
        onUploadFiles={(files) => mutations.addCampaignImages.mutate({ campaignId: campaign.id, payload: { files } })}
        onRemoveUploadedAttachment={(attachmentId) =>
          mutations.removeCampaignImages.mutate({ campaignId: campaign.id, attachmentIds: [attachmentId] })
        }
        isUploading={mutations.addCampaignImages.isPending}
        isRemoving={mutations.removeCampaignImages.isPending}
      />

      {!campaign.message && !campaign.subject && (
        <p className="text-sm text-[var(--text-muted)]">{t('outreachCampaigns.content.noContent')}</p>
      )}
    </div>
  )
}
