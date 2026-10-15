import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CornerDownLeft, Plus, Zap } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { getCategoryLabel } from '../../utils/categoryTree'
import { FormError } from '../../components/common/catalogUi'
import { HelpField } from '../../components/common/HelpTip'
import { CategoryDetails } from './CategoryDetails'
import { QuickCategoryDialog } from './QuickCategoryDialog'

/**
 * Quick add row (2026-10-15): name, category, price (and an optional item type that stays for the next items).
 * Enter saves; the name and price clear and the cursor goes back to the name. `quick` = useQuickAdd,
 * `lookups` = useProductForm (categories, item types of this kind).
 */
export function QuickAddForm({ kind, quick, lookups }) {
  const { t } = useTranslation()
  const nameRef = useRef(null)
  const [newCategory, setNewCategory] = useState(false)
  const { row, update, errors, error, submit, saving } = quick
  const fieldError = (key) => (errors[key] ? t(`catalog.validation.${errors[key]}`) : undefined)
  const helpPrefix = kind === 'service' ? 'productSetup.service.help' : 'productSetup.help'
  const help = (key) => ({ title: t(`${helpPrefix}.${key}.title`), text: t(`${helpPrefix}.${key}.text`) })

  const onSubmit = async (event) => {
    event.preventDefault()
    if (saving) return
    const ok = await submit()
    if (ok) nameRef.current?.focus()
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-labelledby="quick-add-title">
      <header className="mb-3">
        <h2 id="quick-add-title" className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
          <Zap size={17} className="text-[var(--brand-accent)]" aria-hidden="true" />
          {t(`productSetup.quickAdd.title.${kind}`)}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">{t('productSetup.quickAdd.description')}</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-3">
        <FormError message={error} />
        <div className="grid gap-3 md:grid-cols-[2fr_1.5fr_1fr]">
          <HelpField {...help('name')}>
            <Input ref={nameRef} label={t('catalog.product.fields.name')} value={row.name} autoFocus error={fieldError('name')} onChange={(event) => update({ name: event.target.value })} />
          </HelpField>
          <HelpField {...help('category')} className="space-y-1">
            <Select
              label={t('catalog.product.fields.category')}
              value={row.category_id}
              placeholder={t('catalog.product.noCategory')}
              options={lookups.categories.map((category) => ({ value: String(category.id), label: category._pathLabel || getCategoryLabel(category) }))}
              onChange={(value) => update({ category_id: value })}
            />
            <Button variant="ghost" size="sm" onClick={() => setNewCategory(true)}><Plus size={14} />{t('productSetup.quickCategory.open')}</Button>
          </HelpField>
          <HelpField {...help('price')}>
            <Input label={t('catalog.product.fields.price')} type="number" min={0} step="any" dir="ltr" value={row.price} error={fieldError('price')} onChange={(event) => update({ price: event.target.value })} />
          </HelpField>
        </div>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr] md:items-end">
          <HelpField {...help('itemType')}>
            <Select
              label={t('productSetup.quickAdd.itemType')}
              value={row.item_type_id}
              placeholder={t('catalog.product.noItemType')}
              options={lookups.itemTypes.map((itemType) => ({ value: String(itemType.id), label: itemType.name }))}
              onChange={(value) => update({ item_type_id: value })}
            />
          </HelpField>
          <Button type="submit" loading={saving}>
            <CornerDownLeft size={15} className="rtl:-scale-x-100" />
            {t('productSetup.quickAdd.save')}
          </Button>
        </div>
        <CategoryDetails categories={lookups.categories} categoryId={row.category_id} />
        <p className="text-xs text-[var(--text-muted)]">{t('productSetup.quickAdd.keyboardHint')}</p>
      </form>

      <QuickCategoryDialog
        open={newCategory}
        kind={kind}
        categories={lookups.categories}
        parentId={row.category_id}
        onClose={() => setNewCategory(false)}
        onSaved={(id) => id && update({ category_id: String(id) })}
      />
    </section>
  )
}
