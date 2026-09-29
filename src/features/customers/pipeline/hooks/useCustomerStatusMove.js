import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useLeadMutations } from '../../../leads/hooks/useLeads'
import { useMeetingMutations } from '../../../meetings/hooks/useMeetings'
import { QUERY_KEYS } from '../../../../shared/constants/queryKeys'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { formatDateTimeForApi } from '../../../../shared/utils/dateTime'
import {
  applyStatusToCustomersPages,
  buildStatusChangePayload,
  getPipelineCustomerKey,
  getPipelineLead,
  getPipelineLeadId,
  getStatusLabel,
  statusRequiresReason,
} from '../utils/customerPipeline'

const CUSTOMER_LISTS_KEY = [...QUERY_KEYS.customers.all, 'list']

/**
 * Moves a lead to another status from the pipeline board.
 * The card moves immediately (optimistic cache update); the change is rolled back if the
 * request fails. useLeadMutations invalidates customers/leads caches on success.
 */
export function useCustomerStatusMove({ statusById } = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const leadMutations = useLeadMutations()
  const meetingMutations = useMeetingMutations()

  const moveCustomer = useCallback(async ({ customer, status, reason = '', schedulePayload = null }) => {
    const leadId = getPipelineLeadId(customer)
    const customerKey = getPipelineCustomerKey(customer)
    if (!leadId || !status) {
      toast.error(t('customers.pipeline.toasts.missingLead'))
      return false
    }

    const lead = getPipelineLead(customer)
    const oldStatus = statusById?.get(String(lead.status_type_id ?? customer?.status_type_id ?? ''))
    const statusName = getStatusLabel(status)
    const customerName = lead.name || customer?.name || lead.phone || customer?.phone || t('customers.table.theCustomer')
    const needsReason = statusRequiresReason(status)

    await queryClient.cancelQueries({ queryKey: CUSTOMER_LISTS_KEY })
    const snapshots = queryClient.getQueriesData({ queryKey: CUSTOMER_LISTS_KEY })
    queryClient.setQueriesData({ queryKey: CUSTOMER_LISTS_KEY }, (data) => applyStatusToCustomersPages(data, customerKey, status))

    try {
      await leadMutations.saveAction.mutateAsync(buildStatusChangePayload({
        leadId,
        status,
        oldStatus,
        reason,
        title: needsReason
          ? t('customers.pipeline.activity.reasonTitle', { status: statusName })
          : t('customers.pipeline.activity.title', { status: statusName }),
        description: t('customers.pipeline.activity.description', { status: statusName }),
        activityAt: formatDateTimeForApi(new Date()),
      }))

      if (schedulePayload?.type) {
        await meetingMutations.create.mutateAsync({
          ...schedulePayload,
          title: schedulePayload.title || t(schedulePayload.type === 'call'
            ? 'customers.pipeline.activity.followUpCall'
            : 'customers.pipeline.activity.followUpMeeting'),
          description: schedulePayload.description || reason,
        })
      }

      toast.success(t('customers.page.toasts.statusUpdated'), {
        description: t('customers.page.toasts.statusUpdatedDesc', { name: customerName, status: statusName }),
      })
      return true
    } catch (error) {
      snapshots.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
      toast.error(extractMessage(error, t('customers.pipeline.toasts.moveFailed')))
      return false
    }
  }, [leadMutations.saveAction, meetingMutations.create, queryClient, statusById, t])

  return {
    moveCustomer,
    isMoving: leadMutations.saveAction.isPending || meetingMutations.create.isPending,
  }
}
