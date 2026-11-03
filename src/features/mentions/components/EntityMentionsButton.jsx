import { useState } from 'react'
import { AtSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../shared/components/overlays/AppModal'
import { useEntityMentions } from '../hooks/useMentions'
import { extractMentions } from '../utils/normalizeMentions'

export function EntityMentionsButton({ entityType, entityId }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const query = useEntityMentions(entityType, entityId, { enabled: open })
  const mentions = extractMentions(query.data)

  if (!entityType || entityId == null || entityId === '') return null

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]">
        <AtSign size={16} aria-hidden="true" />
        {t('mentions.title')}
      </button>
      <AppModal isOpen={open} onClose={() => setOpen(false)} title={t('mentions.title')}>
        {query.isPending ? (
          <p role="status" className="text-sm text-[var(--text-muted)]">{t('mentions.loading')}</p>
        ) : query.isError ? (
          <div role="alert" className="space-y-3">
            <p className="text-sm text-[var(--text)]">{t('mentions.error')}</p>
            <button type="button" onClick={() => query.refetch()} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]">{t('mentions.retry')}</button>
          </div>
        ) : mentions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{t('mentions.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {mentions.map((mention, index) => (
              <li key={mention.id ?? index} className="rounded-lg border border-[var(--border)] p-3">
                <p className="whitespace-pre-wrap break-words text-sm text-[var(--text)]">{mention.body ?? mention.message ?? mention.text ?? t('mentions.noText')}</p>
                {mention.created_at && <time className="mt-2 block text-xs text-[var(--text-muted)]" dateTime={mention.created_at}>{mention.created_at}</time>}
              </li>
            ))}
          </ul>
        )}
      </AppModal>
    </>
  )
}
