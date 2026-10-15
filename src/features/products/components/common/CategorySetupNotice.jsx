import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderTree, X } from 'lucide-react'
import { categoryTypeForKind } from '../../constants/catalogOptions'
import { usePersistentFlag } from '../../hooks/usePersistentFlag'
import { useProductCategories } from '../../hooks/useProducts'
import { countCategoriesByType } from '../../utils/categoryCounts'
import { flattenCategoryTree } from '../../utils/categoryTree'

/**
 * "No categories yet" (2026-10-15), next to the item type guide on the products / services lists: categories group the
 * items in lists, filters and reports, so the notice explains that and links to the categories page. Shown only while
 * there is no active category of the list's type; it can be dismissed (remembered in this browser).
 */
export function CategorySetupNotice({ kind = 'product' }) {
  const { t } = useTranslation()
  const type = categoryTypeForKind(kind)
  const query = useProductCategories()
  const [dismissed, setDismissed] = usePersistentFlag(`category-notice-dismissed-${type}`, false)
  const counts = useMemo(() => countCategoriesByType(flattenCategoryTree(query.data || [])), [query.data])

  if (query.isLoading || query.isError || dismissed || counts[type] > 0) return null
  const to = type === 'service' ? '/products/service-categories' : '/products/categories'

  return (
    <section className="relative flex items-start gap-3 rounded-lg border border-[var(--ai-border)] bg-[var(--ai-bg)] p-4" aria-labelledby={`category-notice-${type}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--ai-text)]">
        <FolderTree size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pe-6">
        <h2 id={`category-notice-${type}`} className="text-sm font-bold text-[var(--ai-text)]">{t(`catalog.categoryNotice.title.${type}`)}</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text)]">{t(`catalog.categoryNotice.text.${type}`)}</p>
        <Link to={to} className="mt-2 inline-block text-sm font-semibold text-[var(--brand-accent)] hover:underline">{t(`catalog.categoryNotice.action.${type}`)}</Link>
      </div>
      <button
        type="button"
        className="absolute end-2 top-2 rounded p-1 text-[var(--text-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
        aria-label={t('catalog.categoryNotice.dismiss')}
        onClick={() => setDismissed(true)}
      >
        <X size={16} />
      </button>
    </section>
  )
}
