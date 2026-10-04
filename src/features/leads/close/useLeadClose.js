import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildTaskPayload, useCurrentUserId, useTaskMutations } from '../../tasks'
import { formatDateTimeForApi } from '../../../shared/utils/dateTime'
import { useLeadMutations } from '../hooks/useLeads'
import { buildLeadClosePayload, resolveFollowUpDate } from './leadClose'

export const getRowLeadId = (row) => row?.lead_id ?? row?.lead?.id ?? null
const getRowName = (row) => row?.lead?.name || row?.name || row?.lead?.phone || row?.phone || ''

/**
 * Sends a close / reopen for one lead or many: one saveAction per lead (same endpoint as every status change),
 * then — for a lost close with a follow-up — one follow-up task per lead, linked to the lead and assigned to
 * its owner (or the current user). Returns `{ done, failed, failedRows, error }`; never throws.
 */
export function useLeadClose() {
  const { t } = useTranslation()
  const leadMutations = useLeadMutations()
  const taskMutations = useTaskMutations()
  const currentUserId = useCurrentUserId()
  const [submitting, setSubmitting] = useState(false)

  const submit = async ({ rows, form, status, getOldStatus }) => {
    setSubmitting(true)
    const statusTitle = status?.status || status?.name || ''
    const labels = {
      title: t(`customers.leadClose.activity.${form.mode}`, { status: statusTitle }),
      description: t(`customers.leadClose.activity.${form.mode}`, { status: statusTitle }),
      reasonLabel: form.mode === 'lost' && form.lostReason ? t(`customers.leadClose.reasons.${form.lostReason}`) : '',
    }
    const followUpAt = resolveFollowUpDate(form)
    let done = 0
    let failed = 0
    let lastError = null
    const failedRows = []
    for (const row of rows) {
      const leadId = getRowLeadId(row)
      if (!leadId) {
        failed += 1
        failedRows.push(row)
        continue
      }
      try {
        await leadMutations.saveAction.mutateAsync(buildLeadClosePayload({
          leadId,
          form,
          status,
          oldStatus: getOldStatus?.(row),
          labels,
          activityAt: formatDateTimeForApi(new Date()),
          source: rows.length > 1 ? 'lead_close_bulk' : 'lead_close',
        }))
        if (followUpAt) {
          const owner = row?.lead?.assigned_to ?? row?.assigned_to ?? currentUserId
          await taskMutations.create.mutateAsync(buildTaskPayload({
            title: t('customers.leadClose.followUpTitle', { name: getRowName(row) }),
            description: [labels.reasonLabel, form.note].filter(Boolean).join(' — '),
            type: 'follow_up',
            priority: 'medium',
            due_date: followUpAt,
            taskable_type: 'lead',
            taskable_id: String(leadId),
            users: owner ? [owner] : [],
          }, { currentUserId }))
        }
        done += 1
      } catch (error) {
        failed += 1
        failedRows.push(row)
        lastError = error
      }
    }
    setSubmitting(false)
    return { done, failed, failedRows, error: lastError }
  }

  return { submit, submitting }
}
