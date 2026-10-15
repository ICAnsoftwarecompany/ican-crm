import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { cn } from '../../../../shared/utils/cn'
import { useLostReasons } from '../../../definitions'
import { LOST_REASONS } from '../../constants/dealOptions'
import { getDealPagePath } from '../../constants/dealWorkspacePages'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { buildDealLostPayload } from '../../utils/dealLostReason'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'

/**
 * "Mark as lost" (`POST /deals/leads/{id}/lost`). With lost reasons defined for the company (Definitions, managed in the
 * deal settings), one of them is required and sent as `lost_reason_id` (+ its fixed `reason` key — utils/dealLostReason);
 * without any, the backend's fixed list is offered. Only open leads can be closed.
 */
export function LostDialog({ dealId, lead, open, onClose, onLost }) {
  const { t } = useTranslation()
  const reasonsQuery = useLostReasons({ activeOnly: true, enabled: open })
  const reasons = reasonsQuery.data || []
  const defined = reasons.length > 0
  const [reasonId, setReasonId] = useState('')
  const [reasonKey, setReasonKey] = useState('price')
  const [showError, setShowError] = useState(false)
  const [serverError, setServerError] = useState('')
  const { markLost } = useDealLeadMutations(dealId)

  useEffect(() => {
    if (open) {
      setReasonId('')
      setReasonKey('price')
      setShowError(false)
      setServerError('')
    }
  }, [open])

  const submit = async () => {
    if (!lead) return
    if (defined && !reasonId) {
      setShowError(true)
      return
    }
    setServerError('')
    try {
      await markLost.mutateAsync({ dealLeadId: lead.id, ...buildDealLostPayload({ reasonId: defined ? reasonId : '', reasonKey, reasons }) })
      toast.success(t('dealWorkspace.closing.lost.success'))
      onLost?.()
      onClose()
    } catch (error) {
      setServerError(extractMessage(error, t('dealWorkspace.closing.lost.failed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      size="sm"
      loading={markLost.isPending}
      submitDisabled={reasonsQuery.isLoading}
      title={t('dealWorkspace.closing.lost.title')}
      description={lead ? t('dealWorkspace.closing.lost.description', { name: lead.name || `#${lead.id}` }) : ''}
      submitText={t('dealWorkspace.closing.lost.submit')}
    >
      <div className="space-y-3">
        {serverError && <ModuleNotice tone="warning">{serverError}</ModuleNotice>}
        <p className="rounded-md bg-[var(--surface-2)] px-3 py-2 text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.closing.lost.scopeNote')}</p>
        {reasonsQuery.isLoading && <Skeleton className="h-20 w-full" />}

        {!reasonsQuery.isLoading && defined && (
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium text-[var(--text)]">{t('dealWorkspace.closing.lost.reason')} <span className="text-red-600">*</span></legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {reasons.map((reason) => {
                const active = String(reason.id) === reasonId
                return (
                  <button
                    key={reason.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    title={reason.description && reason.description !== reason.name ? reason.description : undefined}
                    onClick={() => { setReasonId(String(reason.id)); setShowError(false) }}
                    className={cn('rounded-full border px-3 py-1.5 text-sm', active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] font-semibold text-[var(--brand-accent)]' : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]')}
                  >
                    {reason.name}
                  </button>
                )
              })}
            </div>
            {showError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{t('dealWorkspace.closing.lost.reasonRequired')}</p>}
          </fieldset>
        )}

        {!reasonsQuery.isLoading && !defined && (
          <>
            {reasonsQuery.error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{t('dealWorkspace.lostReasons.loadFailed')}</p>}
            <FieldLabel label={t('dealWorkspace.closing.lost.reason')}>
              <select className={dealInputClass} value={reasonKey} onChange={(event) => setReasonKey(event.target.value)}>
                {LOST_REASONS.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.lostReason.${value}`)}</option>)}
              </select>
            </FieldLabel>
          </>
        )}

        {!reasonsQuery.isLoading && (
          <p className="text-xs text-[var(--text-muted)]">
            {t(defined ? 'dealWorkspace.lostReasons.manageHint' : 'dealWorkspace.lostReasons.noneDefined')}{' '}
            <Link to={`${getDealPagePath(dealId, 'settings')}?section=lostReasons`} onClick={onClose} className="font-semibold text-[var(--brand-accent)] hover:underline">{t('dealWorkspace.lostReasons.manage')}</Link>
          </p>
        )}
      </div>
    </FormDialog>
  )
}
