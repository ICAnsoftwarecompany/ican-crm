import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, CirclePlus, Eye, Lock, Megaphone } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../../shared/utils/dateTime'
import { TEXTAREA_CLASS } from '../../../settings/components/fields/ResourceField'
import { localizeLabel } from '../../../core/utils/localizeLabel'
import { useRecordMutations, useRecordSection } from '../../hooks/useRecords'

const ICONS = { created: CirclePlus, status_change: ArrowLeftRight, customer_update: Megaphone }

/**
 * Record timeline (projection of domain events) + manual customer update.
 * `visibility: customer` events are what the portal shows.
 */
export function RecordTimelinePanel({ record }) {
  const { t, i18n } = useTranslation()
  const timeline = useRecordSection(record.id, 'timeline')
  const { postUpdate } = useRecordMutations(record.id)
  const [body, setBody] = useState('')
  const [notify, setNotify] = useState(true)
  const language = i18n.language

  const text = (event) => {
    if (event.event_type === 'status_change') return t('service.records.timeline.statusChange', { status: localizeLabel(event.payload?.to?.label, language, event.payload?.to?.key) })
    if (event.event_type === 'created') return t('service.records.timeline.created', { source: t(`service.records.sources.${event.payload?.source}`, { defaultValue: event.payload?.source || '' }) })
    return event.body
  }

  return (
    <div className="grid gap-4">
      <form
        className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
        onSubmit={(event) => {
          event.preventDefault()
          postUpdate.mutate({ body, notify }, { onSuccess: () => setBody('') })
        }}
      >
        <label className="text-sm font-medium text-[var(--text)]" htmlFor="record-update">{t('service.records.timeline.updateTitle')}</label>
        <textarea id="record-update" dir="auto" className={TEXTAREA_CLASS} value={body} placeholder={t('service.records.timeline.updatePlaceholder')} onChange={(event) => setBody(event.target.value)} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" className="accent-[var(--brand-accent)]" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
            {t('service.records.timeline.notify')}
          </label>
          <Button type="submit" loading={postUpdate.isPending} disabled={!body.trim()}>{t('service.records.timeline.post')}</Button>
        </div>
      </form>
      <ResourceState isLoading={timeline.isLoading} error={timeline.error} onRetry={timeline.refetch}>
        <ol className="grid gap-3">
          {(timeline.data || []).map((event) => {
            const Icon = ICONS[event.event_type] || CirclePlus
            const isCustomer = event.visibility === 'customer'
            return (
              <li key={event.id} className="flex gap-3">
                <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                <div className="grid min-w-0 flex-1 gap-0.5">
                  <p dir={event.event_type === 'customer_update' ? 'auto' : undefined} className="text-sm text-[var(--text)]">{text(event)}</p>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    {event.actor?.name || t('service.cases.activity.system')} · {formatRelativeTime(event.occurred_at, language)}
                    <span className="inline-flex items-center gap-1">
                      {isCustomer ? <Eye size={12} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
                      {t(isCustomer ? 'service.records.timeline.visibleToCustomer' : 'service.records.timeline.internal')}
                    </span>
                    {event.payload?.sent_via && <span>{t('service.records.timeline.sentVia', { channel: t(`service.cases.channels.${event.payload.sent_via}`, { defaultValue: event.payload.sent_via }) })}</span>}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </ResourceState>
    </div>
  )
}
