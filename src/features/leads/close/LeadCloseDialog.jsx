import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../shared/components/overlays/FormDialog'
import { createCloseForm, getLeadInterests, getStatusesOfKind, validateCloseForm } from './leadClose'
import { CloseField, closeInputClass } from './CloseField'
import { LostFields } from './LostFields'
import { WonFields } from './WonFields'

/**
 * Close a lead as won / lost, or reopen a closed one (`request` from useLeadCloseRequest:
 * `{ mode, rows, status, statuses }`). Bulk = several rows (lost or reopen only).
 */
export function LeadCloseDialog({ request, submitting, onCancel, onSubmit }) {
  const { t } = useTranslation()
  const mode = request?.mode
  const rows = request?.rows || []
  const bulk = rows.length > 1
  const [form, setForm] = useState(() => createCloseForm(mode, request?.status))
  const [showErrors, setShowErrors] = useState(false)

  // Reset only for a new request (`key`), not when a partial failure narrows its rows.
  const requestKey = request?.key
  useEffect(() => {
    if (!requestKey) return
    setForm(createCloseForm(request.mode, request.status))
    setShowErrors(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const choices = useMemo(() => (mode === 'won' || mode === 'lost' ? getStatusesOfKind(request?.statuses, mode) : []), [mode, request])
  const interests = useMemo(() => (bulk ? [] : getLeadInterests(rows[0])), [bulk, rows])
  const errors = validateCloseForm(form, { bulk })
  const visibleErrors = showErrors ? errors : {}
  const err = (key) => (visibleErrors[key] ? t(`customers.leadClose.errors.${visibleErrors[key]}`) : null)
  const update = (patch) => setForm((current) => ({ ...current, ...patch }))
  const name = rows[0]?.lead?.name || rows[0]?.name || rows[0]?.lead?.phone || rows[0]?.phone || ''

  const submit = () => {
    if (Object.keys(errors).length) {
      setShowErrors(true)
      return
    }
    const status = (request?.statuses || []).find((entry) => String(entry.id) === form.statusId) || request?.status
    onSubmit({ form, status })
  }

  return (
    <FormDialog
      open={Boolean(request)}
      onClose={onCancel}
      onSubmit={submit}
      loading={submitting}
      submitDisabled={errors.mode === 'wonSingleOnly'}
      title={t(`customers.leadClose.titles.${mode || 'lost'}`)}
      description={bulk ? t('customers.leadClose.bulkDescription', { count: rows.length }) : t(`customers.leadClose.descriptions.${mode || 'lost'}`, { name })}
      submitText={t(`customers.leadClose.submit.${mode || 'lost'}`)}
      cancelText={t('customers.leadClose.cancel')}
      size="lg"
    >
      <div className="space-y-4">
        {errors.mode === 'wonSingleOnly' && <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">{t('customers.leadClose.errors.wonSingleOnly')}</p>}
        {choices.length > 1 && (
          <CloseField label={t('customers.leadClose.fields.status')} error={err('statusId')}>
            <select className={closeInputClass} value={form.statusId} onChange={(event) => update({ statusId: event.target.value })}>
              {choices.map((status) => <option key={status.id} value={String(status.id)}>{status.status || status.name}</option>)}
            </select>
          </CloseField>
        )}
        {mode === 'lost' && <LostFields form={form} onChange={update} errors={visibleErrors} err={err} />}
        {mode === 'won' && !bulk && <WonFields form={form} onChange={update} interests={interests} err={err} />}
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
