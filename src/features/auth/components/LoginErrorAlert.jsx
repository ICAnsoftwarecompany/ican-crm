import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { resolveLoginError } from '../utils/loginError'

/** Inline, persistent sign-in error (replaces the old disappearing toast). */
export function LoginErrorAlert({ error }) {
  const { t } = useTranslation()
  if (!error) return null

  const { key, retryAfter } = resolveLoginError(error)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--status-lost)_30%,transparent)] bg-[color-mix(in_srgb,var(--status-lost)_8%,var(--surface))] px-3 py-2.5 text-sm text-[var(--status-lost)]"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span className="font-arabic font-semibold leading-relaxed">{t(key, { seconds: retryAfter })}</span>
    </div>
  )
}
