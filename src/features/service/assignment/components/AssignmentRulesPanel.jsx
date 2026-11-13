import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { assignmentApi } from '../api/assignmentApi'

const queryKey = ['service', 'assignment', 'rules']
const emptyRule = (type) => ({ name: '', entity_type: type || 'ticket', conditions: null, assign_type: 'round_robin', team_id: null, user_id: null, priority: 10, timeout_minutes: null, active: true })
const recordsOf = (value) => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : Array.isArray(value?.items) ? value.items : []
const numberOrNull = (value) => value === '' || value === null || value === undefined ? null : Number(value)

export function AssignmentRulesPanel() {
  const { t } = useTranslation()
  const client = useQueryClient()
  const query = useQuery({ queryKey, queryFn: assignmentApi.rules.list, retry: 1 })
  const rows = useMemo(() => recordsOf(query.data), [query.data])
  const types = useMemo(() => [...new Set(rows.map((row) => row.entity_type).filter(Boolean))].sort(), [rows])
  const [selectedType, setSelectedType] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [conditionsText, setConditionsText] = useState('')
  const [formError, setFormError] = useState('')
  const activeType = types.includes(selectedType) ? selectedType : types[0] || 'ticket'
  const mutation = useMutation({
    mutationFn: ({ id, payload }) => id ? assignmentApi.rules.update(id, payload) : assignmentApi.rules.create(payload),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey })
      await client.invalidateQueries({ queryKey: ['service', 'settings'] })
      setForm(null)
      setEditing(null)
    },
  })
  const openForm = (row) => {
    setEditing(row?.id ?? null)
    setForm(row ? { ...row } : emptyRule(activeType))
    setConditionsText(row?.conditions ? JSON.stringify(row.conditions, null, 2) : '')
    setFormError('')
  }
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const save = (event) => {
    event.preventDefault()
    let conditions = null
    try {
      if (conditionsText.trim()) {
        conditions = JSON.parse(conditionsText)
        if (!conditions || Array.isArray(conditions) || typeof conditions !== 'object') throw new Error('conditions')
      }
    } catch {
      setFormError(t('serviceAssignment.invalidConditions'))
      return
    }
    setFormError('')
    const payload = {
      name: form.name.trim(),
      entity_type: editing ? form.entity_type.trim() : activeType,
      conditions,
      assign_type: form.assign_type.trim(),
      team_id: numberOrNull(form.team_id),
      user_id: numberOrNull(form.user_id),
      priority: Number(form.priority),
      timeout_minutes: numberOrNull(form.timeout_minutes),
      active: Boolean(form.active),
    }
    if (!payload.name || !payload.entity_type || !payload.assign_type || !Number.isFinite(payload.priority)) {
      setFormError(t('serviceAssignment.requiredFields'))
      return
    }
    mutation.mutate({ id: editing, payload })
  }
  return <div className="grid gap-4 text-[var(--text)]">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-bold">{t('serviceAssignment.rules')}</h1><p className="text-sm text-[var(--text-muted)]">{t('serviceAssignment.rulesDescription')}</p></div>

    </header>
    {query.isPending && <p>{t('serviceAssignment.loading')}</p>}
    {query.isError && <div><p>{t('serviceAssignment.error')}</p><button type="button" className="underline" onClick={() => query.refetch()}>{t('serviceAssignment.retry')}</button></div>}
    {query.isSuccess && <>
      <div role="tablist" aria-label={t('serviceAssignment.entityType')} className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        {(types.length ? types : ['ticket']).map((type) => <button type="button" role="tab" aria-selected={activeType === type} key={type} onClick={() => setSelectedType(type)} className={`rounded-lg border px-3 py-2 text-sm ${activeType === type ? 'border-[var(--primary)] bg-[var(--surface-2)] font-semibold' : 'border-[var(--border)]'}`}>{type} ({rows.filter((row) => row.entity_type === type).length})</button>)}
      </div>
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{activeType}</p><button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-sm transition-colors hover:bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)]" onClick={() => openForm(null)}><Plus size={16} aria-hidden="true" />{t('serviceAssignment.addRule')}</button></div>
      <div role="tabpanel" className="grid gap-3">
        {rows.filter((row) => row.entity_type === activeType).length === 0 && <p className="text-sm text-[var(--text-muted)]">{t('serviceAssignment.empty')}</p>}
        {rows.filter((row) => row.entity_type === activeType).map((row) => <article key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="min-w-0"><h2 className="font-semibold">{row.name}</h2><p className="text-xs text-[var(--text-muted)]">{row.assign_type} · {t('serviceAssignment.priority')}: {row.priority} · {row.active === false ? t('serviceAssignment.inactive') : t('serviceAssignment.active')}</p></div>
          <button type="button" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" onClick={() => openForm(row)}>{t('serviceAssignment.editRule')}</button>
        </article>)}
      </div>
    </>}
    <AppDrawer open={Boolean(form)} onClose={() => { if (!mutation.isPending) setForm(null) }} title={t(editing ? 'serviceAssignment.editRule' : 'serviceAssignment.addRule')} size="xl" drawerKey="service-assignment-rule" portal pushPage={false}>
    {form && <div>
      <h2 className="mb-4 text-lg font-semibold">{t(editing ? 'serviceAssignment.editRule' : 'serviceAssignment.addRule')}</h2>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        {[
          ['name', 'name', 'text', true],
          ['assign_type', 'assignType', 'text', true],
          ['team_id', 'teamId', 'number', false],
          ['user_id', 'userId', 'number', false],
          ['priority', 'priority', 'number', true],
          ['timeout_minutes', 'timeoutMinutes', 'number', false],
        ].map(([field, label, type, required]) => <label key={field} className="grid gap-1 text-sm"><span>{t(`serviceAssignment.${label}`)}</span><input className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2" type={type} min={type === 'number' ? 0 : undefined} required={required} value={form[field] ?? ''} onChange={(event) => setField(field, event.target.value)} /></label>)}
        <div className="grid gap-1 text-sm"><span>{t('serviceAssignment.entityType')}</span><div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 font-medium">{form.entity_type}</div></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(event) => setField('active', event.target.checked)} />{t('serviceAssignment.active')}</label>
        <label className="grid gap-1 text-sm sm:col-span-2"><span>{t('serviceAssignment.conditions')}</span><textarea rows={5} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 font-mono" value={conditionsText} onChange={(event) => setConditionsText(event.target.value)} placeholder='{"priority":["urgent","high"]}' /></label>
        {(formError || mutation.isError) && <p role="alert" className="text-sm text-red-500 sm:col-span-2">{formError || t('serviceAssignment.saveError')}</p>}
        <div className="flex gap-2 sm:col-span-2"><button disabled={mutation.isPending} type="submit" className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50">{t('serviceAssignment.save')}</button><button type="button" className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm" onClick={() => setForm(null)}>{t('serviceAssignment.cancel')}</button></div>
      </form>
    </div>}
    </AppDrawer>
  </div>
}
