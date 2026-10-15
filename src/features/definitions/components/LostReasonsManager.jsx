import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Skeleton } from '../../../shared/components/feedback/Skeleton'
import { Button } from '../../../shared/components/ui/Button'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { useLostReasonMutations, useLostReasons } from '../hooks/useLostReasons'
import { buildLostReasonPayload, nextSortOrder } from '../utils/lostReasons'

const inputClass = 'h-9 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[#00C2CB] disabled:opacity-60'
const EMPTY = { name: '', description: '', code: '' }

/**
 * Lead lost reasons (2026-10-15): the tenant's list from `/definitions/lost-reasons`, managed from the "lost" status
 * (status dialog + lost status card). Add, rename, turn on / off and delete; changes save at once (no status save
 * needed). Offered by the lead "Lost" dialog and the lost status close dialog.
 */
export function LostReasonsManager() {
  const { t } = useTranslation()
  const query = useLostReasons()
  const mutations = useLostReasonMutations()
  const [draft, setDraft] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const reasons = query.data || []

  const run = async (promise, success) => {
    try {
      await promise
      toast.success(t(`customers.lostReasons.toasts.${success}`))
      return true
    } catch (error) {
      toast.error(extractMessage(error, t('customers.lostReasons.toasts.failed')))
      return false
    }
  }

  const add = async () => {
    if (!draft.name.trim()) return
    if (await run(mutations.create.mutateAsync(buildLostReasonPayload(draft, { nextOrder: nextSortOrder(reasons) })), 'created')) setDraft(EMPTY)
  }
  const save = async () => {
    if (!editing?.name.trim()) return
    const payload = buildLostReasonPayload(editing)
    if (await run(mutations.update.mutateAsync({ id: editing.id, payload }), 'updated')) setEditing(null)
  }
  const toggle = (reason) => run(mutations.update.mutateAsync({ id: reason.id, payload: buildLostReasonPayload({ ...reason, active: !reason.active }) }), 'updated')
  const remove = async () => {
    if (await run(mutations.remove.mutateAsync(deleting.id), 'deleted')) setDeleting(null)
  }
  const busy = mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending

  return (
    <section className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div>
        <h3 className="text-sm font-bold text-[var(--text)]">{t('customers.lostReasons.title')}</h3>
        <p className="text-xs text-[var(--text-muted)]">{t('customers.lostReasons.hint')}</p>
      </div>

      {query.isLoading && <Skeleton className="h-16 w-full" />}
      {query.error && (
        <div role="alert" className="flex items-center justify-between gap-2 text-xs text-[#EF4444]">
          {t('customers.lostReasons.loadFailed')}
          <Button type="button" size="sm" variant="outline" onClick={() => query.refetch()}>{t('customers.lostReasons.retry')}</Button>
        </div>
      )}
      {!query.isLoading && !query.error && reasons.length === 0 && (
        <p className="rounded-md border border-dashed border-[var(--border)] p-2 text-center text-xs text-[var(--text-muted)]">{t('customers.lostReasons.empty')}</p>
      )}

      {reasons.length > 0 && (
        <ul className="space-y-1.5">
          {reasons.map((reason) => (
            <li key={reason.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
              {editing?.id === reason.id ? (
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <input className={inputClass} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} aria-label={t('customers.lostReasons.name')} autoFocus />
                  <input className={inputClass} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} aria-label={t('customers.lostReasons.description')} placeholder={t('customers.lostReasons.description')} />
                  <div className="flex gap-1">
                    <Button type="button" size="sm" onClick={save} loading={mutations.update.isPending} aria-label={t('customers.lostReasons.save')}><Check size={14} /></Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)} aria-label={t('customers.lostReasons.cancel')}><X size={14} /></Button>
                  </div>
                </div>
              ) : (
                <div className="flex min-w-0 items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`truncate text-sm font-semibold ${reason.active ? 'text-[var(--text)]' : 'text-[var(--text-muted)] line-through'}`}>{reason.name}</span>
                      {reason.code && <span className="shrink-0 rounded bg-[var(--surface-2)] px-1.5 text-[10px] text-[var(--text-muted)]" dir="ltr">{reason.code}</span>}
                    </div>
                    {reason.description && reason.description !== reason.name && <p className="truncate text-xs text-[var(--text-muted)]">{reason.description}</p>}
                  </div>
                  <label className="flex shrink-0 items-center gap-1 text-xs text-[var(--text-muted)]">
                    <input type="checkbox" className="accent-[#00C2CB]" checked={reason.active} disabled={busy} onChange={() => toggle(reason)} />
                    {t('customers.lostReasons.active')}
                  </label>
                  <button type="button" disabled={busy} onClick={() => setEditing({ ...reason })} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label={t('customers.lostReasons.edit')} title={t('customers.lostReasons.edit')}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" disabled={busy} onClick={() => setDeleting(reason)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-600" aria-label={t('customers.lostReasons.delete')} title={t('customers.lostReasons.delete')}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input
          className={inputClass}
          value={draft.name}
          placeholder={t('customers.lostReasons.namePlaceholder')}
          aria-label={t('customers.lostReasons.name')}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
        />
        <input className={inputClass} value={draft.description} placeholder={t('customers.lostReasons.descriptionPlaceholder')} aria-label={t('customers.lostReasons.description')} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        <Button type="button" size="sm" className="h-9" onClick={add} loading={mutations.create.isPending} disabled={!draft.name.trim()}>
          <Plus size={14} />
          {t('customers.lostReasons.add')}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        type="danger"
        title={t('customers.lostReasons.deleteTitle')}
        message={t('customers.lostReasons.deleteMessage', { name: deleting?.name || '' })}
        confirmText={t('customers.lostReasons.delete')}
        loading={mutations.remove.isPending}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </section>
  )
}
