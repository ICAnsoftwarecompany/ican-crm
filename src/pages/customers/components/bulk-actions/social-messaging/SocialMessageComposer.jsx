import { useTranslation } from 'react-i18next'
export function SocialMessageComposer({ channel, value, onChange }) {
  const { t } = useTranslation()
  return (
    <textarea
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={t('customers.socialMessaging.composerPlaceholder', { channel: channel.label })}
      rows={6}
      className="min-h-28 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
    />
  )
}
