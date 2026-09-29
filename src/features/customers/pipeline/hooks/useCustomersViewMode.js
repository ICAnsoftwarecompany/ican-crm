import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'
import { CUSTOMERS_VIEW_MODE_STORAGE_KEY, CUSTOMERS_VIEW_MODES } from '../constants'

const VALID_MODES = new Set(Object.values(CUSTOMERS_VIEW_MODES))

/** Table / pipeline choice for the Leads Center, remembered across reloads. */
export function useCustomersViewMode() {
  const [storedMode, setStoredMode] = useLocalStorage(CUSTOMERS_VIEW_MODE_STORAGE_KEY, CUSTOMERS_VIEW_MODES.TABLE)
  const viewMode = VALID_MODES.has(storedMode) ? storedMode : CUSTOMERS_VIEW_MODES.TABLE

  const setViewMode = (mode) => {
    if (VALID_MODES.has(mode)) setStoredMode(mode)
  }

  return [viewMode, setViewMode]
}
