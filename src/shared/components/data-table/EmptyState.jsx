import { Inbox } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function EmptyState({ message }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox size={38} className="mb-2 text-[var(--text-muted)]" />
      <h3 className="mb-1 font-medium text-[var(--text)]">{message || t('dataTable.empty')}</h3>
      <p className="text-sm text-[var(--text-muted)]">{t('dataTable.emptyHint')}</p>
    </div>
  )
}
