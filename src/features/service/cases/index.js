/** Public surface of the cases sub-module (re-exported by features/service/index.js). */
export { CasesWorkspace } from './components/CasesWorkspace'
export { CaseDetailView } from './components/detail/CaseDetailView'
export { CaseCreateDialog } from './components/CaseCreateDialog'
export { CreateCaseFromConversationButton } from './components/CreateCaseFromConversationButton'
export { CaseStatusBadge, CasePriorityBadge } from './components/CaseBadges'
export { useCaseList, useCaseSummary, useCaseSetup, useCase } from './hooks/useCases'
export { CASE_VIEWS, SERVICE_CENTER_VIEWS } from './constants/caseViews'
