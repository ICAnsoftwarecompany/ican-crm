import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { portalApi, usePortalKey } from '../../api/portalApi'
import { usePortalFormat } from '../../utils/format'

/** One article row: opens to the full (published) text and asks "Was this helpful?" once. */
export function KbArticleView({ summary, open, onToggle, endpoints, scope, footer }) {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const key = usePortalKey()
  const [voted, setVoted] = useState(null)
  const detail = useQuery({ queryKey: key('kb-article', scope, summary.id), queryFn: () => portalApi.get(endpoints.article(summary.id)), enabled: open && !summary.body, staleTime: 5 * 60 * 1000 })
  const article = summary.body ? summary : detail.data
  const vote = async (helpful) => {
    setVoted(helpful)
    try {
      await portalApi.post(endpoints.vote(summary.id), { helpful })
    } catch {
      setVoted(null)
    }
  }
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-start justify-between gap-3 p-4 text-start">
        <span className="grid gap-0.5">
          <bdi lang={summary.language} className="font-medium">{summary.title}</bdi>
          {!open && summary.excerpt && <bdi lang={summary.language} className="line-clamp-1 text-sm text-[var(--text-muted)]">{summary.excerpt}</bdi>}
        </span>
        <ChevronDown size={18} aria-hidden="true" className={cn('mt-0.5 shrink-0 text-[var(--text-muted)] transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="grid gap-3 border-t border-[var(--border)] p-4">
          <ResourceState isLoading={!article && detail.isLoading} error={detail.error} onRetry={detail.refetch}>
            {article && <p dir="auto" lang={article.language} className="whitespace-pre-line text-sm leading-7">{article.body}</p>}
          </ResourceState>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-muted)]">{t('portal.help.updated', { date: format.date(summary.updated_at) })}</span>
            {voted === null ? (
              <span className="flex items-center gap-2 text-sm">
                {t('portal.help.wasHelpful')}
                <Button size="sm" variant="outline" onClick={() => vote(true)}><ThumbsUp size={14} aria-hidden="true" />{t('portal.help.yes')}</Button>
                <Button size="sm" variant="outline" onClick={() => vote(false)}><ThumbsDown size={14} aria-hidden="true" />{t('portal.help.no')}</Button>
              </span>
            ) : (
              <span className="text-sm text-[var(--text-muted)]">{t(voted ? 'portal.help.votedYes' : 'portal.help.votedNo')}</span>
            )}
          </div>
          {footer}
        </div>
      )}
    </article>
  )
}
