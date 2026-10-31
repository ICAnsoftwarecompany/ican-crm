import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { cn } from '../../../../shared/utils/cn'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useLostReasons } from '../../../definitions'
import { definitionsApi } from '../../../definitions/api/definitionsApi'
import { QUERY_KEYS } from '../../../../shared/constants/queryKeys'
import { leadsApi } from '../../api/leadsApi'
import { useLeadOutcome } from '../hooks/useLeadOutcome'
import { buildLostPayload, leadIdOf, leadNameOf } from '../utils/leadOutcome'

const textareaClass = 'w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[#00C2CB]'

/**
 * Mark one or several leads as lost (2026-10-15): reason from the tenant's lost reasons (Definitions → the "lost"
 * status), note; `POST /leads/{id}/lost` per lead. With reasons defined, one is required; without any, the dialog
 * says where to define them and lets the user continue with a note.
 */
export function LeadLostDialog({ open, customers = [], onClose, onDone, initialLostStatusId }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const statusesQuery = useQuery({ queryKey: [...QUERY_KEYS.statuses.list, undefined], queryFn: () => definitionsApi.getStatuses(), enabled: open })
  const lostStatuses = useMemo(() => {
    const payload = statusesQuery.data?.data ?? statusesQuery.data
    const statuses = Array.isArray(payload?.lead) ? payload.lead : Array.isArray(payload) ? payload : []
    return statuses.filter((status) => (status.type || 'lead') === 'lead' && Number(status.is_lost) === 1 && Number(status.active ?? 1) === 1)
      .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0))
  }, [statusesQuery.data])
  const reasonsQuery = useLostReasons({ activeOnly: true, enabled: open })
  const { markLost } = useLeadOutcome()
  const [reasonId, setReasonId] = useState('')
  const [note, setNote] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusId, setStatusId] = useState('')
  const [serverError, setServerError] = useState('')
  const recordedLosses = useRef(new Map())
  const completedLeads = useRef(new Set())
  const selectedStatus = lostStatuses.length === 1 ? lostStatuses[0] : lostStatuses.find((status) => String(status.id) === String(statusId))
  const locked = saving || recordedLosses.current.size > 0
  const reasons = reasonsQuery.data || []
  const leads = customers.map((row) => ({ row, leadId: leadIdOf(row) })).filter((item) => item.leadId !== null)
  const bulk = customers.length > 1
  const reasonMissing = reasons.length > 0 && !reasonId

  useEffect(() => {
    if (!open) return
    setReasonId('')
    setNote('')
    setShowErrors(false)
    setStatusId(initialLostStatusId == null ? '' : String(initialLostStatusId))
    setServerError('')
    recordedLosses.current.clear()
    completedLeads.current.clear()
  }, [open, initialLostStatusId])

  const submit = async () => {
    if (saving) return
    if (reasonMissing || !selectedStatus || reasonsQuery.isLoading || reasonsQuery.isError || statusesQuery.isLoading || statusesQuery.isError) {
      setShowErrors(true)
      return
    }
    setSaving(true)
    setServerError('')
    const payload = buildLostPayload({ reasonId, note })
    const failed = []
    let lastError = null
    for (const { leadId, row } of leads) {
      if (completedLeads.current.has(String(leadId))) continue
      try {
        if (!recordedLosses.current.has(String(leadId))) {
          const previous = row?.lead?.status ?? row?.status
          const previousId = row?.lead?.status_type_id ?? row?.status_type_id
          const definitions = statusesQuery.data?.data?.lead || []
          const oldTitle = typeof previous === 'string' ? previous : previous?.status || previous?.name || definitions.find((status) => String(status.id) === String(previousId))?.status || ''
          await markLost.mutateAsync({ leadId, payload })
          recordedLosses.current.set(String(leadId), { previousId, oldTitle })
        }
        const snapshot = recordedLosses.current.get(String(leadId))
        const now = new Date()
        const pad = (value) => String(value).padStart(2, '0')
        const activityAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
        await leadsApi.saveAction({
          lead_id: leadId,
          action: 'create_activity',
          type: 'status_change',
          title: t('customers.lostStatusSync.activityTitle'),
          description: t('customers.lostStatusSync.activityDescription', { name: leadNameOf(row), status: selectedStatus.status || selectedStatus.name }),
          note: payload.note,
          new_status_id: selectedStatus.id,
          new_status_title: selectedStatus.status || selectedStatus.name || '',
          old_status_title: snapshot.oldTitle,
          activity_at: activityAt,
          data: { source: 'lead_center_lost', close_type: 'lost', customer_id: row.id, lead_id: leadId, ...payload, reason_name: reasons.find((reason) => String(reason.id) === String(reasonId))?.name || '', old_status_id: snapshot.previousId ?? null, new_status_id: selectedStatus.id, deal_id: row?.lead?.deal?.deal_id ?? null },
        })
        completedLeads.current.add(String(leadId))
      } catch (error) {
        failed.push(leadId)
        lastError = error
      }
    }
    setSaving(false)
    const saved = completedLeads.current.size
    if (failed.length) {
      setServerError(t('customers.lostStatusSync.partialFailure', { saved, failed: failed.length, error: extractMessage(lastError, t('customers.leadOutcome.lost.failed')) }))
      return
    }
    await Promise.all(['customers', 'leads', 'deals'].map((key) => queryClient.invalidateQueries({ queryKey: [key] })))
    toast.success(bulk ? t('customers.leadOutcome.lost.bulkSuccess', { count: saved }) : t('customers.leadOutcome.lost.success'))
    onDone?.({ status: selectedStatus, done: completedLeads.current.size })
    onClose?.()
  }

  return (
    <FormDialog
      open={open}
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={false}
      closeOnEscape={false}
      showCancel={false}
      onSubmit={submit}
      loading={saving}
      submitDisabled={!leads.length || reasonsQuery.isLoading || reasonsQuery.isError || statusesQuery.isLoading || statusesQuery.isError}
      title={t('customers.leadOutcome.lost.title')}
      description={bulk ? t('customers.leadOutcome.lost.bulkDescription', { count: leads.length }) : t('customers.leadOutcome.lost.description', { name: leadNameOf(customers[0]) })}
      submitText={t('customers.leadOutcome.lost.submit')}
    >
      {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{serverError}</p>}
      <div className="space-y-2">
        <label htmlFor="lead-lost-status" className="text-sm font-medium text-[var(--text)]">{t('customers.lostStatusSync.label')}</label>
        {statusesQuery.isLoading ? <Skeleton className="h-9 w-full" /> : statusesQuery.isError ? <button type="button" onClick={() => statusesQuery.refetch()} className="text-sm text-red-600">{t('common.retry')}</button> : lostStatuses.length === 1 ? <p className="text-sm font-semibold text-[var(--text)]">{lostStatuses[0].status || lostStatuses[0].name}</p> : <select id="lead-lost-status" value={statusId} onChange={(event) => setStatusId(event.target.value)} disabled={locked} className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"><option value="">{t('customers.lostStatusSync.choose')}</option>{lostStatuses.map((status) => <option key={status.id} value={status.id}>{status.status || status.name}</option>)}</select>}
        {!statusesQuery.isLoading && !statusesQuery.isError && !lostStatuses.length && <p role="alert" className="text-xs text-red-600">{t('customers.lostStatusSync.noStatuses')}</p>}
        {showErrors && !selectedStatus && <p role="alert" className="text-xs text-red-600">{t('customers.lostStatusSync.required')}</p>}
      </div>
      {customers.length > leads.length && (
        <p className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">{t('customers.leadOutcome.skippedNoLead', { count: customers.length - leads.length })}</p>
      )}

      <fieldset disabled={locked}>
        <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">
          {t('customers.leadOutcome.lost.reason')}{reasons.length > 0 && <span className="text-[#EF4444]"> *</span>}
        </legend>
        {reasonsQuery.isLoading && <Skeleton className="h-9 w-full" />}
        {reasonsQuery.error && <p role="alert" className="text-xs text-[#EF4444]">{t('customers.lostReasons.loadFailed')}</p>}
        {!reasonsQuery.isLoading && !reasonsQuery.error && reasons.length === 0 && (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-muted)]">
            {t('customers.leadOutcome.lost.noReasons')}{' '}
            <a href="/LeadsCenter/customization" target="_blank" rel="noreferrer" className="font-bold text-[#00A3AA] hover:underline">{t('customers.leadOutcome.lost.defineReasons')}</a>
          </p>
        )}
        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5" role="radiogroup">
            {reasons.map((reason) => {
              const active = String(reason.id) === reasonId
              return (
                <button
                  key={reason.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={reason.description !== reason.name ? reason.description : undefined}
                  onClick={() => setReasonId(String(reason.id))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    active ? 'border-[#EF4444] bg-red-50 font-bold text-red-700 dark:bg-red-950/40 dark:text-red-200' : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]'
                  )}
                >
                  {reason.name}
                </button>
              )
            })}
          </div>
        )}
        {showErrors && reasonMissing && <p role="alert" className="mt-1 text-xs text-[#EF4444]">{t('customers.leadOutcome.lost.reasonRequired')}</p>}
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--text)]">{t('customers.leadOutcome.note')}</span>
        <textarea rows={3} disabled={locked} className={textareaClass} value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('customers.leadOutcome.lost.notePlaceholder')} />
      </label>
    </FormDialog>
  )
}
