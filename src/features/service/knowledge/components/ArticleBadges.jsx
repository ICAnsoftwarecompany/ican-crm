import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { ARTICLE_STATUS_TONE } from '../utils/articleMeta'

export function ArticleStatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--text)]">
      <span className={cn('h-2 w-2 rounded-full', ARTICLE_STATUS_TONE[status])} aria-hidden="true" />
      {t(`service.knowledge.status.${status}`)}
    </span>
  )
}

export function ArticleMetaLine({ article }) {
  const { t } = useTranslation()
  return (
    <span className="text-xs text-[var(--text-muted)]">
      {t(`service.knowledge.types.${article.type || 'article'}`)} · {t(`service.knowledge.visibility.${article.visibility}`)} · {t(`service.knowledge.languages.${article.language}`)}
    </span>
  )
}

/** Live / unpublished-changes / expiry chips next to the status. */
export function ArticleStateChips({ article }) {
  const { t } = useTranslation()
  const chip = 'rounded-full border px-2 py-0.5 text-xs'
  return (
    <>
      {article.live && article.status !== 'published' && <span className={cn(chip, 'border-status-won text-[var(--text)]')}>{t('service.knowledge.liveVersion', { n: article.published_version })}</span>}
      {article.expired && <span className={cn(chip, 'border-sla-breached text-sla-breached')}>{t('service.knowledge.expired')}</span>}
      {article.expiring_soon && <span className={cn(chip, 'border-sla-at-risk text-sla-at-risk')}>{t('service.knowledge.expiringSoon')}</span>}
    </>
  )
}
