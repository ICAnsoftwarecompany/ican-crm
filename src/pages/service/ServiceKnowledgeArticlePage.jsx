import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { ArticleEditor, useKbArticle } from '../../features/service'

const BASE = '/service/knowledge'

/** /service/knowledge/:articleId — edit an article; `new` creates one. */
export function ServiceKnowledgeArticlePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { articleId } = useParams()
  const isNew = articleId === 'new'
  const article = useKbArticle(isNew ? null : articleId)
  usePageHeader({ title: t(isNew ? 'service.knowledge.newArticle' : 'service.knowledge.editArticle'), icon: BookOpen })

  return (
    <div className="grid gap-4 p-4 lg:p-5">
      <Link to={BASE} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.knowledge.back')}
      </Link>
      <ResourceState isLoading={!isNew && article.isLoading} error={!isNew && article.error} onRetry={article.refetch}>
        <ArticleEditor
          article={isNew ? null : article.data}
          onSaved={(saved) => isNew && navigate(`${BASE}/${saved.id}`, { replace: true })}
          onDeleted={() => navigate(BASE, { replace: true })}
        />
      </ResourceState>
    </div>
  )
}

export default ServiceKnowledgeArticlePage
