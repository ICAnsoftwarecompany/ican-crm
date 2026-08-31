import { FilterChip } from './FilterChip'
import { Button } from '../ui/Button'

export function ActiveFilters({ activeFilters, onRemoveFilter, onClearAll }) {
  if (!activeFilters || activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <FilterChip
            key={filter.columnId}
            label={filter.columnHeader}
            value={filter.filter?.value}
            onRemove={() => onRemoveFilter(filter.columnId)}
            multiValue={filter.filter?.type === 'select' && filter.filter?.operator === 'in'}
          />
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearAll}
        className="w-full flex-shrink-0 justify-center sm:w-auto"
      >
        مسح الكل
      </Button>
    </div>
  )
}
