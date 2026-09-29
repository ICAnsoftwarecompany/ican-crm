export const CUSTOMERS_VIEW_MODES = Object.freeze({
  TABLE: 'table',
  PIPELINE: 'pipeline',
})

// Persisted through the DataTable useLocalStorage helper (prefixed + versioned key).
export const CUSTOMERS_VIEW_MODE_STORAGE_KEY = 'customers-view-mode'

// Virtual column for leads whose status is empty or not an active lead status.
// Leads can be dragged out of it, never into it.
export const UNSTAGED_PIPELINE_STAGE_ID = '__unstaged'

export const PIPELINE_STAGE_FIELD = '__pipelineStageId'
export const PIPELINE_ITEM_ID_FIELD = '__pipelineItemId'
