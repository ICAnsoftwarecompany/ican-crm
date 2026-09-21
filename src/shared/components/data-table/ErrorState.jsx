import { AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { useTranslation } from 'react-i18next'

export function ErrorState({ error, onRetry }) {
  const { t } = useTranslation()
  const message = error?.message || t('dataTable.loadErrorMessage')

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle size={48} className="text-red-500 mb-3" />
      <h3 className="mb-1 font-medium text-[var(--text)]">{t('dataTable.loadError')}</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} size="sm">
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}
