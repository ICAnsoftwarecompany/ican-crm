import { cn } from '../../utils/cn'

export function DataTableBody({ rows, columns, onRowClick, rowClassName }) {
  if (!rows || rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--text-muted)]">
            لا توجد بيانات
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <tr
          key={row.id || rowIndex}
          className={cn(
            'border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors',
            onRowClick && 'cursor-pointer',
            rowClassName?.(row)
          )}
          onClick={() => onRowClick?.(row)}
        >
          {columns.map((col) => (
            <td key={col.id} className={cn('px-4 py-3 text-sm text-[var(--text)]', col.width)}>
              {col.render ? col.render(row) : getCellValue(row, col.accessor)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

function getCellValue(row, accessor) {
  return accessor.split('.').reduce((current, prop) => current?.[prop], row)
}
