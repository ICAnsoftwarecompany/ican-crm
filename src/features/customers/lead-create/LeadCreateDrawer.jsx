import { useRef, useState } from 'react'
import { CheckCircle2, ContactRound, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../shared/components/ui/Button'
import { extractList, extractMessage } from '../../../shared/utils/apiResponse'
import { resolveTenantId } from '../../../services/tenantResolver'
import { useAuthStore } from '../../../store/authStore'
import { useUsers } from '../../users'
import { useCatalogProducts } from '../../products'
import { definitionsApi } from '../../definitions/api/definitionsApi'
import { customersApi } from '../api/customersApi'
import { emptyLeadForm, buildLeadCreatePayload } from './leadCreateModel'
import { LeadExtraFields, leadInputClass } from './LeadExtraFields'

export function LeadCreateDrawer({ open, onClose, onCreated }) {
  const { t } = useTranslation()
  const tr = (key) => t(`customers.leadCreate.${key}`)
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [form, setForm] = useState(() => emptyLeadForm(user))
  const [error, setError] = useState('')
  const [savedName, setSavedName] = useState('')
  const nameInputRef = useRef(null)
  const users = useUsers()
  const products = useCatalogProducts()
  const statuses = useQuery({ queryKey: ['lead-create', 'statuses'], queryFn: () => definitionsApi.getStatuses(), enabled: open })
  const tags = useQuery({ queryKey: ['lead-create', 'tags'], queryFn: () => definitionsApi.getTags(), enabled: open })
  const mutation = useMutation({ mutationFn: customersApi.createCustomers })
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const statusList = statuses.data?.data?.lead || []
  const tagList = extractList(tags.data, ['tags'])
  const submit = async (event) => {
    event.preventDefault()
    if (mutation.isPending) return
    setError('')
    setSavedName('')
    const tenantId = resolveTenantId(user)
    if (!form.name.trim() || !form.phone.trim()) return setError(t('customers.newCustomerDialog.nameAndPhoneRequired'))
    if (!tenantId) return setError(tr('tenantMissing'))
    const payload = buildLeadCreatePayload(form, { tenantId, userId: user?.id })
    try {
      const response = await mutation.mutateAsync(payload)
      if (response?.success === false) throw new Error(response.message || tr('failed'))
      await queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setSavedName(payload.customers[0].name)
      onCreated?.(response, payload.customers)
      setForm(emptyLeadForm(user))
      setTimeout(() => nameInputRef.current?.focus(), 0)
      toast.success(`${tr('saved')} — ${payload.customers[0].name}`)
    } catch (cause) { setError(extractMessage(cause, tr('failed'))) }
  }
  return <AppDrawer open={open} onClose={() => !mutation.isPending && onClose()} title={tr('title')} size="xl" drawerKey="lead-create" closeOnBackdrop={false} pushPage portal>
    <form onSubmit={submit} className="space-y-5 pb-2 text-[var(--text)]">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600"><Sparkles size={22} /></div>
          <div>
            <h2 className="text-base font-semibold">{tr('title')}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('customers.newCustomerDialog.nameAndPhoneRequired')}</p>
          </div>
        </div>
      </div>
      {savedName && <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={20} className="shrink-0" /><span>{tr('saved')} — <strong>{savedName}</strong></span></div>}
      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
      <fieldset disabled={mutation.isPending} className="space-y-5 disabled:opacity-70">
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3"><ContactRound size={18} className="text-blue-600" /><h3 className="font-semibold">{tr('title')}</h3><span className="ms-auto text-xs text-[var(--text-muted)]">*</span></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {['name', 'phone', 'email', 'company'].map((key) => <label key={key} className="grid gap-1.5 text-sm"><span className="font-medium">{key === 'company' ? tr('company') : t(`customers.${key}`)}{(key === 'name' || key === 'phone') && <span className="ms-1 text-red-500">*</span>}</span><input ref={key === 'name' ? nameInputRef : undefined} required={key === 'name' || key === 'phone'} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'organization'} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} className={leadInputClass} value={form[key]} onChange={(event) => setField(key, event.target.value)} /></label>)}
          </div>
        </section>
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3"><SlidersHorizontal size={18} className="text-blue-600" /><h3 className="font-semibold">{tr('status')}</h3></div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-3 text-sm"><input type="checkbox" checked={form.automatic_distribution} onChange={(event) => setField('automatic_distribution', event.target.checked)} /><span className="font-medium">{tr('automatic')}</span></label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">{tr('agent')}<select className={leadInputClass} disabled={form.automatic_distribution} value={form.agent_id} onChange={(event) => setField('agent_id', event.target.value)}><option value="">{tr('none')}</option>{(users.data || []).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm">{tr('status')}<select className={leadInputClass} value={form.status_type_id} onChange={(event) => setField('status_type_id', event.target.value)}><option value="">{tr('none')}</option>{statusList.filter((status) => Number(status.active ?? 1) === 1).map((status) => <option key={status.id} value={status.id}>{status.status || status.name}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm">{tr('tag')}<select className={leadInputClass} value={form.tag_id} onChange={(event) => setField('tag_id', event.target.value)}><option value="">{tr('none')}</option>{tagList.map((tag) => <option key={tag.id} value={tag.id}>{tag.tag || tag.name}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm">{tr('source')}<input className={leadInputClass} value={form.source} onChange={(event) => setField('source', event.target.value)} /></label>
            <label className="grid gap-1.5 text-sm">{tr('linkedType')}<select className={leadInputClass} value={form.linked_type} onChange={(event) => setField('linked_type', event.target.value)}>{['manual', 'automation'].map((value) => <option key={value} value={value}>{tr(value)}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm">{tr('linkDate')}<input type="date" required className={leadInputClass} value={form.link_date} onChange={(event) => setField('link_date', event.target.value)} /></label>
          </div>
          {[users, products, statuses, tags].some((query) => query.isError) && <div role="alert" className="text-sm">{tr('optionsError')}<Button type="button" size="sm" variant="ghost" onClick={() => [users, products, statuses, tags].filter((query) => query.isError).forEach((query) => query.refetch())}>{t('common.retry')}</Button></div>}
        </section>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"><LeadExtraFields form={form} setField={setField} products={products.data || []} /></div>
      </fieldset>
      <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-2 py-4">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>{t('common.cancel')}</Button>
        <Button type="submit" loading={mutation.isPending}>{tr('saveNext')}</Button>
      </div>
    </form>
  </AppDrawer>
}
