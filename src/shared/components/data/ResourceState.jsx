import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { EmptyState } from '../feedback/EmptyState'
import { CardSkeleton } from '../feedback/Skeleton'
import { useTranslation } from 'react-i18next'

export function ResourceState({ isLoading, error, empty, emptyIcon, emptyTitle, emptyDescription, onRetry, children }) {
  const { t } = useTranslation()
  if (isLoading) {
    return (
      <div className="grid gap-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle size={24} />}
        title={t('common.loadFailed')}
        description={error?.message || t('common.checkConnection')}
        action={
          onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCcw size={16} />
              {t('common.retry')}
            </Button>
          )
        }
      />
    )
  }

  if (empty) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
  }

  return children
}
