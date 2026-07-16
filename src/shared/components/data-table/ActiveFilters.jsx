import { FilterChip } from './FilterChip'
import { Button } from '../ui/Button'

export function ActiveFilters({ activeFilters, onRemoveFilter, onClearAll }) {
  if (!activeFilters || activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex flex-wrap gap-2 flex-1">
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
        className="flex-shrink-0"
      >
        مسح الكل
      </Button>
    </div>
  )
}
