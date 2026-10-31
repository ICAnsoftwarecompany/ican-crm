import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { LeadCloseDialog } from './LeadCloseDialog'
import { resolveCloseMode } from './leadClose'
import { useLeadClose } from './useLeadClose'
import { LeadWonDialog } from '../outcome/components/LeadWonDialog'
import { LeadLostDialog } from '../outcome/components/LeadLostDialog'

/**
 * One interception point for every Leads Center status change. Call `interceptStatusChange(...)` before a
 * plain change: when the move is a sale / lost / retarget or a reopen it opens the close dialog and returns true
 * (the caller stops there); otherwise false (the caller does its usual change). Render `dialog` once.
 *
 * `getOldStatus(row)` gives each row's current status (with its kind flags); `statuses` are the lead statuses.
 */
export function useLeadCloseRequest({ statuses = [], getOldStatus } = {}) {
  const { t } = useTranslation()
  const { submit, submitting } = useLeadClose()
  const [request, setRequest] = useState(null)
  const completedWonRef = useRef(false)
  const wonProgressRef = useRef({ done: 0, status: null })

  const interceptStatusChange = useCallback(({ rows, status, onDone }) => {
    const list = (Array.isArray(rows) ? rows : [rows]).filter(Boolean)
    if (!list.length || !status) return false
    const modes = list.map((row) => resolveCloseMode(getOldStatus?.(row), status))
    const mode = modes.find((value) => value && value !== 'reopen') || (modes.includes('reopen') ? 'reopen' : null)
    if (!mode) return false
    completedWonRef.current = false
    wonProgressRef.current = { done: 0, status: null }
    setRequest({ key: `${Date.now()}-${status.id}`, mode, rows: list, status, statuses, onDone })
    return true
  }, [getOldStatus, statuses])

  const handleSubmit = async ({ form, status, reasons, stageId }) => {
    const result = await submit({ rows: request.rows, form, status, reasons, stageId, getOldStatus })
    const toastKey = form.mode === 'won' && form.target === 'deal' ? 'deal' : form.mode
    if (result.done) {
      toast.success(t(`customers.leadClose.toasts.${toastKey}`, { count: result.done }))
      request.onDone?.({ status, mode: form.mode, done: result.done })
    }
    if (result.failed) toast.error(extractMessage(result.error, t('customers.leadClose.toasts.failed', { count: result.failed })))
    // Keep only the leads that failed, so a retry never closes the others twice.
    if (result.failed) setRequest((current) => ({ ...current, rows: result.failedRows }))
    else setRequest(null)
  }

  const dialog = request?.mode === 'won' ? (
    <LeadWonDialog
      key={`${request.key}-${request.rows[0]?.lead_id ?? request.rows[0]?.lead?.id ?? request.rows[0]?.id}`}
      open
      customer={request.rows[0]}
      initialSaleStatusId={request.status.id}
      onDone={({ status }) => {
        completedWonRef.current = true
        wonProgressRef.current = { done: wonProgressRef.current.done + 1, status }
      }}
      onClose={() => {
        const completed = completedWonRef.current
        completedWonRef.current = false
        const hasNext = completed && request.rows.length > 1
        setRequest((current) => hasNext ? { ...current, rows: current.rows.slice(1) } : null)
        if (!hasNext && wonProgressRef.current.done) request.onDone?.({ ...wonProgressRef.current, mode: 'won' })
      }}
    />
  ) : request?.mode === 'lost' ? (
    <LeadLostDialog
      key={request.key}
      open
      customers={request.rows}
      initialLostStatusId={request.status.id}
      onClose={() => setRequest(null)}
      onDone={({ status, done }) => request.onDone?.({ status, mode: 'lost', done })}
    />
  ) : (
    <LeadCloseDialog request={request} submitting={submitting} onCancel={() => !submitting && setRequest(null)} onSubmit={handleSubmit} />
  )

  return { interceptStatusChange, dialog, isClosing: submitting }
}
