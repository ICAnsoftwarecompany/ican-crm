import { memo, useCallback } from 'react'
import { TextFilterInput } from './filters/TextFilterInput'
import { SelectFilterInput } from './filters/SelectFilterInput'
import { NumberRangeInput } from './filters/NumberRangeInput'
import { DateRangeInput } from './filters/DateRangeInput'
import { BooleanFilterInput } from './filters/BooleanFilterInput'

const getFilterInputComponent = (filterType) => {
  switch (filterType) {
    case 'text':
      return TextFilterInput
    case 'select':
    case 'multiSelect':
      return SelectFilterInput
    case 'numberRange':
      return NumberRangeInput
    case 'dateRange':
      return DateRangeInput
    case 'boolean':
      return BooleanFilterInput
    default:
      return null
  }
}

function DataTableFilterRowComponent({ columns, filters, onFilterChange }) {
  const handleFilterChange = useCallback(
    (columnId, filter) => {
      onFilterChange(columnId, filter)
    },
    [onFilterChange]
  )

  return (
    <tr className="bg-gray-50 border-b border-gray-200 hover:bg-gray-100">
      {columns.map((col) => {
        const FilterComponent = col.filterable ? getFilterInputComponent(col.filterType) : null

        return (
          <td
            key={col.id}
            className="px-4 py-2 text-sm"
            style={{ width: col.width }}
          >
            {FilterComponent && col.filterable ? (
              <FilterComponent
                column={col}
                value={filters[col.id]}
                onChange={(filter) => handleFilterChange(col.id, filter)}
              />
            ) : null}
          </td>
        )
      })}
    </tr>
  )
}

export const DataTableFilterRow = memo(DataTableFilterRowComponent)
