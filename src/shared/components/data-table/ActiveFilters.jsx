import { FilterChip } from './FilterChip'
import { Button } from '../ui/Button'
import { useTranslation } from 'react-i18next'

export function ActiveFilters({ activeFilters, onRemoveFilter, onClearAll }) {
  const { t } = useTranslation()
  if (!activeFilters || activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 sm:flex-row sm:items-center">
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
        {t('dataTable.clearAll')}
      </Button>
    </div>
  )
}
