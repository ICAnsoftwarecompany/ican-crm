import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { CustomerSelect } from '../../records/components/CustomerSelect'
import { useApiAccessMutations, useApiCatalog } from '../api/apiAccessApi'
import { ScopeChecklist } from './ScopeChecklist'

const EMPTY = { name: '', scopes: [], bound: false, bound_customer_id: '', rate_limit: 120, ip_text: '' }

/** Create / edit an API client. On create the server answers with the key once (`onKey`). */
export function ApiClientDialog({ open, client, onClose, onKey }) {
  const { t } = useTranslation()
  const catalog = useApiCatalog()
  const { createClient, updateClient } = useApiAccessMutations()
  const mutation = client ? updateClient : createClient
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(mutation.error)
  useEffect(() => {
    if (open) {
      setForm(client ? { name: client.name, scopes: client.scopes, bound: Boolean(client.bound_customer_id), bound_customer_id: client.bound_customer_id || '', rate_limit: client.rate_limit, ip_text: (client.ip_allowlist || []).join('\n') } : EMPTY)
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client?.id])
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))
  const allowed = form.bound ? catalog.data?.bound_scopes || [] : catalog.data?.scopes || []
  const submit = () => {
    const payload = {
      name: form.name.trim(),
      scopes: form.scopes.filter((scope) => allowed.includes(scope)),
      bound_customer_id: form.bound ? form.bound_customer_id || null : null,
      rate_limit: Number(form.rate_limit),
      ip_allowlist: form.ip_text.split(/[\s,]+/).map((entry) => entry.trim()).filter(Boolean),
    }
    mutation.mutate(client ? { id: client.id, ...payload } : payload, {
      onSuccess: (result) => {
        if (!client) onKey(result.key)
        onClose()
      },
    })
  }
  const errorText = (name) => errors[name] && t(`service.apiAccess.validation.${errors[name][0]}`, { defaultValue: t('service.settings.validation.required') })
  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-2xl" title={t(client ? 'service.apiAccess.clients.edit' : 'service.apiAccess.clients.create')} description={t('service.apiAccess.clients.dialogHint')} submitText={t(client ? 'service.settings.actions.save' : 'service.apiAccess.clients.createKey')} loading={mutation.isPending} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <Input label={t('service.apiAccess.fields.name')} dir="auto" value={form.name} onChange={(event) => set('name')(event.target.value)} error={errorText('name')} />
        <Input label={t('service.apiAccess.fields.rateLimit')} hint={t('service.apiAccess.fields.rateLimitHint')} type="number" dir="ltr" min={10} max={10000} value={form.rate_limit} onChange={(event) => set('rate_limit')(event.target.value)} error={errorText('rate_limit')} />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
        <input type="checkbox" checked={form.bound} onChange={(event) => set('bound')(event.target.checked)} />
        {t('service.apiAccess.fields.bound')}
      </label>
      {form.bound && <CustomerSelect value={form.bound_customer_id} onChange={set('bound_customer_id')} error={errorText('bound_customer_id')} />}
      {form.bound && <p className="-mt-1 text-xs text-[var(--text-muted)]">{t('service.apiAccess.fields.boundHint')}</p>}
      <ScopeChecklist scopes={allowed} value={form.scopes} onChange={set('scopes')} error={errorText('scopes')} />
      <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
        {t('service.apiAccess.fields.ipAllowlist')}
        <textarea dir="ltr" rows={3} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-start font-mono text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="41.33.12.0/24" value={form.ip_text} onChange={(event) => set('ip_text')(event.target.value)} />
        <span className="text-xs font-normal text-[var(--text-muted)]">{t('service.apiAccess.fields.ipHint')}</span>
        {errors.ip_allowlist && <span className="text-xs text-status-lost">{t('service.apiAccess.validation.ip')}</span>}
      </label>
    </FormDialog>
  )
}
