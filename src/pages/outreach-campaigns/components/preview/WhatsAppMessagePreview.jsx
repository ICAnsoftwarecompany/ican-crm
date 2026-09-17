import { useTranslation } from 'react-i18next'

/**
 * A visual approximation of a WhatsApp bubble — not a pixel-perfect clone.
 * Updates live as the WhatsApp content step's form changes.
 */
export function WhatsAppMessagePreview({ headerText, bodyText, footerText }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl bg-[#E5DDD5] p-4" dir="ltr">
      <div className="ms-auto max-w-[85%] rounded-lg rounded-tl-none bg-[#DCF8C6] p-3 text-sm shadow-sm">
        {headerText && <p className="mb-1 font-bold text-[#111B21]">{headerText}</p>}
        <p className="whitespace-pre-wrap text-[#111B21]">
          {bodyText || <span className="text-[#667781]">{t('outreachCampaigns.preview.emptyMessage')}</span>}
        </p>
        {footerText && <p className="mt-1 text-xs text-[#667781]">{footerText}</p>}
      </div>
    </div>
  )
}
