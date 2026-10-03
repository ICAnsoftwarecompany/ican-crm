import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, UserRoundX, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { ReportChart } from '../../../../shared/components/reports'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealResourceMutations } from '../../hooks/useDealResources'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { buildWorkload } from '../../utils/dealTeam'
import { PlannedNotice } from '../common/PlannedNotice'
import { useDealPeople } from '../common/useDealPeople'
import { AddTeamMemberDialog } from './AddTeamMemberDialog'
import { DealTeamMembers } from './DealTeamMembers'

/** Deal team: who works on the deal (users and whole teams with roles) and how open leads are split. */
export function DealTeamPanel() {
  const { t } = useTranslation()
  const { dealId, leads } = useDealWorkspace()
  const { members, people, allUsers, teams, teamQuery } = useDealPeople(dealId)
  const { removeTeamMember } = useDealResourceMutations(dealId)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(null)

  const workload = useMemo(() => buildWorkload(leads, people), [leads, people])
  const workloadById = useMemo(() => new Map(workload.rows.map((row) => [row.id, row.open])), [workload.rows])
  const chart = {
    id: 'deal-workload',
    type: 'bar',
    title: t('dealWorkspace.team.workloadTitle'),
    description: t('dealWorkspace.team.workloadDescription'),
    valueLabel: t('dealWorkspace.reports.series.leads'),
    data: workload.rows.slice(0, 8).map((row) => ({ key: row.id, label: row.name || `#${row.id}`, value: row.open })),
  }

  const confirmRemove = async () => {
    try {
      await removeTeamMember.mutateAsync(removing.id)
      toast.success(t('dealWorkspace.team.removed'))
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.team.removeFailed')))
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">{t('dealWorkspace.team.description')}</p>
        <Button size="sm" onClick={() => setAdding(true)}><Plus size={15} />{t('dealWorkspace.team.add.title')}</Button>
      </div>
      {workload.unassigned > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          <UserRoundX size={16} />{t('dealWorkspace.team.unassignedNotice', { count: workload.unassigned })}
        </div>
      )}
      <ResourceState
        isLoading={teamQuery.isLoading}
        error={teamQuery.error}
        onRetry={teamQuery.refetch}
        empty={!members.length}
        emptyIcon={<Users size={24} />}
        emptyTitle={t('dealWorkspace.team.emptyTitle')}
        emptyDescription={t('dealWorkspace.team.emptyDescription')}
      >
        <DealTeamMembers members={members} workloadById={workloadById} onRemove={setRemoving} />
      </ResourceState>
      <ReportChart chart={chart} />
      <PlannedNotice capability="leadsDistribute" />
      <PlannedNotice capability="teamRoleUpdate" />
      <AddTeamMemberDialog dealId={dealId} users={allUsers} teams={teams} open={adding} onClose={() => setAdding(false)} />
      <ConfirmDialog
        isOpen={Boolean(removing)}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
        title={t('dealWorkspace.team.removeTitle')}
        message={t('dealWorkspace.team.removeMessage', { name: removing?.name || '' })}
        confirmText={t('dealWorkspace.team.remove')}
        cancelText={t('dealWorkspace.common.cancel')}
        type="danger"
        loading={removeTeamMember.isPending}
      />
    </div>
  )
}
