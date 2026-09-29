import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { TEXTAREA_CLASS } from '../../settings/components/fields/ResourceField'
import { useCaseSetup } from '../../cases/hooks/useCases'
import { useRecordsSetup } from '../../records/hooks/useRecords'
import { useHandoff, useHandoffMutations } from '../api/handoffsApi'
import { HANDOFF_STATUS_TONE, entityPath } from './HandoffStatus'

function Section({ title, children }) {
  return (
    <section className="grid content-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  )
}

/** Handoff: what the sale created, what needs review, checklist, promises, then accept or reject. */
export function HandoffDetailView({ handoffId, backTo, contractPath }) {
  const { t, i18n } = useTranslation()
  const handoff = useHandoff(handoffId)
  const setup = useCaseSetup()
  const records = useRecordsSetup()
  const { update, action } = useHandoffMutations(handoffId)
  const [dialog, setDialog] = useState(null)
  const [owner, setOwner] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const item = handoff.data
  const language = i18n.language
  const open = item && ['pending', 'needs_review'].includes(item.status)
  const recordTypeKeyOf = () => records.data?.record_types?.[0]?.key

  useEffect(() => setNotes(item?.notes || ''), [item?.notes])

  const patch = (payload) => update.mutate({ version: item.version, ...payload })

  return (
    <div className="grid gap-4">
      <Link to={backTo} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.handoffs.back')}
      </Link>
      <ResourceState isLoading={handoff.isLoading} error={handoff.error} onRetry={handoff.refetch}>
        {item && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <p className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  {contractPath && item.contract ? <Link to={contractPath(item.contract)} dir="ltr" className="font-mono underline">{item.contract.contract_number}</Link> : null}
                  <span className={cn('font-semibold', HANDOFF_STATUS_TONE[item.status])}>{t(`service.handoffs.statuses.${item.status}`)}</span>
                </p>
                <h1 className="text-lg font-bold text-[var(--text)]">{item.customer?.name}</h1>
                <p className="text-xs text-[var(--text-muted)]">{t('service.handoffs.owners', { sales: item.sales_owner?.name || '—', service: item.cs_owner?.name || t('service.cases.unassigned') })}</p>
              </div>
              {open && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setReason(''); setDialog('reject') }}>{t('service.handoffs.reject')}</Button>
                  <Button disabled={item.errors.length > 0} title={item.errors.length ? t('service.handoffs.resolveFirst') : undefined} onClick={() => { setOwner(''); setDialog('accept') }}>{t('service.handoffs.accept')}</Button>
                </div>
              )}
            </header>

            {item.errors.length > 0 && (
              <section className="grid gap-2 rounded-lg border border-sla-at-risk bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-sla-at-risk"><TriangleAlert size={16} aria-hidden="true" />{t('service.handoffs.needsReviewTitle')}</h2>
                  <Button size="sm" variant="outline" loading={action.isPending && action.variables?.action === 'reprocess'} onClick={() => action.mutate({ action: 'reprocess', version: item.version })}>
                    <RefreshCw size={14} aria-hidden="true" />
                    {t('service.handoffs.reprocess')}
                  </Button>
                </div>
                <ul className="grid gap-1 text-sm">
                  {item.errors.map((error) => (
                    <li key={error.line_id} className="text-[var(--text)]">
                      {localizeLabel(error.item, language, '')} — {t(`service.handoffs.errors.${error.code}`, { defaultValue: error.code })}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-[var(--text-muted)]">{t('service.handoffs.reviewHint')}</p>
              </section>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Section title={t('service.handoffs.created')}>
                {!item.created_entities.length && <p className="text-xs text-[var(--text-muted)]">{t('service.handoffs.nothingCreated')}</p>}
                <ul className="divide-y divide-[var(--border)]">
                  {item.created_entities.map((entity) => {
                    const path = entityPath(entity, { recordTypeKeyOf })
                    const label = `${t(`service.catalog.creates.${entity.type}`, { defaultValue: t(`service.handoffs.entities.${entity.type}`, { defaultValue: entity.type }) })} · ${localizeLabel(entity.label, language, '')}`
                    return (
                      <li key={`${entity.type}-${entity.id}`} className="py-2 text-sm">
                        {path ? <Link to={path} className="text-[var(--text)] underline">{label}</Link> : <span className="text-[var(--text)]">{label}</span>}
                      </li>
                    )
                  })}
                </ul>
                {item.amendments_applied?.length > 0 && <p className="text-xs text-[var(--text-muted)]">{t('service.handoffs.amendmentsApplied', { count: item.amendments_applied.length })}</p>}
              </Section>

              <Section title={t('service.handoffs.checklist')}>
                <ul className="grid gap-2">
                  {item.checklist.map((entry) => (
                    <li key={entry.key}>
                      <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
                        <input type="checkbox" className="accent-[var(--brand-accent)]" checked={entry.done} disabled={update.isPending} onChange={(event) => patch({ checklist: item.checklist.map((row) => (row.key === entry.key ? { ...row, done: event.target.checked } : row)) })} />
                        {localizeLabel(entry.label, language, entry.key)}
                      </label>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title={t('service.handoffs.promises')}>
                {!item.promises.length && <p className="text-xs text-[var(--text-muted)]">{t('service.handoffs.noPromises')}</p>}
                <ul className="grid gap-2">
                  {item.promises.map((promise) => (
                    <li key={promise.id}>
                      <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
                        <input type="checkbox" className="accent-[var(--brand-accent)]" checked={promise.done} onChange={(event) => patch({ promises: item.promises.map((row) => (row.id === promise.id ? { ...row, done: event.target.checked } : row)) })} />
                        <bdi>{promise.text}</bdi>
                      </label>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title={t('service.handoffs.notes')}>
                <textarea dir="auto" className={TEXTAREA_CLASS} value={notes} onChange={(event) => setNotes(event.target.value)} aria-label={t('service.handoffs.notes')} />
                <Button size="sm" variant="outline" className="w-fit" disabled={notes === (item.notes || '')} loading={update.isPending} onClick={() => patch({ notes })}>{t('service.settings.actions.save')}</Button>
              </Section>
            </div>

            <FormDialog open={dialog === 'accept'} onClose={() => setDialog(null)} title={t('service.handoffs.accept')} description={t('service.handoffs.acceptDescription')} submitText={t('service.handoffs.accept')} submitDisabled={!owner} loading={action.isPending} onSubmit={() => action.mutate({ action: 'accept', version: item.version, cs_owner_id: owner }, { onSuccess: () => setDialog(null) })}>
              <Select label={t('service.handoffs.csOwner')} value={owner} onChange={setOwner} options={(setup.data?.agents || []).map((agent) => ({ value: agent.id, label: agent.name }))} />
            </FormDialog>
            <FormDialog open={dialog === 'reject'} onClose={() => setDialog(null)} title={t('service.handoffs.reject')} description={t('service.handoffs.rejectDescription')} submitText={t('service.handoffs.reject')} submitDisabled={!reason.trim()} loading={action.isPending} onSubmit={() => action.mutate({ action: 'reject', version: item.version, reason }, { onSuccess: () => setDialog(null) })}>
              <Input label={t('service.entitlements.reason')} dir="auto" value={reason} onChange={(event) => setReason(event.target.value)} />
            </FormDialog>
          </>
        )}
      </ResourceState>
    </div>
  )
}
