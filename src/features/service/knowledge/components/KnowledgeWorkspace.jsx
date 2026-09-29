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
import { useKbArticles } from '../api/knowledgeApi'
import { ARTICLE_STATUSES } from '../utils/articleMeta'
import { ArticleMetaLine, ArticleStatusBadge } from './ArticleBadges'

/** Internal knowledge base: search + filters + article list. `basePath` comes from the page. */
export function KnowledgeWorkspace({ basePath }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const debounced = useDebounce(search, 300)
  const categories = useResourceList(kbCategoriesResource)
  const articles = useKbArticles({ search: debounced || undefined, category_id: categoryId || undefined, status: status || undefined })
  const items = articles.data || []

  return (
    <div className="grid gap-4">
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
            aria-label={t('service.knowledge.fields.status')}
            placeholder={t('service.knowledge.allStatuses')}
            value={status}
            onChange={setStatus}
            options={ARTICLE_STATUSES.map((value) => ({ value, label: t(`service.knowledge.status.${value}`) }))}
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
                <ArticleStatusBadge status={article.status} />
                <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(article.updated_at, i18n.language)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
    </div>
  )
}
