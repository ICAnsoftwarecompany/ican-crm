import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { PAGE_SIZE_OPTIONS } from './constants'

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
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 py-4 sm:flex-row sm:items-center">
      <div className="text-center text-sm text-[var(--text-muted)] font-arabic sm:text-start">
        {filteredRowCount === 0 ? 'لا توجد نتائج' : `عرض ${pageIndex * pageSize + 1} إلى ${Math.min((pageIndex + 1) * pageSize, filteredRowCount)} من ${filteredRowCount}`}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Select
          value={pageSize.toString()}
          onChange={(value) => onPageSizeChange?.(Number(value))}
          options={PAGE_SIZE_OPTIONS.map((size) => ({
            value: size.toString(),
            label: `${size} لكل صفحة`,
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
          <ChevronLeft size={16} />
          السابق
        </Button>

        <div className="whitespace-nowrap px-2 py-1 text-center text-sm text-[var(--text)] font-arabic">
          {pageIndex + 1} من {pageCount}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canNextPage}
          className="justify-center gap-1"
        >
          التالي
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
