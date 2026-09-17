import { useTranslation } from 'react-i18next'
import { Select } from '../../../../../shared/components/ui/Select'
import { Input } from '../../../../../shared/components/ui/Input'
import { useGmailMailboxes } from '../../../../../features/conversations/hooks/useGmailConversations'
import { EmailMessagePreview } from '../../preview/EmailMessagePreview'

function Textarea({ label, value, onChange, rows = 8 }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium font-arabic text-[var(--text)]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-arabic text-[var(--text)] outline-none focus:ring-2 focus:ring-[#00C2CB]"
      />
    </label>
  )
}

/**
 * Gmail campaign content. There is no Gmail template system in this app
 * (unlike WhatsApp) — a plain subject + body is what the current
 * `gmailApi.sendMessage` / campaign `subject`+`message` fields support.
 */
export function GmailCampaignContent({ gmail = {}, subject, message, onChangeGmail, onChangeSubject, onChangeMessage }) {
  const { t } = useTranslation()
  const mailboxesQuery = useGmailMailboxes()
  const mailboxes = mailboxesQuery.data || []

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Select
          label={t('outreachCampaigns.content.gmail.mailbox')}
          value={gmail.mailboxEmail}
          onChange={(value) => onChangeGmail({ ...gmail, mailboxEmail: value })}
          options={mailboxes.map((mailbox) => ({
            value: mailbox.email || mailbox.mailbox_email,
            label: mailbox.email || mailbox.mailbox_email,
          }))}
          placeholder={mailboxesQuery.isLoading ? t('common.loading') : t('outreachCampaigns.content.gmail.selectMailbox')}
        />
        <Input
          label={t('outreachCampaigns.content.gmail.subject')}
          value={subject || ''}
          onChange={(event) => onChangeSubject(event.target.value)}
        />
        <Textarea
          label={t('outreachCampaigns.content.gmail.body')}
          value={message || ''}
          onChange={onChangeMessage}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">{t('outreachCampaigns.content.preview')}</p>
        <EmailMessagePreview fromMailbox={gmail.mailboxEmail} subject={subject} bodyText={message} />
      </div>
    </div>
  )
}
