import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { dealLeadsApi, dealKeys } from '../../deals'
import { buildTaskPayload, useCurrentUserId, useTaskMutations } from '../../tasks'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { formatDateTimeForApi } from '../../../shared/utils/dateTime'
import { useLeadMutations } from '../hooks/useLeads'
import { buildLeadClosePayload, resolveFollowUpDate } from './leadClose'

export const getRowLeadId = (row) => row?.lead_id ?? row?.lead?.id ?? null
const getRowName = (row) => row?.lead?.name || row?.name || row?.lead?.phone || row?.phone || ''

/** Label of a reason: its own label (backend list) or the translated default key. */
export function useReasonLabel() {
  const { t } = useTranslation()
  return (reason) => (reason ? reason.label || t(`customers.leadClose.reasons.${reason.key}`, reason.key) : '')
}

/**
 * Sends a close / retarget / reopen for one lead or many: one saveAction per lead (same endpoint as every status
 * change), then — when a follow-up date is set — one follow-up task per lead, linked to the lead and assigned to
 * its owner (or the current user). "Add to a deal instead" (sale path) adds every lead to the chosen deal in one
 * request and does not change their status. Returns `{ done, failed, failedRows, error }`; never throws.
 */
export function useLeadClose() {
  const { t } = useTranslation()
  const client = useQueryClient()
  const leadMutations = useLeadMutations()
  const taskMutations = useTaskMutations()
  const currentUserId = useCurrentUserId()
  const reasonLabel = useReasonLabel()
  const [submitting, setSubmitting] = useState(false)

  const addToDeal = async ({ rows, form, stageId }) => {
    const leadIds = rows.map(getRowLeadId).filter((id) => id !== null && id !== undefined)
    try {
      await dealLeadsApi.addExisting({
        deal_id: Number(form.dealId) || form.dealId,
        lead_ids: leadIds.map((id) => Number(id) || id),
        ...(stageId ? { stage_id: Number(stageId) || stageId } : {}),
      })
      client.invalidateQueries({ queryKey: dealKeys.all })
      client.invalidateQueries({ queryKey: QUERY_KEYS.customers.all })
      return { done: leadIds.length, failed: rows.length - leadIds.length, failedRows: rows.filter((row) => !getRowLeadId(row)), error: null }
    } catch (error) {
      return { done: 0, failed: rows.length, failedRows: rows, error }
    }
  }

  const submit = async ({ rows, form, status, reasons = [], stageId, getOldStatus }) => {
    setSubmitting(true)
    if (form.mode === 'won' && form.target === 'deal') {
      const result = await addToDeal({ rows, form, stageId })
      setSubmitting(false)
      return result
    }
    const statusTitle = status?.status || status?.name || ''
    const reason = reasons.find((entry) => entry.key === form.reason)
    const labels = {
      title: t(`customers.leadClose.activity.${form.mode}`, { status: statusTitle }),
      description: t(`customers.leadClose.activity.${form.mode}`, { status: statusTitle }),
      reasonLabel: reasonLabel(reason),
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
          reasons,
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
