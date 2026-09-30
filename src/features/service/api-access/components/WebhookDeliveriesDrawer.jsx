import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { useApiAccessMutations, useApiCatalog, useWebhookDeliveries } from '../api/apiAccessApi'

const TONE = { delivered: 'text-sla-on-track', retrying: 'text-sla-at-risk', failed: 'text-sla-breached' }

/** Delivery log of one webhook: status, response, attempts, next retry, the signed payload; manual redelivery. */
export function WebhookDeliveriesDrawer({ webhook, onClose }) {
  const { t, i18n } = useTranslation()
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)
  const catalog = useApiCatalog()
  const deliveries = useWebhookDeliveries(webhook?.id, { status: filter || undefined })
  const { redeliver } = useApiAccessMutations()
  const max = catalog.data?.max_attempts
  return (
    <AppDrawer open={Boolean(webhook)} onClose={onClose} size="lg" title={t('service.apiAccess.webhooks.deliveries')} description={webhook?.name} drawerKey="service-webhook-deliveries">
      <div className="grid gap-3 p-4">
        <div className="flex gap-2" role="tablist" aria-label={t('service.apiAccess.webhooks.deliveries')}>
          {['', 'failed', 'delivered'].map((key) => (
            <button key={key || 'all'} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className={cn('rounded-full border px-3 py-1 text-xs', filter === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]')}>
              {t(`service.apiAccess.deliveryFilters.${key || 'all'}`)}
            </button>
          ))}
        </div>
        <ResourceState isLoading={deliveries.isLoading} error={deliveries.error} onRetry={deliveries.refetch} empty={!deliveries.data?.length} emptyTitle={t('service.apiAccess.webhooks.noDeliveries')}>
          <ul className="grid gap-2">
            {(deliveries.data || []).map((delivery) => (
              <li key={delivery.id} className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button type="button" className="grid min-w-0 flex-1 gap-0.5 text-start" aria-expanded={expanded === delivery.id} onClick={() => setExpanded(expanded === delivery.id ? null : delivery.id)}>
                    <span className="flex items-center gap-2">
                      <ChevronDown size={14} className={cn('shrink-0 text-[var(--text-muted)] transition-transform', expanded === delivery.id && 'rotate-180')} aria-hidden="true" />
                      <code dir="ltr" className="truncate font-mono text-xs text-[var(--text)]">{delivery.event_name}</code>
                      <span className={cn('text-xs font-medium', TONE[delivery.status])}>{t(`service.apiAccess.deliveryStatuses.${delivery.status}`)}</span>
                    </span>
                    <span className="ps-5 text-xs text-[var(--text-muted)]">
                      {[
                        delivery.response_code ? t('service.apiAccess.deliveries.code', { code: delivery.response_code }) : delivery.error && t(`service.apiAccess.deliveries.errors.${delivery.error}`, { defaultValue: delivery.error }),
                        max ? t('service.apiAccess.deliveries.attemptsOf', { n: delivery.attempts, max }) : t('service.apiAccess.deliveries.attempts', { n: delivery.attempts }),
                        delivery.duration_ms != null && t('service.apiAccess.deliveries.duration', { ms: delivery.duration_ms }),
                        formatRelativeTime(delivery.last_attempt_at, i18n.language),
                        delivery.next_retry_at && t('service.apiAccess.deliveries.nextRetry', { when: formatRelativeTime(delivery.next_retry_at, i18n.language) }),
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </button>
                  {delivery.status !== 'delivered' && (
                    <Button size="sm" variant="outline" disabled={redeliver.isPending} onClick={() => redeliver.mutate(delivery.id, { onSuccess: (result) => (result.status === 'delivered' ? toast.success(t('service.apiAccess.done.redelivered')) : toast.error(t('service.apiAccess.done.testFailed', { code: result.response_code || '—' }))) })}>
                      <RotateCcw size={14} aria-hidden="true" />
                      {t('service.apiAccess.deliveries.redeliver')}
                    </Button>
                  )}
                </div>
                {expanded === delivery.id && (
                  <pre dir="ltr" className="max-h-64 overflow-auto rounded-md bg-[var(--surface-2)] p-2 text-start font-mono text-[0.7rem] text-[var(--text)]">{JSON.stringify(delivery.request, null, 2)}</pre>
                )}
              </li>
            ))}
          </ul>
        </ResourceState>
        <p className="text-xs text-[var(--text-muted)]">{t('service.apiAccess.deliveries.retryPolicy', { max: max || '—' })}</p>
      </div>
    </AppDrawer>
  )
}
