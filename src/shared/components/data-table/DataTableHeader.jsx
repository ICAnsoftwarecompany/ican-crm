import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export function DataTableHeader({ columns, sorting, onSort }) {
  return (
    <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
      <tr>
        {columns.map((col) => (
          <th
            key={col.id}
            className={cn(
              'px-4 py-3 text-right font-medium text-sm text-[var(--text)] font-arabic',
              col.sortable && 'cursor-pointer hover:bg-[var(--surface)] transition-colors',
              col.width
            )}
            onClick={() => col.sortable && onSort?.(col.id)}
          >
            <div className="flex items-center justify-between gap-2">
              {col.header}
              {col.sortable && (
                <div className="flex items-center gap-1 text-xs">
                  {sorting?.column === col.id ? (
                    sorting?.direction === 'asc' ? (
                      <ChevronUp size={14} className="text-blue-500" />
                    ) : (
                      <ChevronDown size={14} className="text-blue-500" />
                    )
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}
