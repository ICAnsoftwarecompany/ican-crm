import { useTranslation } from 'react-i18next'

export function EmailMessagePreview({ fromMailbox, subject, bodyText }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white" dir="ltr">
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[#5F6368]">
        <p><span className="font-bold">{t('outreachCampaigns.preview.from')}:</span> {fromMailbox || '—'}</p>
        <p className="mt-1"><span className="font-bold">{t('outreachCampaigns.preview.subject')}:</span> {subject || '—'}</p>
      </div>
      <div className="min-h-[120px] whitespace-pre-wrap p-4 text-sm text-[#202124]">
        {bodyText || <span className="text-[#9AA0A6]">{t('outreachCampaigns.preview.emptyMessage')}</span>}
      </div>
    </div>
  )
}
