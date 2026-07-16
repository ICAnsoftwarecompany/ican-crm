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
  if (pageCount <= 1 && filteredRowCount <= PAGE_SIZE_OPTIONS[0]) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-[var(--text-muted)] font-arabic">
        {filteredRowCount === 0 ? 'لا توجد نتائج' : `عرض ${pageIndex * pageSize + 1} إلى ${Math.min((pageIndex + 1) * pageSize, filteredRowCount)} من ${filteredRowCount}`}
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={pageSize.toString()}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          options={PAGE_SIZE_OPTIONS.map((size) => ({
            value: size.toString(),
            label: `${size} لكل صفحة`,
          }))}
          className="w-32"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!canPrevPage}
          className="gap-1"
        >
          <ChevronLeft size={16} />
          السابق
        </Button>

        <div className="px-3 py-1 text-sm text-[var(--text)] font-arabic">
          {pageIndex + 1} من {pageCount}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canNextPage}
          className="gap-1"
        >
          التالي
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
