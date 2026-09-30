import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { KeyRound, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { useApiAccessMutations, useApiClients } from '../api/apiAccessApi'
import { ApiClientDialog } from './ApiClientDialog'
import { OneTimeSecretDialog } from './OneTimeSecretDialog'
import { PanelHeader } from './PanelHeader'

const STATUS_TONE = { active: 'text-sla-on-track', disabled: 'text-[var(--text-muted)]' }

/** Settings → API & webhooks → API clients (spec §16.5): scoped keys, optionally bound to one customer. */
export function ApiClientsPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const clients = useApiClients()
  const { updateClient, rotateKey, deleteClient } = useApiAccessMutations()
  const [editing, setEditing] = useState(null)
  const [secret, setSecret] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const scopeLabel = (scope) => `${t(`service.apiAccess.resources.${scope.split('.')[0]}`)}: ${t(`service.apiAccess.actions.${scope.split('.')[1]}`)}`

  const runConfirm = () => {
    const { type, client } = confirm
    const close = () => setConfirm(null)
    if (type === 'rotate') rotateKey.mutate(client.id, { onSuccess: (result) => { close(); setSecret(result.key) }, onError: close })
    else deleteClient.mutate(client.id, { onSuccess: () => { toast.success(t('service.apiAccess.done.deleted')); close() }, onError: close })
  }

  return (
    <div className="grid gap-4">
      <PanelHeader resource={{ title: t(`${resource.i18nKey}.title`), description: t(`${resource.i18nKey}.description`) }} action={<Button onClick={() => setEditing({})}><Plus size={16} aria-hidden="true" />{t('service.apiAccess.clients.create')}</Button>}>
        <p className="text-xs text-[var(--text-muted)]">{t('service.apiAccess.clients.howTo')} <code dir="ltr" className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono">Authorization: Bearer ick_live_…</code></p>
      </PanelHeader>
      <ResourceState isLoading={clients.isLoading} error={clients.error} onRetry={clients.refetch} empty={!clients.data?.length} emptyTitle={t('service.apiAccess.clients.empty')}>
        <ul className="grid gap-3">
          {(clients.data || []).map((client) => (
            <li key={client.id} className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid gap-1">
                  <span className="flex items-center gap-2 font-medium text-[var(--text)]">
                    <KeyRound size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
                    {client.name}
                    <span className={cn('text-xs font-medium', STATUS_TONE[client.status])}>{t(`service.apiAccess.statuses.${client.status}`)}</span>
                  </span>
                  <code dir="ltr" className="w-fit font-mono text-xs text-[var(--text-muted)]">{client.key_prefix}…{client.key_last4}</code>
                  <span className="text-xs text-[var(--text-muted)]">
                    {[
                      client.bound_customer ? t('service.apiAccess.clients.boundTo', { name: client.bound_customer.name }) : t('service.apiAccess.clients.tenantWide'),
                      t('service.apiAccess.clients.rate', { count: client.rate_limit }),
                      client.ip_allowlist?.length ? t('service.apiAccess.clients.ips', { count: client.ip_allowlist.length }) : t('service.apiAccess.clients.anyIp'),
                      client.last_used_at ? t('service.apiAccess.clients.lastUsed', { when: formatRelativeTime(client.last_used_at, i18n.language) }) : t('service.apiAccess.clients.neverUsed'),
                      t('service.apiAccess.clients.requests', { count: client.requests_24h || 0 }),
                    ].join(' · ')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(client)}><Pencil size={14} aria-hidden="true" />{t('service.settings.actions.edit')}</Button>
                  {client.status === 'active' && <Button size="sm" variant="outline" onClick={() => setConfirm({ type: 'rotate', client })}><RefreshCw size={14} aria-hidden="true" />{t('service.apiAccess.clients.rotate')}</Button>}
                  <Button size="sm" variant="ghost" onClick={() => updateClient.mutate({ id: client.id, status: client.status === 'active' ? 'disabled' : 'active' }, { onSuccess: () => toast.success(t(`service.apiAccess.done.${client.status === 'active' ? 'disabled' : 'enabled'}`)) })}>
                    {t(client.status === 'active' ? 'service.apiAccess.disable' : 'service.apiAccess.enable')}
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={t('service.settings.actions.delete')} onClick={() => setConfirm({ type: 'delete', client })}><Trash2 size={14} aria-hidden="true" /></Button>
                </div>
              </div>
              <ul className="flex flex-wrap gap-1.5" aria-label={t('service.apiAccess.fields.scopes')}>
                {client.scopes.map((scope) => <li key={scope} title={scope} className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-0.5 text-xs text-[var(--text)]">{scopeLabel(scope)}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </ResourceState>
      <ApiClientDialog open={Boolean(editing)} client={editing?.id ? editing : null} onClose={() => setEditing(null)} onKey={setSecret} />
      <OneTimeSecretDialog secret={secret} kind="key" onClose={() => setSecret(null)} />
      <ConfirmDialog
        isOpen={Boolean(confirm)}
        type="danger"
        title={confirm && t(`service.apiAccess.confirm.${confirm.type}Key.title`)}
        message={confirm && t(`service.apiAccess.confirm.${confirm.type}Key.message`, { name: confirm.client.name })}
        confirmText={confirm && t(`service.apiAccess.confirm.${confirm.type}Key.confirm`)}
        loading={rotateKey.isPending || deleteClient.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  )
}
