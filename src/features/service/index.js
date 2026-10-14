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
} from './cases/index'

// F1 — My Work & Service Center
export { MyWorkList, ServiceCenterCounters, useMyWork } from './my-work/index'

// F1 — Contacts & Customer 360
export { CustomerContactsPanel, useCustomerContacts } from './contacts/index'
export { CustomerServiceTab } from './customer-360/index'

// F2 — Settings (case types, queues, SLA, calendars, escalation)
export { SettingsWorkspace, useResourceList } from './settings/index'

// F2 — SLA presentation
export { SlaBadge, SlaPanel } from './sla/index'

// F2 — Saved replies, macros, knowledge base
export { SavedReplyPicker, MacroMenu } from './replies/index'
export { KnowledgeWorkspace, ArticleEditor, useKbArticle } from './knowledge/index'

// F2 — Reports & feedback
export { ReportsWorkspace } from './reports/index'
export { FeedbackList, CsatScore } from './feedback/index'

// F3 — Service records & batches
export { RecordsWorkspace, RecordDetailView, BatchesWorkspace, BatchDetailView, useRecordsSetup, findRecordType } from './records/index'
export { ServicesHubNav } from './core/components/ServicesHubNav'

// F3 — Assets, warranty, entitlements
export { AssetsWorkspace, AssetDetailView } from './assets/index'
export { EntitlementsList, CaseCoveragePanel } from './entitlements/index'

// F3 — Contracts & handoffs
export { ContractsWorkspace, ContractDetailView } from './contracts/index'
export { HandoffsWorkspace, HandoffDetailView } from './handoffs/index'

// F4 — Billing Lite
export { SubscriptionsWorkspace, SubscriptionDetailView } from './subscriptions/index'
export { SchedulingWorkspace, SlotPicker } from './scheduling/index'
export { DeliveriesWorkspace } from './deliveries/index'
export { WorkOrdersWorkspace, WorkOrderDetailView, WorkOrderCreateDialog } from './work-orders/index'
export { PlanCalculator, PlanPreviewTable, BillingNav, SchedulesList, ScheduleDetailView, CollectionsWorkspace } from './billing/index'

// F5 — Follow-ups & portfolios
export { FollowUpsWorkspace, EnrollFollowUpDialog } from './follow-ups/index'
export { PortfoliosPanel } from './portfolios/index'
export { ApiClientsPanel, WebhooksPanel } from './api-access/index'

// F6 — Search & incidents
export { ServiceSearch } from './search/ServiceSearch'
export { ActiveIncidentsBanner, IncidentsWorkspace, IncidentDetailView } from './incidents/index'

// F6 — Quality
export { QualityWorkspace } from './quality/index'

// F7 — AI
export { AiCasePanel, AiSignalChips, AiSettingsPanel } from './ai/index'
export { HealthScoreCard, AtRiskCustomers, AdvancedReport } from './health/index'
