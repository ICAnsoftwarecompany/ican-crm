import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { QUERY_KEYS } from '../../../../shared/constants/queryKeys'
import { leadAssignmentApi } from '../../api/leadAssignmentApi'

export function getManualDistributionLeadIds(rows) {
  const ids = rows.map((row) => row.lead_id ?? row.lead?.id)
  if (ids.some((id) => id == null || id === '' || !Number.isSafeInteger(Number(id)) || Number(id) <= 0)) return null
  return [...new Set(ids.map(Number))]
}

export function ManualLeadDistributionAction({ selectedRows = [], clearSelection }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const ids = getManualDistributionLeadIds(selectedRows)
  const mutation = useMutation({
    mutationFn: async () => {
      if (!ids?.length) throw new Error(t('salesTeams.manual.invalidSelection'))
      const response = await leadAssignmentApi.distributeManually({ lead_ids: ids })
      if (response?.success === false) throw new Error(response.message || t('salesTeams.manual.failed'))
      return response
    },
    onSuccess: () => {
      clearSelection?.()
      for (const queryKey of [QUERY_KEYS.customers.all, QUERY_KEYS.leads.all, QUERY_KEYS.teams.all, QUERY_KEYS.users.all]) queryClient.invalidateQueries({ queryKey })
      toast.success(t('salesTeams.manual.success'))
    },
    onError: (error) => toast.error(extractMessage(error, t('salesTeams.manual.failed'))),
  })
  return <div className="flex flex-wrap items-center gap-3">
    <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!ids?.length} title={ids === null ? t('salesTeams.manual.invalidSelection') : undefined}><UserCheck size={16} />{t('salesTeams.manual.distribute', { count: ids?.length || 0 })}</Button>
    {ids === null && <span role="alert" className="text-sm text-[var(--text-muted)]">{t('salesTeams.manual.invalidSelection')}</span>}
  </div>
}
