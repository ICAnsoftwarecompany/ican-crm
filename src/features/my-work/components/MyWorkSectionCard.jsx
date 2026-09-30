import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, RefreshCcw } from 'lucide-react'
import { CardSkeleton } from '../../../shared/components/feedback/Skeleton'
import { cn } from '../../../shared/utils/cn'

/**
 * Card shell every My Work section uses: title + count + "view all", and the loading / error /
 * empty states, so each section only renders its rows.
 */
export function MyWorkSectionCard({
  id,
  icon: Icon,
  title,
  count,
  tone = 'default',
  viewAllTo,
  viewAllLabel,
  isLoading = false,
  error = null,
  onRetry,
  empty = false,
  emptyText,
  className,
  children,
}) {
  const { t, i18n } = useTranslation()
  const ArrowIcon = i18n.dir() === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <section
      id={id ? `my-work-${id}` : undefined}
      aria-labelledby={id ? `my-work-${id}-title` : undefined}
      className={cn('flex min-w-0 flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)]', className)}
    >
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && (
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                tone === 'danger'
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
                  : 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
              )}
            >
              <Icon size={16} />
            </span>
          )}
          <h2 id={id ? `my-work-${id}-title` : undefined} className="truncate text-sm font-bold text-[var(--text)]">{title}</h2>
          {typeof count === 'number' && !isLoading && !error && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 font-latin text-xs font-bold',
                tone === 'danger' && count > 0
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
              )}
            >
              {count}
            </span>
          )}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--brand-accent)] hover:underline"
          >
            {viewAllLabel || t('myWork.viewAll')}
            <ArrowIcon size={13} />
          </Link>
        )}
      </header>

      <div className="min-h-0 flex-1 p-2">
        {isLoading ? (
          <div className="p-2"><CardSkeleton /></div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <AlertTriangle size={20} className="text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">{t('myWork.sectionError')}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-2)]"
              >
                <RefreshCcw size={13} />
                {t('common.retry')}
              </button>
            )}
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <p className="text-sm text-[var(--text-muted)]">{emptyText || t('myWork.allClear')}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}
