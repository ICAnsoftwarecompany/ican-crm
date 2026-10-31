import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { filterDealLeads, isDealLeadStale } from '../../utils/dealLeads'
import { buildTeamLanes } from '../../utils/dealTeam'
import { useDealPeople } from '../common/useDealPeople'
import { useProductOptions } from '../common/useProductOptions'
import { isUniqueUnitTaken } from '../../utils/dealProductMode'
import { AddLeadsDialog } from '../leads/AddLeadsDialog'
import { DealLeadsTable } from './DealLeadsTable'
import { DealPipelineBoard } from './DealPipelineBoard'
import { DealPipelineToolbar } from './DealPipelineToolbar'
import { useDealPipelineState } from './useDealPipelineState'
import { useLeadDialogs } from './useLeadDialogs'
import { DealStageTabs, NO_DEAL_STAGE, hasDealStage } from './DealStageTabs'

/** The deal's leads as a Kanban pipeline or a table (switch in the toolbar), with every lead action. */
export function DealPipelineView() {
  const { t } = useTranslation()
  const { dealId, stages, stageMap, leads, leadsQuery } = useDealWorkspace()
  const state = useDealPipelineState()
  const { people, members } = useDealPeople(dealId)
  const { actions, dialogs } = useLeadDialogs({ dealId, leads, stages, people })
  const productMode = useProductOptions(dealId)
  const unitSold = isUniqueUnitTaken(productMode.mode, leads)

  const ownerNames = useMemo(() => new Map(people.map((person) => [String(person.id), person.name])), [people])
  const filteredLeads = useMemo(() => {
    const filtered = filterDealLeads(leads, {
      status: state.status,
      ownerId: state.ownerId,
      search: state.search,
      unassigned: state.filter === 'unassigned',
    })
    return state.filter === 'stale' ? filtered.filter((lead) => isDealLeadStale(lead)) : filtered
  }, [leads, state.filter, state.ownerId, state.search, state.status])
  const visible = useMemo(() => state.view !== 'table' ? filteredLeads : filteredLeads.filter((lead) => !state.stage || (state.stage === NO_DEAL_STAGE ? !hasDealStage(lead) : String(lead.stageId) === state.stage)), [filteredLeads, state.stage, state.view])
  const boardStages = [{ id: NO_DEAL_STAGE, label: t('dealWorkspace.pipeline.noStage') }, ...stages]
  const lanes = useMemo(() => (state.lanes ? buildTeamLanes(visible, members, people) : null), [members, people, state.lanes, visible])

  return (
    <div className="space-y-3">
      {state.view === 'table' && <DealStageTabs stages={stages} leads={filteredLeads} value={state.stage} onChange={(value) => state.setParam('stage', value)} />}
      <DealPipelineToolbar state={state} people={people} hasTeams={members.some((member) => member.kind === 'team')} />
      {unitSold && <ModuleNotice tone="warning">{t('dealWorkspace.productMode.unitSoldNotice', { name: productMode.products[0]?.name || '' })}</ModuleNotice>}
      {!stages.length && !leadsQuery.isLoading && <ModuleNotice tone="warning">{t('dealWorkspace.pipeline.noStages')}</ModuleNotice>}
      {state.view === 'table' ? (
        <DealLeadsTable
          dealId={dealId}
          leads={visible}
          stages={stages}
          stageMap={stageMap}
          ownerNames={ownerNames}
          isLoading={leadsQuery.isLoading}
          error={leadsQuery.error}
          onRetry={leadsQuery.refetch}
          actions={actions}
        />
      ) : (
        <ResourceState isLoading={leadsQuery.isLoading} error={leadsQuery.error} onRetry={leadsQuery.refetch}>
          <DealPipelineBoard dealId={dealId} stages={boardStages} leads={visible} lanes={lanes} ownerNames={ownerNames} actions={actions} />
        </ResourceState>
      )}
      <AddLeadsDialog dealId={dealId} stages={stages} people={people} open={state.addOpen} onClose={() => state.setParam('add', '')} />
      {dialogs}
    </div>
  )
}
