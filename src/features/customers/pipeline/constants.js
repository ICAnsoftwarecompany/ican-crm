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

// Card fields the user can show/hide/reorder from the pipeline settings. The lead name is always shown.
export const PIPELINE_CARD_FIELDS_STORAGE_KEY = 'customers-pipeline-card-fields'

export const PIPELINE_CARD_FIELDS = Object.freeze([
  { id: 'phone', labelKey: 'customers.phone', defaultVisible: true },
  { id: 'source', labelKey: 'leads.source', defaultVisible: true },
  { id: 'leadId', labelKey: 'customers.table.leadId', defaultVisible: true },
  { id: 'tag', labelKey: 'customers.table.tag', defaultVisible: true },
  { id: 'latestNote', labelKey: 'customers.table.latestFollowUp', defaultVisible: true },
  { id: 'nextActivity', labelKey: 'customers.pipeline.fields.nextActivity', defaultVisible: true },
  { id: 'channels', labelKey: 'customers.table.linkedChannels', defaultVisible: true },
  { id: 'email', labelKey: 'customers.email', defaultVisible: false },
  { id: 'assignedTo', labelKey: 'customers.table.assignedTo', defaultVisible: false },
  { id: 'company', labelKey: 'customers.table.company', defaultVisible: false },
  { id: 'customerCode', labelKey: 'customers.table.customerCode', defaultVisible: false },
  { id: 'leadType', labelKey: 'customers.table.leadType', defaultVisible: false },
  { id: 'createdAt', labelKey: 'customers.table.createdAt', defaultVisible: false },
  { id: 'lastActionAt', labelKey: 'customers.table.lastAction', defaultVisible: false },
])
