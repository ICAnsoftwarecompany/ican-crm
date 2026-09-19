import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../utils/cn'
import { useTranslation } from 'react-i18next'

export function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  pageSizeOptions = [10, 20, 50],
  className,
}) {
  const { t, i18n } = useTranslation()
  const totalPages = Math.ceil(total / pageSize)
  const canPreviousPage = page > 1
  const canNextPage = page < totalPages

  const handlePageSizeChange = (newSize) => {
    onPageChange({ page: 1, pageSize: newSize })
  }

  if (total === 0) return null

  return (
    <div className={cn(
      'flex items-center justify-between py-4 px-4',
      'border-t border-[var(--border)] mt-4',
      'font-arabic text-sm',
      className
    )}>
      <div className="flex items-center gap-4">
        <span className="text-[var(--text-light)]">
          {t('dataTable.show')}
        </span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className={cn(
            'h-8 px-2 rounded border border-[var(--border)]',
            'bg-[var(--surface)] text-[var(--text)]',
            'text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]'
          )}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-[var(--text-light)]">
          {t('dataTable.ofItems', { total })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[var(--text-light)] px-2">
          {t('dataTable.pageOf', { page, total: totalPages })}
        </span>

        <Button
          size="icon"
          variant="outline"
          onClick={() => onPageChange({ page: page - 1, pageSize })}
          disabled={!canPreviousPage}
          aria-label={t('common.previousPage')}
        >
          {i18n.dir() === 'rtl' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => onPageChange({ page: page + 1, pageSize })}
          disabled={!canNextPage}
          aria-label={t('common.nextPage')}
        >
          {i18n.dir() === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>
      </div>
    </div>
  )
}
