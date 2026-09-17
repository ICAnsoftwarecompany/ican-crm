import { useTranslation } from 'react-i18next'

export function MessengerMessagePreview({ bodyText }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl bg-[#F0F2F5] p-4" dir="ltr">
      <div className="ms-auto max-w-[85%] rounded-2xl bg-[#0A7CFF] p-3 text-sm text-white shadow-sm">
        <p className="whitespace-pre-wrap">
          {bodyText || <span className="text-white/70">{t('outreachCampaigns.preview.emptyMessage')}</span>}
        </p>
      </div>
    </div>
  )
}
