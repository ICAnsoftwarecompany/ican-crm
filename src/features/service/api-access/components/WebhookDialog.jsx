import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useApiAccessMutations, useApiCatalog, useApiClients } from '../api/apiAccessApi'
import { EventChecklist } from './EventChecklist'

const EMPTY = { name: '', url: 'https://', events: [], api_client_id: '' }

/** Create / edit an outbound webhook subscription. On create the signing secret comes back once (`onSecret`). */
export function WebhookDialog({ open, webhook, onClose, onSecret }) {
  const { t } = useTranslation()
  const catalog = useApiCatalog()
  const clients = useApiClients()
  const { createWebhook, updateWebhook } = useApiAccessMutations()
  const mutation = webhook ? updateWebhook : createWebhook
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(mutation.error)
  useEffect(() => {
    if (open) {
      setForm(webhook ? { name: webhook.name, url: webhook.url, events: webhook.events, api_client_id: webhook.api_client_id || '' } : EMPTY)
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, webhook?.id])
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))
  const submit = () => {
    const payload = { name: form.name.trim(), url: form.url.trim(), events: form.events, api_client_id: form.api_client_id || null }
    mutation.mutate(webhook ? { id: webhook.id, ...payload } : payload, {
      onSuccess: (result) => {
        if (!webhook) onSecret(result.secret)
        onClose()
      },
    })
  }
  const errorText = (name) => errors[name] && t(`service.apiAccess.validation.${errors[name][0]}`, { defaultValue: t('service.settings.validation.required') })
  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-2xl" title={t(webhook ? 'service.apiAccess.webhooks.edit' : 'service.apiAccess.webhooks.create')} submitText={t('service.settings.actions.save')} loading={mutation.isPending} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label={t('service.apiAccess.fields.name')} dir="auto" value={form.name} onChange={(event) => set('name')(event.target.value)} error={errorText('name')} />
        <Select label={t('service.apiAccess.fields.apiClient')} placeholder={t('service.apiAccess.webhooks.noClient')} value={form.api_client_id} onChange={set('api_client_id')} options={(clients.data || []).map((client) => ({ value: client.id, label: client.name }))} />
      </div>
      <Input label={t('service.apiAccess.fields.url')} dir="ltr" type="url" value={form.url} onChange={(event) => set('url')(event.target.value)} error={errorText('url')} />
      <EventChecklist events={catalog.data?.events || []} value={form.events} onChange={set('events')} error={errorText('events')} />
    </FormDialog>
  )
}
