import { createContext, useContext, useMemo } from 'react'
import { buildDealLeadIndex, summarizeDealLeads } from '../utils/dealLeads'
import { buildStageMap, resolveDealStages } from '../utils/dealStages'
import { useDeal, usePipelineTemplates } from './useDeals'
import { useDealLeads } from './useDealLeads'

const DealWorkspaceContext = createContext(null)

/**
 * Loads what every page of one deal needs (deal, stages, leads) once, in the workspace layout. Pages read it
 * with `useDealWorkspace()`; everything else (team, products, contracts…) is loaded by the page that needs it.
 */
export function DealWorkspaceProvider({ dealId, children }) {
  const dealQuery = useDeal(dealId)
  const templatesQuery = usePipelineTemplates()
  const leadsQuery = useDealLeads(dealId)

  const value = useMemo(() => {
    const deal = dealQuery.deal || null
    const stages = resolveDealStages(deal, templatesQuery.templates)
    return {
      dealId: String(dealId),
      deal,
      dealQuery,
      stages,
      stageMap: buildStageMap(stages),
      leads: leadsQuery.leads,
      leadsQuery,
      leadIndex: buildDealLeadIndex(leadsQuery.leads),
      summary: summarizeDealLeads(leadsQuery.leads),
    }
  }, [dealId, dealQuery, leadsQuery, templatesQuery.templates])

  return <DealWorkspaceContext.Provider value={value}>{children}</DealWorkspaceContext.Provider>
}

export function useDealWorkspace() {
  const context = useContext(DealWorkspaceContext)
  if (!context) throw new Error('useDealWorkspace must be used inside <DealWorkspaceProvider>')
  return context
}
