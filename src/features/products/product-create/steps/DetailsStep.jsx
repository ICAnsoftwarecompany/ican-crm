import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AdditionalDataFields } from '../../components/common/AdditionalDataFields'
import { ProductCapabilityFields } from '../../components/products/ProductCapabilityFields'
import { categoryPath, inheritedFieldNames } from '../utils/categoryPath'

/**
 * Step 3: the item type's capability fields (the product can override each default), what a sale creates, and free
 * additional data — the field names of the chosen category and all its parents are suggested.
 */
export function DetailsStep({ wizard }) {
  const { t } = useTranslation()
  const { formState } = wizard
  const suggestions = useMemo(() => {
    const tree = formState.categories.filter((category) => !category._depth)
    return inheritedFieldNames(categoryPath(tree, formState.form.category_id))
  }, [formState.categories, formState.form.category_id])

  return (
    <div className="space-y-6">
      <ProductCapabilityFields state={formState} />
      <div className="border-t border-[var(--border)] pt-4">
        <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">{t('catalog.product.tabs.additional')}</h3>
        <p className="mb-3 text-xs text-[var(--text-muted)]">{t('productSetup.details.additionalHint')}</p>
        <AdditionalDataFields rows={formState.additionalRows} onChange={formState.setAdditionalRows} suggestions={suggestions} />
      </div>
    </div>
  )
}
