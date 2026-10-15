import { ProductBasicFields } from '../../components/products/ProductBasicFields'
import { CategoryDetails } from '../components/CategoryDetails'
import { TypeSummaryCard } from '../components/TypeSummaryCard'

/** Step 1: name, kind, item type (+ what it brings), category (+ its path), price, description, image, status. */
export function BasicsStep({ wizard, onQuickType, onQuickCategory, kind = 'product' }) {
  const { formState, itemType } = wizard
  return (
    <ProductBasicFields
      mode="create"
      state={formState}
      onCreateItemType={onQuickType}
      onCreateCategory={onQuickCategory}
      allowedKinds={kind === 'service' ? ['service'] : ['product', 'plan', 'bundle']}
      itemTypeExtra={<TypeSummaryCard itemType={itemType} loading={Boolean(formState.form.item_type_id) && formState.isLoadingItemType} onQuickType={onQuickType} kind={kind} />}
      categoryExtra={<CategoryDetails categories={formState.categories} categoryId={formState.form.category_id} />}
    />
  )
}
