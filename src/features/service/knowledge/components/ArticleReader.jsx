import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { ArticleMetaLine, ArticleStatusBadge } from './ArticleBadges'

/**
 * Read-only article. The body is plain text (line breaks kept) — rich text
 * arrives with the portal (F5); `lang`/`dir="auto"` follow the article, not the UI.
 */
export function ArticleReader({ article }) {
  const { i18n } = useTranslation()
  if (!article) return null
  return (
    <article className="grid gap-3" lang={article.language}>
      <div className="flex flex-wrap items-center gap-2">
        <ArticleStatusBadge status={article.status} />
        <span className="text-xs text-[var(--text-muted)]">{localizeLabel(article.category?.label, i18n.language, '')}</span>
        <ArticleMetaLine article={article} />
      </div>
      <h2 dir="auto" className="text-lg font-bold text-[var(--text)]">{article.title}</h2>
      <p dir="auto" className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text)]">{article.body}</p>
      {article.updated_at && (
        <p className="text-xs text-[var(--text-muted)]">{formatDate(article.updated_at, i18n.language, { dateStyle: 'medium' })}</p>
      )}
    </article>
  )
}
