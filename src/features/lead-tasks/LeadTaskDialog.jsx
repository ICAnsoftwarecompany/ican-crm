import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { AppDrawer } from '../../shared/components/overlays/AppDrawer'
import { Button } from '../../shared/components/ui/Button'
import { extractMessage } from '../../shared/utils/apiResponse'
import { useCurrentUserId, useTaskMutations } from '../tasks'
import { buildLeadTaskPayload, createLeadTaskCopies } from './leadTaskModel'

const inputClass = 'h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]'

export function LeadTaskDialog({ targets, invalidCount = 0, onClose, onSaved }) {
  const { t } = useTranslation()
  const currentUserId = useCurrentUserId()
  const { create } = useTaskMutations()
  const completed = useRef(new Set())
  const busy = useRef(false)
  const [count, setCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', due_time: '', reminder: false, reminder_before: '30', reminder_unit: 'minutes', reminder_type: 'system', attachments: [], items: [] })
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (!busy.current) onClose()
    }
    document.addEventListener('keydown', handleEscape, true)
    return () => document.removeEventListener('keydown', handleEscape, true)
  }, [onClose])
  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))
  const save = async (event) => {
    event.preventDefault()
    if (busy.current || invalidCount || !form.title.trim() || !targets.length) return
    busy.current = true; setSaving(true); setError('')
    try {
      await createLeadTaskCopies(targets, completed.current, (payload) => create.mutateAsync(payload), (target) => buildLeadTaskPayload(form, target, currentUserId), setCount)
      onSaved?.(); onClose()
    } catch (failure) { setError(extractMessage(failure, t('customers.leadTasks.failed'))) }
    finally { busy.current = false; setSaving(false) }
  }
  return <AppDrawer open onClose={() => { if (!busy.current) onClose() }} title={t('customers.leadTasks.add')} size="xl" drawerKey="lead-task-create" portal pushPage={false} containerClassName="z-[120000]" closeOnBackdrop={false}>
    <form onSubmit={save} className="space-y-4">
      <div className="flex flex-wrap gap-2">{targets.map((target) => <span key={target.id} className="rounded border border-[var(--border)] px-2 py-1 text-xs text-[var(--text)]">{target.name}</span>)}</div>
      {targets.length > 1 && <p className="text-xs text-[var(--text-muted)]">{t('customers.leadTasks.copies', { count: targets.length })}</p>}
      {invalidCount > 0 && <p role="alert" className="text-sm text-red-600">{t('customers.leadTasksInvalidTargets', { count: invalidCount })}</p>}
      <fieldset disabled={saving || count > 0} className="min-w-0 space-y-4 disabled:opacity-70">
        <label className="block space-y-1 text-sm"><span>{t('tasks.form.titleLabel')}</span><input autoFocus required value={form.title} onChange={(e) => update('title', e.target.value)} className={inputClass} /></label>
        <label className="block space-y-1 text-sm"><span>{t('tasks.form.descriptionLabel')}</span><textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className={`${inputClass} h-auto py-2`} /></label>
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{t('customers.leadTasks.checklist')}</h3><Button type="button" size="sm" variant="outline" onClick={() => update('items', [...form.items, { text: '', done: false }])}><Plus size={14} />{t('customers.leadTasks.addItem')}</Button></div>
          {form.items.map((item, index) => <div key={index} className="flex min-w-0 items-center gap-2">
            <input type="checkbox" checked={item.done} aria-label={t('customers.leadTasks.completedItem', { number: index + 1 })} onChange={(e) => update('items', form.items.map((entry, i) => i === index ? { ...entry, done: e.target.checked } : entry))} />
            <input value={item.text} aria-label={t('customers.leadTasks.item', { number: index + 1 })} onChange={(e) => update('items', form.items.map((entry, i) => i === index ? { ...entry, text: e.target.value } : entry))} className={inputClass} />
            <Button type="button" size="sm" variant="ghost" title={t('customers.leadTasks.removeItem')} aria-label={t('customers.leadTasks.removeItem')} onClick={() => update('items', form.items.filter((_, i) => i !== index))}><Trash2 size={15} /></Button>
          </div>)}
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm"><span>{t('customers.leadTasks.date')}</span><input type="date" value={form.due_date} onChange={(e) => { update('due_date', e.target.value); if (!e.target.value) { update('due_time', ''); update('reminder', false) } }} className={inputClass} /></label>
          <label className="space-y-1 text-sm"><span>{t('customers.leadTasks.time')}</span><input type="time" disabled={!form.due_date} value={form.due_time} onChange={(e) => { update('due_time', e.target.value); if (!e.target.value) update('reminder', false) }} className={inputClass} /></label>
          <label className="space-y-1 text-sm"><span>{t('tasks.form.priorityLabel')}</span><select value={form.priority} onChange={(e) => update('priority', e.target.value)} className={inputClass}>{['low', 'medium', 'high', 'urgent'].map((value) => <option key={value} value={value}>{t(`activities.scheduleDialog.priorityOptions.${value}`)}</option>)}</select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.reminder} disabled={!form.due_date || !form.due_time} onChange={(e) => update('reminder', e.target.checked)} />{t('customers.leadTasks.reminder')}</label>
          {form.reminder && <><label className="space-y-1 text-sm"><span>{t('tasks.form.reminderBeforeLabel')}</span><input type="number" min="0" required value={form.reminder_before} onChange={(e) => update('reminder_before', e.target.value)} className={inputClass} /></label><label className="space-y-1 text-sm"><span>{t('tasks.form.reminderUnitLabel')}</span><select value={form.reminder_unit} onChange={(e) => update('reminder_unit', e.target.value)} className={inputClass}>{['minutes', 'hours', 'days'].map((unit) => <option key={unit} value={unit}>{t(`activities.scheduleDialog.${unit}Option`)}</option>)}</select></label></>}
        </div>
        <label className="block space-y-1 text-sm"><span>{t('tasks.form.attachmentsLabel')}</span><input type="file" multiple onChange={(e) => update('attachments', Array.from(e.target.files || []))} className="block w-full min-w-0 text-xs" /></label>
        {form.attachments.length > 0 && <ul className="space-y-1 text-xs text-[var(--text-muted)]">{form.attachments.map((file, i) => <li key={i} className="flex min-w-0 items-center justify-between gap-2"><span className="break-all">{file.name}</span><button type="button" title={t('customers.leadTasks.removeItem')} aria-label={t('customers.leadTasks.removeItem')} onClick={() => update('attachments', form.attachments.filter((_, index) => index !== i))}><Trash2 size={14} /></button></li>)}</ul>}
      </fieldset>
      {count > 0 && <p role="status" className="text-sm">{t('customers.leadTasks.progress', { count, total: targets.length })}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving || invalidCount > 0 || !form.title.trim() || !targets.length}>{saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}{t(error ? 'customers.leadTasks.retry' : 'customers.leadTasks.add')}</Button>
    </form>
  </AppDrawer>
}
