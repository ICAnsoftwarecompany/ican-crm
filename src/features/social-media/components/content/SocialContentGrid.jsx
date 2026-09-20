import { useTranslation } from 'react-i18next'
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react'
import { CardSkeleton } from '../../../../shared/components/feedback/Skeleton'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { Button } from '../../../../shared/components/ui/Button'
import { SocialContentCard } from './SocialContentCard'
import { SocialContentEmptyState } from './SocialContentEmptyState'

/**
 * Responsive: 3-4 cols desktop, 2 cols tablet, 1 col mobile (see docs
 * "Responsive"). Pagination is cursor-based (Previous/Next), never
 * numbered pages — see docs "Facebook Cursor Pagination". Empty state
 * variant is chosen by the caller (no integration / no pages / no content
 * / filters matched nothing all read differently — see docs "Empty States").
 */
export function SocialContentGrid({ items, isLoading, error, onRetry, onOpen, pagination, onNext, onPrevious, emptyVariant = 'noContent' }) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <CardSkeleton key={index} />)}
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle size={24} />}
        title={t('common.loadFailed')}
        description={error?.message || t('common.checkConnection')}
        action={onRetry && <Button variant="outline" onClick={onRetry}><RefreshCcw size={16} />{t('common.retry')}</Button>}
      />
    )
  }

  if (items.length === 0) {
    return <SocialContentEmptyState variant={emptyVariant} />
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((content) => (
          <SocialContentCard key={content.id} content={content} onOpen={onOpen} />
        ))}
      </div>

      {(pagination?.hasNext || pagination?.hasPrevious) && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrevious} disabled={!pagination?.hasPrevious}>
            <ChevronRight size={14} />
            {t('socialMedia.pagination.previous')}
          </Button>
          <Button variant="outline" size="sm" onClick={onNext} disabled={!pagination?.hasNext}>
            {t('socialMedia.pagination.next')}
            <ChevronLeft size={14} />
          </Button>
        </div>
      )}
    </>
  )
}
