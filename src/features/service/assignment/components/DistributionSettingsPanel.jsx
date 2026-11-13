import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { assignmentApi } from '../api/assignmentApi'

const queryKey = ['service', 'assignment', 'distribution']
const strategies = ['round_robin_all', 'round_robin_online', 'working_hours', 'least_loaded', 'assignment_rules', 'unassigned']
const recordsOf = (value) => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : Array.isArray(value?.items) ? value.items : null
const buttonClass = 'inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50'
const fieldClass = 'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]'

export function DistributionSettingsPanel() {
  const { t } = useTranslation()
  const client = useQueryClient()
  const query = useQuery({ queryKey, queryFn: assignmentApi.distribution.list, retry: 1 })
  const rows = useMemo(() => recordsOf(query.data), [query.data])
  const types = useMemo(() => [...new Set((rows || []).map((row) => row.entity_type).filter(Boolean))].sort(), [rows])
  const [selectedType, setSelectedType] = useState('')
  const [form, setForm] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const activeType = types.includes(selectedType) ? selectedType : types[0] || 'ticket'
  const refresh = async () => {
    await client.invalidateQueries({ queryKey })
    await client.invalidateQueries({ queryKey: ['service', 'settings'] })
  }
  const create = useMutation({
    mutationFn: assignmentApi.distribution.create,
    onSuccess: async () => { setForm(null); await refresh() },
  })
  const remove = useMutation({
    mutationFn: assignmentApi.distribution.remove,
    onSuccess: async () => { setDeleting(null); await refresh() },
  })
  const openCreate = () => setForm({ entity_type: activeType, scope: '', strategy: 'round_robin_all', fallback_strategy: 'unassigned' })
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const submit = (event) => {
    event.preventDefault()
    create.mutate({
      entity_type: activeType,
      scope: form.scope.trim() || null,
      strategy: form.strategy,
      fallback_strategy: form.fallback_strategy,
    })
  }
  return <section className="grid gap-4 text-[var(--text)]">
    <header><h1 className="text-xl font-bold">{t('serviceAssignment.distribution')}</h1><p className="text-sm text-[var(--text-muted)]">{t('serviceAssignment.distributionDescription')}</p></header>
    {query.isPending && <p>{t('serviceAssignment.loading')}</p>}
    {query.isError && <div><p>{t('serviceAssignment.error')}</p><button type="button" className={buttonClass} onClick={() => query.refetch()}>{t('serviceAssignment.retry')}</button></div>}
    {query.isSuccess && rows === null && <p>{t('serviceAssignment.unrecognized')}</p>}
    {query.isSuccess && rows !== null && <>
      <div role="tablist" aria-label={t('serviceAssignment.entityType')} className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        {(types.length ? types : ['ticket']).map((type) => <button key={type} type="button" role="tab" aria-selected={activeType === type} onClick={() => setSelectedType(type)} className={`rounded-lg border px-3 py-2 text-sm ${activeType === type ? 'border-[var(--text)] bg-[var(--surface-2)] font-semibold' : 'border-[var(--border)]'}`}>{type} ({rows.filter((row) => row.entity_type === type).length})</button>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-medium">{activeType}</span><button type="button" className={buttonClass} onClick={openCreate}><Plus size={16} aria-hidden="true" />{t('serviceAssignment.addDistribution')}</button></div>
      <div role="tabpanel" className="grid gap-3">
        {rows.filter((row) => row.entity_type === activeType).length === 0 && <p className="text-sm text-[var(--text-muted)]">{t('serviceAssignment.empty')}</p>}
        {rows.filter((row) => row.entity_type === activeType).map((row) => <article key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div><h2 className="font-semibold">{row.strategy}</h2><p className="text-xs text-[var(--text-muted)]">{t('serviceAssignment.scope')}: {row.scope ?? '—'} · {t('serviceAssignment.fallbackStrategy')}: {row.fallback_strategy ?? '—'} · {row.active === false ? t('serviceAssignment.inactive') : t('serviceAssignment.active')}</p></div>
          <button type="button" className={buttonClass} onClick={() => setDeleting(row)}>{t('serviceAssignment.delete')}</button>
        </article>)}
      </div>
    </>}
    <AppDrawer open={Boolean(form)} onClose={() => { if (!create.isPending) setForm(null) }} title={t('serviceAssignment.addDistribution')} size="lg" drawerKey="service-distribution-create" portal pushPage={false}>
      {form && <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-1 text-sm"><span>{t('serviceAssignment.entityType')}</span><div className={fieldClass}>{form.entity_type}</div></div>
        <label className="grid gap-1 text-sm"><span>{t('serviceAssignment.scope')}</span><input className={fieldClass} value={form.scope} onChange={(event) => setField('scope', event.target.value)} placeholder="category_key" /></label>
        {[
          ['strategy', 'strategy'],
          ['fallback_strategy', 'fallbackStrategy'],
        ].map(([field, label]) => <label key={field} className="grid gap-1 text-sm"><span>{t(`serviceAssignment.${label}`)}</span><select className={fieldClass} value={form[field]} onChange={(event) => setField(field, event.target.value)}>{strategies.map((strategy) => <option key={strategy} value={strategy}>{strategy}</option>)}</select></label>)}
        {create.isError && <p role="alert" className="text-sm text-red-500">{t('serviceAssignment.saveError')}</p>}
        <div className="flex gap-2"><button disabled={create.isPending} type="submit" className={buttonClass}>{t('serviceAssignment.save')}</button><button type="button" className={buttonClass} onClick={() => setForm(null)}>{t('serviceAssignment.cancel')}</button></div>
      </form>}
    </AppDrawer>
    <AppDrawer open={Boolean(deleting)} onClose={() => { if (!remove.isPending) setDeleting(null) }} title={t('serviceAssignment.deleteDistribution')} size="sm" drawerKey="service-distribution-delete" portal pushPage={false}>
      <p className="mb-4 text-sm">{t('serviceAssignment.deleteConfirmation')}</p>
      {remove.isError && <p role="alert" className="mb-3 text-sm text-red-500">{t('serviceAssignment.deleteError')}</p>}
      <div className="flex gap-2"><button disabled={remove.isPending} type="button" className={buttonClass} onClick={() => remove.mutate(deleting.id)}>{t('serviceAssignment.delete')}</button><button type="button" className={buttonClass} onClick={() => setDeleting(null)}>{t('serviceAssignment.cancel')}</button></div>
    </AppDrawer>
  </section>
}
