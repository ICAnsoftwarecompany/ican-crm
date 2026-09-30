import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Lightbulb } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalKey } from '../../api/portalApi'
import { KbArticleView } from '../help/KbArticleView'

const ENDPOINTS = { list: P.kb, article: P.kbArticle, vote: P.kbVote }

/** While the customer writes a request, suggest published answers; "This solved it" records a deflection. */
export function KbDeflection({ text, onSolved }) {
  const { t } = useTranslation()
  const key = usePortalKey()
  const [openId, setOpenId] = useState(null)
  const debounced = useDebounce(text.trim(), 600)
  const query = useQuery({ queryKey: key('kb-suggest', debounced), queryFn: () => portalApi.list(P.kbSuggest, { q: debounced }), enabled: debounced.length >= 4, staleTime: 60 * 1000 })
  const articles = query.data || []
  if (!articles.length) return null
  const solved = async (article) => {
    try {
      await portalApi.post(P.kbDeflections, { article_id: article.id, query: debounced })
    } finally {
      onSolved()
    }
  }
  return (
    <section className="grid gap-2 rounded-xl border border-brand-accent bg-[var(--surface)] p-4" aria-live="polite" aria-label={t('portal.help.maybeAnswered')}>
      <h2 className="flex items-center gap-2 font-semibold"><Lightbulb size={18} aria-hidden="true" className="text-brand-accent" />{t('portal.help.maybeAnswered')}</h2>
      {articles.map((article) => (
        <KbArticleView key={article.id} summary={article} open={openId === article.id} onToggle={() => setOpenId(openId === article.id ? null : article.id)} endpoints={ENDPOINTS} scope="suggest"
          footer={<Button size="sm" className="w-fit" onClick={() => solved(article)}>{t('portal.help.solvedIt')}</Button>} />
      ))}
    </section>
  )
}
