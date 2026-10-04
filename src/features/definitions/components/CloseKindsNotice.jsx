import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

/** Statuses settings: warns when the tenant has no sale or no lost status (leads cannot be closed that way). */
export function CloseKindsNotice({ missing = [] }) {
  const { t } = useTranslation()
  if (!missing.length) return null
  return (
    <div role="status" className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <p>{missing.map((kind) => t(`customers.statusReasons.missing.${kind}`)).join(' ')}</p>
    </div>
  )
}
