import { useTranslation } from 'react-i18next'
import { FileWarning, Hourglass } from 'lucide-react'

/** Small "needs attention" markers: missing documents, components waiting on suppliers. */
export function RecordFlags({ counts }) {
  const { t } = useTranslation()
  if (!counts?.documents_missing && !counts?.components_pending) return null
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      {counts.documents_missing > 0 && (
        <span className="inline-flex items-center gap-1 text-sla-at-risk" title={t('service.records.flags.documents', { count: counts.documents_missing })}>
          <FileWarning size={14} aria-hidden="true" />
          <span dir="ltr">{counts.documents_missing}</span>
          <span className="sr-only">{t('service.records.flags.documents', { count: counts.documents_missing })}</span>
        </span>
      )}
      {counts.components_pending > 0 && (
        <span className="inline-flex items-center gap-1 text-status-contacted" title={t('service.records.flags.components', { count: counts.components_pending })}>
          <Hourglass size={14} aria-hidden="true" />
          <span dir="ltr">{counts.components_pending}</span>
          <span className="sr-only">{t('service.records.flags.components', { count: counts.components_pending })}</span>
        </span>
      )}
    </span>
  )
}
