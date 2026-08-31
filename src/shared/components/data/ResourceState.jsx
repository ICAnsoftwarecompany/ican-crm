import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { EmptyState } from '../feedback/EmptyState'
import { CardSkeleton } from '../feedback/Skeleton'

export function ResourceState({ isLoading, error, empty, emptyIcon, emptyTitle, emptyDescription, onRetry, children }) {
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
        title="تعذر تحميل البيانات"
        description={error?.message || 'راجع الاتصال وحاول مرة أخرى'}
        action={
          onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCcw size={16} />
              إعادة المحاولة
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
