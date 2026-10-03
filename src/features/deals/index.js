// Public API of the deals feature (Deals hub + Deal Workspace). See ./README.md.
export * from './api'
export { DEAL_API_STATUS, isDealApiLive, getPlannedDealCapabilities } from './constants/dealApiStatus'
export * from './constants/dealOptions'
export { dealKeys } from './constants/dealQueryKeys'
export {
  DEAL_AI_CAPABILITIES,
  DEAL_WORKSPACE_GROUPS,
  DEAL_WORKSPACE_PAGES,
  DEALS_HUB_PAGES,
  getDealPagePath,
  getDealsHubPath,
} from './constants/dealWorkspacePages'

export { useDeals, useDeal, usePipelineTemplates, useDealMutations, usePipelineTemplateMutations } from './hooks/useDeals'
export { useDealLeads, useDealLeadProducts, useDealLeadMutations } from './hooks/useDealLeads'
export { useDealTeam, useDealProducts, useDealResources, useDealResourceMutations } from './hooks/useDealResources'
export { useDealContracts, useDealContract } from './hooks/useDealContracts'
export { useDealAnalytics } from './hooks/useDealAnalytics'
export { DealWorkspaceProvider, useDealWorkspace } from './hooks/useDealWorkspace'
export { useDealActivities, useDealTasks, useDealLinkIndex } from './hooks/useDealLinkedWork'
export { useDealCalendarEvents } from './hooks/useDealCalendarEvents'

export { getDealStatusColor, getDealStatusValue } from './utils/dealDisplay'
export { normalizeDealLead, filterDealLeads, summarizeDealLeads, isDealLeadOpen, isDealLeadStale } from './utils/dealLeads'
export { resolveDealStages, isWonStage, isLostStage, isTerminalStage } from './utils/dealStages'
export { buildWonPayload, validateWonForm, previewInstallments, itemsTotal, lineTotal, formatMoney, progressPercent } from './utils/dealMoney'
export { normalizeContract, summarizeContract, isInstallmentOverdue } from './utils/dealContracts'
export { buildDealInsights, buildTargetPace } from './utils/dealInsights'
export { DEAL_PRODUCT_MODES, PRODUCT_UNIT_MODES, getLineRules, getProductUnitMode, getProductUnits, isUniqueUnitTaken, resolveDealProductMode } from './utils/dealProductMode'
export { WIZARD_STEPS, buildWizardRequests, createWizardState, validateWizardStep } from './utils/dealWizard'
export { buildTemplatePayload, validateStages } from './utils/pipelineTemplate'
export { useCatalogProducts } from './hooks/useCatalogProducts'
export { useDealCreateWizard } from './hooks/useDealCreateWizard'

export { useDealReport, useDealsHubReport } from './reports'

// Components (route pages in pages/deals compose these).
export * from './components'
