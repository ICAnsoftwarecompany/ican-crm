import { useRef, useState } from 'react'
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
    const tenantId = resolveTenantId(user)
    if (!form.name.trim() || !form.phone.trim()) return setError(t('customers.newCustomerDialog.nameAndPhoneRequired'))
    if (!tenantId) return setError(tr('tenantMissing'))
    const payload = buildLeadCreatePayload(form, { tenantId, userId: user?.id })
    try {
      const response = await mutation.mutateAsync(payload)
      if (response?.success === false) throw new Error(response.message || tr('failed'))
      await queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      onCreated?.(response, payload.customers)
      setForm(emptyLeadForm(user))
      setTimeout(() => nameInputRef.current?.focus(), 0)
      toast.success(tr('saved'))
    } catch (cause) { setError(extractMessage(cause, tr('failed'))) }
  }
  return <AppDrawer open={open} onClose={() => !mutation.isPending && onClose()} title={tr('title')} size="xl" drawerKey="lead-create" closeOnBackdrop={false} pushPage portal>
    <form onSubmit={submit} className="space-y-4 text-[var(--text)]">
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <fieldset disabled={mutation.isPending} className="space-y-4 disabled:opacity-70">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{['name', 'phone', 'email', 'company'].map((key) => <label key={key} className="grid gap-1 text-sm">{key === 'company' ? tr('company') : t(`customers.${key}`)}<input ref={key === 'name' ? nameInputRef : undefined} required={key === 'name' || key === 'phone'} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} className={leadInputClass} value={form[key]} onChange={(event) => setField(key, event.target.value)} /></label>)}</div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.automatic_distribution} onChange={(event) => setField('automatic_distribution', event.target.checked)} />{tr('automatic')}</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">{tr('agent')}<select className={leadInputClass} disabled={form.automatic_distribution} value={form.agent_id} onChange={(event) => setField('agent_id', event.target.value)}><option value="">{tr('none')}</option>{(users.data || []).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
          <label className="grid gap-1 text-sm">{tr('status')}<select className={leadInputClass} value={form.status_type_id} onChange={(event) => setField('status_type_id', event.target.value)}><option value="">{tr('none')}</option>{statusList.filter((status) => Number(status.active ?? 1) === 1).map((status) => <option key={status.id} value={status.id}>{status.status || status.name}</option>)}</select></label>
          <label className="grid gap-1 text-sm">{tr('tag')}<select className={leadInputClass} value={form.tag_id} onChange={(event) => setField('tag_id', event.target.value)}><option value="">{tr('none')}</option>{tagList.map((tag) => <option key={tag.id} value={tag.id}>{tag.tag || tag.name}</option>)}</select></label>
          <label className="grid gap-1 text-sm">{tr('source')}<input className={leadInputClass} value={form.source} onChange={(event) => setField('source', event.target.value)} /></label>
          <label className="grid gap-1 text-sm">{tr('linkedType')}<select className={leadInputClass} value={form.linked_type} onChange={(event) => setField('linked_type', event.target.value)}>{['manual', 'automation'].map((value) => <option key={value} value={value}>{tr(value)}</option>)}</select></label>
          <label className="grid gap-1 text-sm">{tr('linkDate')}<input type="date" required className={leadInputClass} value={form.link_date} onChange={(event) => setField('link_date', event.target.value)} /></label>
        </div>
        {[users, products, statuses, tags].some((query) => query.isError) && <div role="alert" className="text-sm">{tr('optionsError')}<Button size="sm" variant="ghost" onClick={() => [users, products, statuses, tags].filter((query) => query.isError).forEach((query) => query.refetch())}>{t('common.retry')}</Button></div>}
        <LeadExtraFields form={form} setField={setField} products={products.data || []} />
      </fieldset>
      <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--surface)] py-3"><Button type="submit" loading={mutation.isPending}>{tr('saveNext')}</Button></div>
    </form>
  </AppDrawer>
}
