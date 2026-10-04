// Public surface of the leads feature (added 2026-10-01). Older consumers still import internal paths.
export { AssignmentRulesPanel } from './components/AssignmentRulesPanel'
export { useAssignmentRules, useLeadLogs, useLeadLog, useLeadMutations } from './hooks/useLeads'
export { LEAD_AI_CAPABILITIES } from './constants/leadAiCapabilities'

// Lead close (2026-10-04): close as won / lost or reopen, from every Leads Center status change.
export { useLeadCloseRequest } from './close/useLeadCloseRequest'
export { useLeadClose } from './close/useLeadClose'
export { LeadCloseDialog } from './close/LeadCloseDialog'
export {
  LEAD_LOST_REASONS,
  LEAD_FOLLOW_UP_PRESETS,
  buildLeadClosePayload,
  getStatusCloseKind,
  getMissingCloseKinds,
  getRowStatusId,
  getStatusReasons,
  getStatusesOfKind,
  statusLookup,
  isClosingStatus,
  resolveCloseMode,
  validateCloseForm,
} from './close/leadClose'
