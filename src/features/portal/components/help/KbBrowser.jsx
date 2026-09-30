import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { cn } from '../../../../shared/utils/cn'
import { portalApi, usePortalKey } from '../../api/portalApi'
import { usePortalFormat } from '../../utils/format'
import { PortalPage } from '../PortalPage'
import { KbArticleView } from './KbArticleView'

/**
 * Help center list: search, category chips, expandable articles with a helpful vote. `endpoints` = { list, article(id),
 * vote(id) } so the same browser serves signed-in customers and the public help center (server decides visibility).
 */
export function KbBrowser({ endpoints, scope }) {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const key = usePortalKey()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [openId, setOpenId] = useState(null)
  const debounced = useDebounce(search, 350)
  const params = { search: debounced || undefined, category_id: categoryId || undefined }
  const query = useQuery({ queryKey: key('kb', scope, params), queryFn: () => portalApi.page(endpoints.list, params), placeholderData: (previous) => previous })
  const articles = query.data?.data || []
  const categories = query.data?.meta?.categories || []
  return (
    <div className="grid gap-4">
      <div className="max-w-xl"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('portal.help.search')} aria-label={t('portal.help.search')} startIcon={<Search size={16} aria-hidden="true" />} /></div>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('portal.help.categories')}>
          {[{ id: '', label: null }, ...categories].map((category) => (
            <button key={category.id || 'all'} type="button" role="tab" aria-selected={categoryId === category.id} onClick={() => setCategoryId(category.id)} className={cn('rounded-full border px-3 py-1 text-sm', categoryId === category.id ? 'border-brand-accent font-semibold' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]')}>
              {category.id ? format.label(category.label, category.id) : t('portal.help.allTopics')}
            </button>
          ))}
        </div>
      )}
      <PortalPage level={2} title={debounced ? t('portal.help.results') : t('portal.help.popular')} query={query} empty={!articles.length} emptyTitle={debounced ? t('portal.help.noResults') : t('portal.help.empty')}>
        <div className="grid gap-2">
          {articles.map((article) => (
            <KbArticleView key={article.id} summary={article} open={openId === article.id} onToggle={() => setOpenId(openId === article.id ? null : article.id)} endpoints={endpoints} scope={scope} />
          ))}
        </div>
      </PortalPage>
    </div>
  )
}
