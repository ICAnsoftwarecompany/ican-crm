import { useTranslation } from 'react-i18next'
import { FormError } from '../../components/common/catalogUi'
import { CompletenessMeter } from '../components/CompletenessMeter'
import { productCompleteness } from '../utils/productCompleteness'

/** Last step: before → after for each completed item, and the new completeness. */
export function CompletionReview({ completion }) {
  const { t } = useTranslation()
  const { product, preview, missing, formState, error, goTo } = completion
  const after = productCompleteness(preview)
  const itemTypeName = formState.itemTypes.find((item) => String(item.id) === String(formState.form.item_type_id))?.name
  const categoryName = formState.categories.find((item) => String(item.id) === String(formState.form.category_id))?._pathLabel
  const value = {
    name: preview.name,
    price: preview.price,
    itemType: itemTypeName,
    category: categoryName,
    description: preview.description,
    image: formState.form.image?.name,
  }

  return (
    <div className="space-y-4">
      <FormError message={error} />
      <div className="rounded-lg border border-[var(--border)] p-3">
        <p className="mb-2 text-sm text-[var(--text)]">{t('productDetails.complete.after', { before: productCompleteness(product).score, after: after.score })}</p>
        <CompletenessMeter completeness={after} />
      </div>
      <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
        {missing.map((key) => (
          <li key={key} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
            <span className="text-[var(--text-muted)]">{t(`productDetails.checks.${key}`)}</span>
            <span className="flex items-center gap-2">
              <span className={value[key] !== undefined && value[key] !== null && value[key] !== '' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}>
                {value[key] !== undefined && value[key] !== null && value[key] !== '' ? String(value[key]) : t('productDetails.complete.leftEmpty')}
              </span>
              <button type="button" className="text-xs text-[var(--brand-accent)] hover:underline" onClick={() => goTo(key)}>{t('actions.edit')}</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
