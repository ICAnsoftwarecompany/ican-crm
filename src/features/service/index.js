/**
 * Public surface of the Service Operations area.
 * Pages and other features import from here only — never from internal paths.
 * Keep this list short; export a sub-module only when something outside
 * features/service really needs it.
 */

// Core
export { createServiceApi, isModuleMocked } from './core/api/serviceHttp'
export { serviceKeys } from './core/constants/queryKeys'
export {
  SERVICE_MODULES,
  SERVICE_PHASES,
  CURRENT_SERVICE_PHASE,
  getServiceModule,
  getModulesForPhase,
} from './core/constants/serviceModules'
export { useServiceCapabilities, useServiceTerminology } from './core/capabilities/useServiceCapabilities'

// Core UI
export { ServiceMockBanner } from './core/components/ServiceMockBanner'
export { CapabilitiesOverview } from './core/components/CapabilitiesOverview'
export { ServiceRoadmap } from './core/components/ServiceRoadmap'

// F1 — Cases
export {
  CasesWorkspace,
  CaseDetailView,
  CaseCreateDialog,
  CreateCaseFromConversationButton,
  CaseStatusBadge,
  CasePriorityBadge,
  useCaseList,
  useCaseSummary,
} from './cases'

// F1 — My Work & Service Center
export { MyWorkList, ServiceCenterCounters, useMyWork } from './my-work'

// F1 — Contacts & Customer 360
export { CustomerContactsPanel, useCustomerContacts } from './contacts'
export { CustomerServiceTab } from './customer-360'

// F2 — Settings (case types, queues, SLA, calendars, escalation)
export { SettingsWorkspace, useResourceList } from './settings'

// F2 — SLA presentation
export { SlaBadge, SlaPanel } from './sla'

// F2 — Saved replies, macros, knowledge base
export { SavedReplyPicker, MacroMenu } from './replies'
export { KnowledgeWorkspace, ArticleEditor, useKbArticle } from './knowledge'

// F2 — Reports & feedback
export { ReportsWorkspace } from './reports'
export { FeedbackList, CsatScore } from './feedback'

// F3 — Service records & batches
export { RecordsWorkspace, RecordDetailView, BatchesWorkspace, BatchDetailView, useRecordsSetup, findRecordType } from './records'
export { ServicesHubNav } from './core/components/ServicesHubNav'
