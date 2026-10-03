import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { filterDealLeads, isDealLeadStale } from '../../utils/dealLeads'
import { buildTeamLanes } from '../../utils/dealTeam'
import { useDealPeople } from '../common/useDealPeople'
import { AddLeadsDialog } from '../leads/AddLeadsDialog'
import { DealLeadsTable } from './DealLeadsTable'
import { DealPipelineBoard } from './DealPipelineBoard'
import { DealPipelineToolbar } from './DealPipelineToolbar'
import { useDealPipelineState } from './useDealPipelineState'
import { useLeadDialogs } from './useLeadDialogs'

/** The deal's leads as a Kanban pipeline or a table (switch in the toolbar), with every lead action. */
export function DealPipelineView() {
  const { t } = useTranslation()
  const { dealId, stages, stageMap, leads, leadsQuery } = useDealWorkspace()
  const state = useDealPipelineState()
  const { people, members } = useDealPeople(dealId)
  const { actions, dialogs } = useLeadDialogs({ dealId, leads, stages, people })

  const ownerNames = useMemo(() => new Map(people.map((person) => [String(person.id), person.name])), [people])
  const visible = useMemo(() => {
    const filtered = filterDealLeads(leads, {
      status: state.status,
      ownerId: state.ownerId,
      search: state.search,
      unassigned: state.filter === 'unassigned',
    })
    return state.filter === 'stale' ? filtered.filter((lead) => isDealLeadStale(lead)) : filtered
  }, [leads, state.filter, state.ownerId, state.search, state.status])
  const lanes = useMemo(() => (state.lanes ? buildTeamLanes(visible, members, people) : null), [members, people, state.lanes, visible])

  return (
    <div className="space-y-3">
      <DealPipelineToolbar state={state} people={people} hasTeams={members.some((member) => member.kind === 'team')} onAdd={() => state.setParam('add', true)} />
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
          <DealPipelineBoard dealId={dealId} stages={stages} leads={visible} lanes={lanes} ownerNames={ownerNames} actions={actions} />
        </ResourceState>
      )}
      <AddLeadsDialog dealId={dealId} stages={stages} people={people} open={state.addOpen} onClose={() => state.setParam('add', '')} />
      {dialogs}
    </div>
  )
}
