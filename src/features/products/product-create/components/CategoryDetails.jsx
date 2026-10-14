import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, FolderTree } from 'lucide-react'
import { ActiveBadge } from '../../components/common/catalogUi'
import { categoryPath, describeCategory, inheritedFieldNames } from '../utils/categoryPath'

/**
 * Under the category select (2026-10-15): the path root → … → chosen category, and the details of every level
 * (description, status, sub-categories, additional fields). The additional fields of the whole path are suggested in
 * the "details" step. `categories` = the flattened list of useProductForm (roots have `_depth` 0).
 */
export function CategoryDetails({ categories = [], categoryId }) {
  const { t, i18n } = useTranslation()
  const tree = useMemo(() => categories.filter((category) => !category._depth), [categories])
  const path = useMemo(() => categoryPath(tree, categoryId), [categoryId, tree])
  if (!path.length) return null
  const Separator = i18n.dir?.() === 'rtl' ? ChevronLeft : ChevronRight
  const fields = inheritedFieldNames(path)

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3" aria-label={t('productSetup.category.detailsLabel')}>
      <ol className="mb-3 flex flex-wrap items-center gap-1 text-sm font-semibold text-[var(--text)]">
        <FolderTree size={15} className="me-1 text-[var(--brand-accent)]" aria-hidden="true" />
        {path.map((category, index) => (
          <li key={category.id} className="flex items-center gap-1">
            {index > 0 && <Separator size={14} className="text-[var(--text-muted)]" aria-hidden="true" />}
            {describeCategory(category).name}
          </li>
        ))}
      </ol>
      <ul className="space-y-2">
        {path.map((category, index) => {
          const info = describeCategory(category)
          const level = index === path.length - 1 ? 'selected' : index === path.length - 2 ? 'parent' : 'ancestor'
          return (
            <li key={category.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[var(--text)]">
                  <span className="me-2 text-xs font-normal text-[var(--text-muted)]">{t(`productSetup.category.level.${level}`)}</span>
                  {info.name}
                </span>
                <ActiveBadge active={info.active} />
              </div>
              {info.description && <p className="mt-1 text-xs text-[var(--text-muted)]">{info.description}</p>}
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {t('productSetup.category.children', { count: info.childrenCount })}
                {info.fields.length > 0 && ` · ${t('productSetup.category.fields', { fields: info.fields.join(' · ') })}`}
              </p>
            </li>
          )
        })}
      </ul>
      {fields.length > 0 && <p className="mt-2 text-xs text-[var(--text-muted)]">{t('productSetup.category.inheritedHint', { count: fields.length })}</p>}
    </section>
  )
}
