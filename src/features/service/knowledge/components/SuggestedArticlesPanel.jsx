import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useSuggestedArticles } from '../api/knowledgeApi'
import { ArticleReader } from './ArticleReader'

/** Case side panel: published articles the server finds relevant to this case. */
export function SuggestedArticlesPanel({ caseId }) {
  const { t, i18n } = useTranslation()
  const suggested = useSuggestedArticles(caseId)
  const [open, setOpen] = useState(null)
  const articles = suggested.data || []

  return (
    <section className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <BookOpen size={16} aria-hidden="true" className="text-[var(--text-muted)]" />
        {t('service.knowledge.suggested.title')}
      </h2>
      {suggested.isLoading && <Skeleton className="h-10 w-full" />}
      {suggested.error && (
        <button type="button" className="w-fit text-xs text-[var(--text-muted)] underline" onClick={() => suggested.refetch()}>
          {t('service.knowledge.suggested.error')}
        </button>
      )}
      {!suggested.isLoading && !suggested.error && !articles.length && (
        <p className="text-xs text-[var(--text-muted)]">{t('service.knowledge.suggested.empty')}</p>
      )}
      <ul className="grid gap-1">
        {articles.map((article) => (
          <li key={article.id}>
            <button
              type="button"
              onClick={() => setOpen(article)}
              className="grid w-full gap-0.5 rounded-md px-2 py-1.5 text-start hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <span className="line-clamp-2 text-sm font-medium text-[var(--text)]">
                <bdi lang={article.language}>{article.title}</bdi>
              </span>
              <span className="text-xs text-[var(--text-muted)]">{localizeLabel(article.category?.label, i18n.language, '')}</span>
            </button>
          </li>
        ))}
      </ul>
      <AppDrawer open={Boolean(open)} onClose={() => setOpen(null)} title={t('service.knowledge.suggested.drawerTitle')} size="md" pushPage={false}>
        <ArticleReader article={open} />
      </AppDrawer>
    </section>
  )
}
