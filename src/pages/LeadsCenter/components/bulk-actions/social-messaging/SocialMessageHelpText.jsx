import { useTranslation } from 'react-i18next'
export function SocialMessageHelpText() {
  const { t } = useTranslation()
  return (
    <div className="text-xs font-semibold text-[var(--text-muted)]">
      {t('customers.socialMessaging.helpText')}
    </div>
  )
}
