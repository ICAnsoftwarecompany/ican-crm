import { useState, useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Advanced filter hook for per-column filtering
 * Manages filter state, persistence, and active filter tracking
 */
export function useAdvancedFilters(tableId = 'default', columns = []) {
  const [storedFilters, setStoredFilters] = useLocalStorage(`filters-${tableId}`, null)

  const [filters, setFilters] = useState(() => {
    return storedFilters || {}
  })

  // Update localStorage whenever filters change
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters)
    setStoredFilters(newFilters)
  }, [setStoredFilters])

  // Set or update a single filter
  const setFilter = useCallback((columnId, filterValue) => {
    setFilters(prev => {
      const updated = { ...prev }
      if (filterValue === null || filterValue === undefined) {
        delete updated[columnId]
      } else {
        updated[columnId] = filterValue
      }
      updateFilters(updated)
      return updated
    })
  }, [updateFilters])

  // Remove a specific filter
  const removeFilter = useCallback((columnId) => {
    setFilters(prev => {
      const updated = { ...prev }
      delete updated[columnId]
      updateFilters(updated)
      return updated
    })
  }, [updateFilters])

  // Clear all filters
  const clearFilters = useCallback(() => {
    updateFilters({})
    setFilters({})
  }, [updateFilters])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).length
  }, [filters])

  // Get active filter information for display
  const activeFilters = useMemo(() => {
    return Object.entries(filters).map(([columnId, filter]) => {
      const column = columns.find(c => c.id === columnId)
      return {
        columnId,
        columnHeader: column?.header || columnId,
        filter,
      }
    })
  }, [filters, columns])

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    activeFilterCount,
    activeFilters,
    hasActiveFilters: activeFilterCount > 0,
  }
}
