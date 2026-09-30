import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Plus, Search } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useResourceList } from '../../settings/api/settingsApi'
import { kbCategoriesResource } from '../../settings/resources/communicationResources'
import { useKbArticleList } from '../api/knowledgeApi'
import { ARTICLE_STATUSES, ARTICLE_TYPES, ARTICLE_VIEWS } from '../utils/articleMeta'
import { ArticleMetaLine, ArticleStateChips, ArticleStatusBadge } from './ArticleBadges'
import { KnowledgeStats } from './KnowledgeStats'
import { cn } from '../../../../shared/utils/cn'

/** Internal knowledge base: search + filters + article list. `basePath` comes from the page. */
export function KnowledgeWorkspace({ basePath }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const debounced = useDebounce(search, 300)
  const categories = useResourceList(kbCategoriesResource)
  const articles = useKbArticleList({ search: debounced || undefined, category_id: categoryId || undefined, status: status || undefined, type: type || undefined })
  const items = articles.data?.data || []
  const counts = articles.data?.meta?.counts || {}

  return (
    <div className="grid gap-4">
      <KnowledgeStats />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('service.knowledge.fields.status')}>
        {['', ...ARTICLE_STATUSES, ...ARTICLE_VIEWS].map((key) => (
          <button key={key || 'all'} type="button" role="tab" aria-selected={status === key} onClick={() => setStatus(key)} className={cn('rounded-full border px-3 py-1 text-xs transition-colors', status === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]')}>
            {key ? t(ARTICLE_VIEWS.includes(key) ? `service.knowledge.views.${key}` : `service.knowledge.status.${key}`) : t('service.knowledge.allStatuses')}
            {key && counts[key] != null && <span className="ms-1.5 font-semibold">{counts[key]}</span>}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('service.knowledge.searchPlaceholder')}
            aria-label={t('service.knowledge.searchPlaceholder')}
            startIcon={<Search size={16} aria-hidden="true" />}
          />
          <Select
            aria-label={t('service.knowledge.fields.category')}
            placeholder={t('service.knowledge.allCategories')}
            value={categoryId}
            onChange={setCategoryId}
            options={(categories.data || []).map((category) => ({ value: category.id, label: localizeLabel(category.label, i18n.language, category.id) }))}
          />
          <Select
            aria-label={t('service.knowledge.fields.type')}
            placeholder={t('service.knowledge.allTypes')}
            value={type}
            onChange={setType}
            options={ARTICLE_TYPES.map((value) => ({ value, label: t(`service.knowledge.types.${value}`) }))}
          />
        </div>
        <Button className="shrink-0 whitespace-nowrap" onClick={() => navigate(`${basePath}/new`)}>
          <Plus size={16} aria-hidden="true" />
          {t('service.knowledge.newArticle')}
        </Button>
      </div>

      <ResourceState
        isLoading={articles.isLoading}
        error={articles.error}
        onRetry={articles.refetch}
        empty={!items.length}
        emptyIcon={<BookOpen size={24} />}
        emptyTitle={t('service.knowledge.emptyTitle')}
        emptyDescription={t('service.knowledge.emptyDescription')}
      >
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {items.map((article) => (
            <li key={article.id}>
              <Link
                to={`${basePath}/${article.id}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="truncate text-sm font-medium text-[var(--text)]">
                    {/* bdi: article language may differ from the UI; keep the row aligned with the UI */}
                    <bdi lang={article.language}>{article.title}</bdi>
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {localizeLabel(article.category?.label, i18n.language, '-')} · <ArticleMetaLine article={article} />
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <ArticleStateChips article={article} />
                  <ArticleStatusBadge status={article.status} />
                </span>
                {article.helpful_rate != null && <span className="text-xs text-[var(--text-muted)]">{t('service.knowledge.helpfulRate', { rate: article.helpful_rate })}</span>}
                <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(article.updated_at, i18n.language)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
    </div>
  )
}
