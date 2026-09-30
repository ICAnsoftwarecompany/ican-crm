import { useMemo } from 'react'
import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'
import { PIPELINE_CARD_FIELDS_STORAGE_KEY } from '../constants'
import { getDefaultCardFields, moveCardField, normalizeCardFields, toggleCardField } from '../utils/pipelineCardFields'

/** Which lead fields the pipeline cards show, and in what order. Remembered across reloads. */
export function usePipelineCardFields() {
  const [stored, setStored] = useLocalStorage(PIPELINE_CARD_FIELDS_STORAGE_KEY, null)
  const fields = useMemo(() => normalizeCardFields(stored), [stored])
  const visibleFieldIds = useMemo(
    () => fields.filter((field) => field.visible).map((field) => field.id),
    [fields]
  )

  return {
    fields,
    visibleFieldIds,
    toggleField: (id) => setStored(toggleCardField(fields, id)),
    moveField: (id, direction) => setStored(moveCardField(fields, id, direction)),
    resetFields: () => setStored(getDefaultCardFields()),
  }
}
