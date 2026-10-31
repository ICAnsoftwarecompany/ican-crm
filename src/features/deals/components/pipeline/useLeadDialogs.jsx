import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ScheduleActivityDialog } from '../../../activities'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { WonDialog } from '../closing/WonDialog'
import { LostDialog } from '../closing/LostDialog'
import { BulkAssignDialog } from '../leads/BulkAssignDialog'
import { DealLeadDrawer } from '../leads/DealLeadDrawer'
import { FollowUpNoteDialog, LeadInterestDialog } from '../../../leads'
import { definitionsApi } from '../../../definitions'
import { dealLeadCustomer, dealLeadPath, dealDrawerActionOverrides } from '../../utils/dealLeadActions'
import { dealKeys } from '../../constants/dealQueryKeys'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { useLeadTaskAction } from '../../../lead-tasks'

const EMPTY_STATUSES = []

/**
 * Every dialog a deal lead can open (drawer, won, lost, assign, call/meeting) + the `actions` object the
 * card, table and drawer call. After a confirmed won/lost from a column drop, the card is moved to that
 * column (change-stage) so the board matches what the user did.
 */
export function useLeadDialogs({ dealId, leads, stages, people }) {
  const { t } = useTranslation()
  const { renderCustomerDrawer } = useDealWorkspace()
  const navigate = useNavigate()
  const client = useQueryClient()
  const { changeStage } = useDealLeadMutations(dealId)
  const [drawerId, setDrawerId] = useState(null)
  const [won, setWon] = useState(null)
  const [lost, setLost] = useState(null)
  const [assign, setAssign] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [followUp, setFollowUp] = useState(null)
  const [interest, setInterest] = useState(null)
  const taskAction = useLeadTaskAction({ dealId })
  const statusesQuery = useQuery({ queryKey: ['customers', 'lead-status-tabs'], queryFn: () => definitionsApi.getStatuses(), enabled: Boolean(followUp), staleTime: 60000 })
  const statuses = statusesQuery.data?.data?.lead || EMPTY_STATUSES
  const onCrmSaved = () => {
    client.invalidateQueries({ queryKey: dealKeys.all })
    client.invalidateQueries({ queryKey: ['customers'] })
    client.invalidateQueries({ queryKey: ['leads'] })
  }

  const drawerLead = drawerId ? leads.find((lead) => String(lead.id) === String(drawerId)) || null : null

  const moveAfterClose = async (state) => {
    if (!state?.stage || String(state.lead.stage_id) === String(state.stage.id)) return
    try {
      await changeStage.mutateAsync({ dealLeadId: state.lead.id, stageId: state.stage.id })
    } catch {
      toast.error(t('dealWorkspace.pipeline.moveFailed'))
    }
  }

  const actions = {
    onOpen: (lead) => setDrawerId(lead.id),
    onAddTask: (rows) => { setDrawerId(null); taskAction.open(rows) },
    onWon: (lead, stage = null) => { setDrawerId(null); setWon({ lead, stage }) },
    onLost: (lead, stage = null) => { setDrawerId(null); setLost({ lead, stage }) },
    onAssign: (rows, clearSelection) => setAssign({ rows, clearSelection }),
    onSchedule: (lead, type) => { setDrawerId(null); setSchedule({ lead, type }) },
    onFollowUp: (lead) => { setDrawerId(null); setFollowUp(dealLeadCustomer(lead)) },
    onInterest: (lead) => { setDrawerId(null); setInterest(dealLeadCustomer(lead)) },
    onOpenPage: (lead) => navigate(dealLeadPath(dealId, lead.id)),
  }

  const dialogs = (
    <>
      {taskAction.dialog}
      {drawerLead && renderCustomerDrawer ? renderCustomerDrawer({
        customer: dealLeadCustomer(drawerLead), open: true, onClose: () => setDrawerId(null),
        onStatusChanged: onCrmSaved, detailsPagePath: dealLeadPath(dealId, drawerLead.id),
        quickActionOverrides: dealDrawerActionOverrides(drawerLead, actions, t),
      }) : <DealLeadDrawer dealId={dealId} lead={drawerLead} stages={stages} people={people} open={Boolean(drawerLead)} onClose={() => setDrawerId(null)} actions={actions} />}
      <WonDialog dealId={dealId} lead={won?.lead} open={Boolean(won)} onClose={() => setWon(null)} onWon={() => moveAfterClose(won)} />
      <LostDialog dealId={dealId} lead={lost?.lead} open={Boolean(lost)} onClose={() => setLost(null)} onLost={() => moveAfterClose(lost)} />
      <BulkAssignDialog dealId={dealId} leads={assign?.rows || []} people={people} open={Boolean(assign)} onClose={() => setAssign(null)} onDone={() => assign?.clearSelection?.()} />
      {followUp && <FollowUpNoteDialog open customer={followUp} statuses={statuses} onClose={() => setFollowUp(null)} onSaved={onCrmSaved} />}
      {interest && <LeadInterestDialog open customer={interest} onClose={() => setInterest(null)} onSaved={onCrmSaved} />}
      {schedule && (
        <ScheduleActivityDialog
          type={schedule.type}
          isOpen
          leadId={schedule.lead.leadId}
          relatedType="lead"
          defaultPhone={schedule.lead.phone}
          assignedUserId={schedule.lead.ownerId || undefined}
          defaultTitle={t(`dealWorkspace.leads.scheduleTitle.${schedule.type}`, { name: schedule.lead.name })}
          avoidCustomerDetailsDrawer
          onClose={() => setSchedule(null)}
          onCreated={() => setSchedule(null)}
        />
      )}
    </>
  )

  return { actions, dialogs }
}
