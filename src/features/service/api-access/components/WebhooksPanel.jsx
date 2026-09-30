import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { History, Pencil, Plus, RefreshCw, Send, Trash2, TriangleAlert, Webhook } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { useApiAccessMutations, useWebhooks } from '../api/apiAccessApi'
import { OneTimeSecretDialog } from './OneTimeSecretDialog'
import { PanelHeader } from './PanelHeader'
import { WebhookDialog } from './WebhookDialog'
import { WebhookDeliveriesDrawer } from './WebhookDeliveriesDrawer'

/** Settings → API & webhooks → Webhooks (spec §16.4): HMAC-signed event pushes with retries and a delivery log. */
export function WebhooksPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const webhooks = useWebhooks()
  const { updateWebhook, rotateSecret, deleteWebhook, testWebhook } = useApiAccessMutations()
  const [editing, setEditing] = useState(null)
  const [secret, setSecret] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [log, setLog] = useState(null)

  const runConfirm = () => {
    const { type, webhook } = confirm
    const close = () => setConfirm(null)
    if (type === 'rotate') rotateSecret.mutate(webhook.id, { onSuccess: (result) => { close(); setSecret(result.secret) }, onError: close })
    else deleteWebhook.mutate(webhook.id, { onSuccess: () => { toast.success(t('service.apiAccess.done.deleted')); close() }, onError: close })
  }
  const test = (webhook) =>
    testWebhook.mutate(webhook.id, {
      onSuccess: (delivery) => (delivery.status === 'delivered' ? toast.success(t('service.apiAccess.done.testDelivered', { code: delivery.response_code })) : toast.error(t('service.apiAccess.done.testFailed', { code: delivery.response_code || '—' }))),
    })

  return (
    <div className="grid gap-4">
      <PanelHeader resource={{ title: t(`${resource.i18nKey}.title`), description: t(`${resource.i18nKey}.description`) }} action={<Button onClick={() => setEditing({})}><Plus size={16} aria-hidden="true" />{t('service.apiAccess.webhooks.create')}</Button>}>
        <p className="text-xs text-[var(--text-muted)]">{t('service.apiAccess.webhooks.signature')} <code dir="ltr" className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono">X-ICAN-Signature: t=…,v1=HMAC-SHA256</code></p>
      </PanelHeader>
      <ResourceState isLoading={webhooks.isLoading} error={webhooks.error} onRetry={webhooks.refetch} empty={!webhooks.data?.length} emptyTitle={t('service.apiAccess.webhooks.empty')}>
        <ul className="grid gap-3">
          {(webhooks.data || []).map((webhook) => (
            <li key={webhook.id} className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div className="grid min-w-0 gap-1">
                  <span className="flex items-center gap-2 font-medium text-[var(--text)]">
                    <Webhook size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
                    {webhook.name}
                    <span className={cn('text-xs font-medium', webhook.status === 'active' ? 'text-sla-on-track' : 'text-[var(--text-muted)]')}>{t(`service.apiAccess.statuses.${webhook.status}`)}</span>
                  </span>
                  <code dir="ltr" className="truncate text-start font-mono text-xs text-[var(--text-muted)]">{webhook.url}</code>
                  <span className="text-xs text-[var(--text-muted)]">
                    {[
                      t('service.apiAccess.webhooks.eventsCount', { count: webhook.events.length }),
                      t('service.apiAccess.webhooks.health', { failed: webhook.failed_24h, total: webhook.deliveries_24h }),
                      webhook.last_delivery_at && t('service.apiAccess.webhooks.lastDelivery', { when: formatRelativeTime(webhook.last_delivery_at, i18n.language) }),
                      webhook.api_client && t('service.apiAccess.webhooks.client', { name: webhook.api_client.name }),
                      t('service.apiAccess.webhooks.secretEnds', { last4: webhook.secret_last4 }),
                    ].filter(Boolean).join(' · ')}
                  </span>
                  {webhook.consecutive_failures > 0 && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-sla-breached"><TriangleAlert size={14} aria-hidden="true" />{t('service.apiAccess.webhooks.failing', { count: webhook.consecutive_failures })}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setLog(webhook)}><History size={14} aria-hidden="true" />{t('service.apiAccess.webhooks.deliveries')}</Button>
                  <Button size="sm" variant="outline" disabled={testWebhook.isPending} onClick={() => test(webhook)}><Send size={14} aria-hidden="true" />{t('service.apiAccess.webhooks.test')}</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(webhook)}><Pencil size={14} aria-hidden="true" />{t('service.settings.actions.edit')}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirm({ type: 'rotate', webhook })}><RefreshCw size={14} aria-hidden="true" />{t('service.apiAccess.webhooks.rotate')}</Button>
                  <Button size="sm" variant="ghost" onClick={() => updateWebhook.mutate({ id: webhook.id, status: webhook.status === 'active' ? 'paused' : 'active' })}>{t(webhook.status === 'active' ? 'service.apiAccess.pause' : 'service.apiAccess.resume')}</Button>
                  <Button size="icon" variant="ghost" aria-label={t('service.settings.actions.delete')} onClick={() => setConfirm({ type: 'delete', webhook })}><Trash2 size={14} aria-hidden="true" /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ResourceState>
      <WebhookDialog open={Boolean(editing)} webhook={editing?.id ? editing : null} onClose={() => setEditing(null)} onSecret={setSecret} />
      <OneTimeSecretDialog secret={secret} kind="secret" onClose={() => setSecret(null)} />
      <WebhookDeliveriesDrawer webhook={log} onClose={() => setLog(null)} />
      <ConfirmDialog
        isOpen={Boolean(confirm)}
        type="danger"
        title={confirm && t(`service.apiAccess.confirm.${confirm.type}Webhook.title`)}
        message={confirm && t(`service.apiAccess.confirm.${confirm.type}Webhook.message`, { name: confirm.webhook.name })}
        confirmText={confirm && t(`service.apiAccess.confirm.${confirm.type}Webhook.confirm`)}
        loading={rotateSecret.isPending || deleteWebhook.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  )
}
