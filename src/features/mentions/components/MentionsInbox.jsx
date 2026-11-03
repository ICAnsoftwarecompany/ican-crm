import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMarkMentionSeen, useMyMentions, useSentMentions } from '../hooks/useMentions'
import { extractMentions } from '../utils/normalizeMentions'

export function MentionsInbox() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('mine')
  const markSeen = useMarkMentionSeen()
  const mine = useMyMentions({}, { enabled: tab === 'mine' })
  const sent = useSentMentions({}, { enabled: tab === 'sent' })
  const query = tab === 'mine' ? mine : sent
  const mentions = extractMentions(query.data)

  return <section className="space-y-3" aria-label={t('mentions.title')}>
    <div className="flex gap-2">
      {['mine', 'sent'].map(value => <button type="button" key={value} aria-pressed={tab === value}
        onClick={() => setTab(value)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
        {t(value === 'mine' ? 'mentions.received' : 'mentions.sent')}
      </button>)}
    </div>
    {query.isPending ? <p role="status">{t('mentions.loading')}</p> :
      query.isError ? <button type="button" onClick={() => query.refetch()}>{t('mentions.retry')}</button> :
      mentions.length === 0 ? <p>{t('mentions.empty')}</p> :
      <ul className="space-y-2">{mentions.map((mention, index) =>
        <li key={mention.id ?? index} className="rounded-lg border border-[var(--border)] p-3">
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{mention.entity_label ?? `${mention.entity_type ?? ''} #${mention.entity_id ?? ''}`}</p>
            <p className="whitespace-pre-wrap">{mention.message ?? mention.body ?? mention.text ?? t('mentions.noText')}</p>
            <p className="text-xs text-[var(--text-muted)]">{mention.by?.name ?? '—'} → {mention.user?.name ?? '—'} · {mention.type ?? ''} · {mention.created_at ? new Date(mention.created_at).toLocaleString() : ''}</p>
            <p className="text-xs text-[var(--text-muted)]">{mention.seen ? 'تمت القراءة' : 'غير مقروء'}</p>
          </div>
          {tab === 'mine' && mention.id != null && !mention.seen && !mention.seen_at && !mention.is_seen && (
            <button type="button" disabled={markSeen.isPending} onClick={() => markSeen.mutate(mention.id)}
              className="ms-2 rounded-lg border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-50">
              {t('mentions.markSeen')}
            </button>
          )}
        </li>)}</ul>}
  </section>
}
