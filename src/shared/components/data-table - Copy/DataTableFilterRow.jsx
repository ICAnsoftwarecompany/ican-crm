import { memo, useMemo } from 'react'
import { cn } from '../../utils/cn'

function getNestedValue(row, accessor) {
  return accessor.split('.').reduce((current, prop) => current?.[prop], row)
}

function DataTableFilterRowComponent({ columns, rows = [], filters, onFilterChange }) {
  const language = typeof document !== 'undefined' ? document.documentElement.lang || 'ar' : 'ar'
  const allLabel = language.startsWith('ar') ? 'الكل' : 'All'

  const getStickyFilterStyle = (col) => {
    if (!col._isPinned) return undefined

    return {
      position: 'sticky',
      insetInlineStart: `${Number(col._stickyOffset) || 0}px`,
      zIndex: 20,
      backgroundColor: '#F9FAFB',
      boxShadow: '1px 0 0 var(--border)',
    }
  }

  const optionsByColumn = useMemo(() => {
    const result = {}

    columns.forEach((col) => {
      if (!col.accessor) {
        result[col.id] = []
        return
      }

      if (Array.isArray(col.filterOptions) && col.filterOptions.length > 0) {
        result[col.id] = col.filterOptions
        return
      }

      const unique = new Set()
      rows.forEach((row) => {
        const value = getNestedValue(row, col.accessor)
        if (value !== null && value !== undefined && String(value).trim() !== '') {
          unique.add(String(value))
        }
      })

      result[col.id] = Array.from(unique)
        .sort((a, b) => a.localeCompare(b, language))
        .map((value) => ({ value, label: value }))
    })

    return result
  }, [columns, rows, language])

  return (
    <tr className="bg-gray-50 border-b border-gray-200 hover:bg-gray-100">
      {columns.map((col) => {
        const currentValue = filters[col.id]?.value || ''
        const options = optionsByColumn[col.id] || []

        return (
          <td
            key={col.id}
            className={cn('border-e border-[#D7E2E6] px-1.5 py-2 text-sm', col._isPinned && 'sticky')}
            style={getStickyFilterStyle(col)}
          >
            {col.accessor && col.enableFilter !== false ? (
              <select
                value={currentValue}
                onChange={(e) => {
                  const selected = e.target.value
                  if (!selected) {
                    onFilterChange(col.id, null)
                    return
                  }

                  onFilterChange(col.id, {
                    type: 'select',
                    operator: 'equals',
                    value: selected,
                  })
                }}
                className="h-9 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-2 text-sm"
                title={`فلترة حسب ${col.header}`}
              >
                <option value="">{allLabel}</option>
                {options.map((opt) => (
                  <option key={`${col.id}-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : null}
          </td>
        )
      })}
    </tr>
  )
}

export const DataTableFilterRow = memo(DataTableFilterRowComponent)
