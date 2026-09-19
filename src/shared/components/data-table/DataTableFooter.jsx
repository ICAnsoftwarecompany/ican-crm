import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { PAGE_SIZE_OPTIONS } from './constants'
import { useTranslation } from 'react-i18next'

export function DataTableFooter({
  pageIndex,
  pageCount,
  pageSize,
  filteredRowCount,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  canPrevPage,
  canNextPage,
}) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 py-4 sm:flex-row sm:items-center">
      <div className="text-center text-sm text-[var(--text-muted)] font-arabic sm:text-start">
        {filteredRowCount === 0
          ? t('dataTable.noResults')
          : t('dataTable.showRange', { from: pageIndex * pageSize + 1, to: Math.min((pageIndex + 1) * pageSize, filteredRowCount), total: filteredRowCount })}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Select
          value={pageSize.toString()}
          onChange={(value) => onPageSizeChange?.(Number(value))}
          options={PAGE_SIZE_OPTIONS.map((size) => ({
            value: size.toString(),
            label: t('dataTable.perPage', { size }),
          }))}
          className="w-full sm:w-32"
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!canPrevPage}
          className="justify-center gap-1"
        >
          {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {t('dataTable.previous')}
        </Button>

        <div className="whitespace-nowrap px-2 py-1 text-center text-sm text-[var(--text)] font-arabic">
          {t('dataTable.pageOf', { page: pageIndex + 1, total: pageCount })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canNextPage}
          className="justify-center gap-1"
        >
          {t('dataTable.next')}
          {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>
      </div>
    </div>
  )
}
