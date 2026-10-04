import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../shared/components/overlays/FormDialog'
import { createCloseForm, getLeadInterests, getLeadOpenDeal, getStatusReasons, getStatusesOfKind, isReasonRequired, validateCloseForm } from './leadClose'
import { CloseField, closeInputClass } from './CloseField'
import { FollowUpFields } from './FollowUpFields'
import { ReasonChips } from './ReasonChips'
import { WonFields } from './WonFields'

/**
 * Close a lead as a sale / lost, mark it for retargeting, or reopen it (`request` from useLeadCloseRequest:
 * `{ key, mode, rows, status, statuses }`). Bulk = several rows (no sale; adding to a deal is fine).
 */
export function LeadCloseDialog({ request, submitting, onCancel, onSubmit }) {
  const { t } = useTranslation()
  const mode = request?.mode
  const rows = useMemo(() => request?.rows || [], [request])
  const bulk = rows.length > 1
  const [form, setForm] = useState(() => createCloseForm(mode, request?.status))
  const [showErrors, setShowErrors] = useState(false)
  const [stage, setStage] = useState({ id: '', loading: false })

  // Reset only for a new request (`key`), not when a partial failure narrows its rows.
  const requestKey = request?.key
  useEffect(() => {
    if (!requestKey) return
    const next = createCloseForm(request.mode, request.status)
    // Several leads cannot be recorded as one sale: start on "add to a deal".
    setForm(request.mode === 'won' && request.rows?.length > 1 ? { ...next, target: 'deal' } : next)
    setShowErrors(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const choices = useMemo(() => (mode && mode !== 'reopen' ? getStatusesOfKind(request?.statuses, mode) : []), [mode, request])
  const status = useMemo(() => (request?.statuses || []).find((entry) => String(entry.id) === form.statusId) || request?.status || null, [form.statusId, request])
  const reasons = useMemo(() => getStatusReasons(status), [status])
  const reasonRequired = isReasonRequired(mode, status, reasons)
  const interests = useMemo(() => (bulk ? [] : getLeadInterests(rows[0])), [bulk, rows])
  const openDeal = useMemo(() => (bulk ? null : getLeadOpenDeal(rows[0])), [bulk, rows])
  const errors = validateCloseForm(form, { bulk, status, reasons, openDeal })
  const visibleErrors = showErrors ? errors : {}
  const err = (key) => (visibleErrors[key] ? t(`customers.leadClose.errors.${visibleErrors[key]}`) : null)
  const update = useCallback((patch) => setForm((current) => ({ ...current, ...(patch.statusId ? { reason: '' } : {}), ...patch })), [])
  const name = rows[0]?.lead?.name || rows[0]?.name || rows[0]?.lead?.phone || rows[0]?.phone || ''
  const toDeal = mode === 'won' && form.target === 'deal'
  // Adding to a deal waits for its first open stage, so leads never land without one.
  const blocked = (mode === 'won' && !toDeal && Boolean(errors.mode)) || (toDeal && stage.loading)

  const submit = () => {
    if (Object.keys(errors).length) {
      setShowErrors(true)
      return
    }
    onSubmit({ form, status, reasons, stageId: stage.id })
  }

  return (
    <FormDialog
      open={Boolean(request)}
      onClose={onCancel}
      onSubmit={submit}
      loading={submitting}
      submitDisabled={blocked}
      title={t(`customers.leadClose.titles.${mode || 'lost'}`)}
      description={bulk ? t(`customers.leadClose.bulkDescriptions.${mode || 'lost'}`, { count: rows.length }) : t(`customers.leadClose.descriptions.${mode || 'lost'}`, { name })}
      submitText={toDeal ? t('customers.leadClose.submit.deal') : t(`customers.leadClose.submit.${mode || 'lost'}`)}
      cancelText={t('customers.leadClose.cancel')}
      size="lg"
    >
      <div className="space-y-4">
        {mode === 'won' && bulk && !toDeal && <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">{t('customers.leadClose.errors.wonSingleOnly')}</p>}
        {choices.length > 1 && !toDeal && (
          <CloseField label={t('customers.leadClose.fields.status')} error={err('statusId')}>
            <select className={closeInputClass} value={form.statusId} onChange={(event) => update({ statusId: event.target.value })}>
              {choices.map((entry) => <option key={entry.id} value={String(entry.id)}>{entry.status || entry.name}</option>)}
            </select>
          </CloseField>
        )}
        {mode === 'won' && (
          <WonFields form={form} onChange={update} interests={interests} reasons={reasons} reasonRequired={reasonRequired} err={err} openDeal={openDeal} bulk={bulk} onStage={setStage} />
        )}
        {(mode === 'lost' || mode === 'retarget') && (
          <>
            {mode === 'retarget' && <p className="text-sm text-[var(--text-muted)]">{t('customers.leadClose.retargetHint')}</p>}
            <ReasonChips reasons={reasons} value={form.reason} onChange={(reason) => update({ reason })} required={reasonRequired} error={err('reason')} />
            <CloseField label={t('customers.leadClose.fields.note')} error={err('note')}>
              <textarea className={`${closeInputClass} h-20 py-2`} value={form.note} onChange={(event) => update({ note: event.target.value })} />
            </CloseField>
            <FollowUpFields form={form} onChange={update} err={err} required={mode === 'retarget'} />
          </>
        )}
        {mode === 'reopen' && (
          <>
            <p className="text-sm text-[var(--text-muted)]">{t('customers.leadClose.reopenHint', { status: request?.status?.status || request?.status?.name || '' })}</p>
            <CloseField label={t('customers.leadClose.fields.reopenNote')} error={err('note')}>
              <textarea className={`${closeInputClass} h-20 py-2`} value={form.note} onChange={(event) => update({ note: event.target.value })} />
            </CloseField>
          </>
        )}
        <p className="text-xs text-[var(--text-muted)]">{t('customers.leadClose.backendNote')}</p>
      </div>
    </FormDialog>
  )
}
