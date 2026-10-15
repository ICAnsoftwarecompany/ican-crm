import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, PackageSearch, Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Button } from '../../../../shared/components/ui/Button'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { cn } from '../../../../shared/utils/cn'
import { KindBadge, useNumberFormat } from '../../../products'
import { INTEREST_KINDS, countByKind, filterInterestProducts, itemTypeFilters } from '../utils/interestProfile'

const chipClass = (active) => cn(
  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors',
  active
    ? 'border-[#00C2CB] bg-[var(--surface-2)] text-[var(--text)]'
    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
)

/**
 * Step 1 of the interest dialog: choose what the lead wants — kind tabs (products / services / plans / bundles),
 * item type chips, search, then a list of catalog items with their type, category and price.
 */
export function InterestProductPicker({ catalog, selectedId, onChoose }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const [kind, setKind] = useState('all')
  const [itemTypeId, setItemTypeId] = useState('')
  const [search, setSearch] = useState('')
  const { products, itemTypes } = catalog

  const counts = useMemo(() => countByKind(products), [products])
  const ofKind = useMemo(() => filterInterestProducts(products, { kind }), [kind, products])
  const typeChips = useMemo(() => itemTypeFilters(ofKind, itemTypes), [itemTypes, ofKind])
  const visible = useMemo(() => filterInterestProducts(ofKind, { itemTypeId, search }), [itemTypeId, ofKind, search])
  const typeName = (id) => itemTypes.find((itemType) => String(itemType.id) === String(id))?.name || ''

  if (catalog.isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-14 w-full" />)}
      </div>
    )
  }

  if (catalog.error) {
    return (
      <EmptyState
        icon={<PackageSearch size={24} />}
        title={t('leads.interestDialog.picker.loadFailed')}
        action={<Button type="button" variant="outline" onClick={() => catalog.refetch()}>{t('leads.interestDialog.picker.retry')}</Button>}
      />
    )
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={<PackageSearch size={24} />}
        title={t('leads.interestDialog.picker.emptyCatalog')}
        description={t('leads.interestDialog.picker.emptyCatalogHint')}
        action={<a href="/products/new" target="_blank" rel="noreferrer" className="text-sm font-bold text-[#00A3AA] hover:underline">{t('leads.interestDialog.picker.addToCatalog')}</a>}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label={t('leads.interestDialog.picker.kindsLabel')}>
        {['all', ...INTEREST_KINDS].filter((value) => value === 'all' || counts[value] > 0).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={kind === value}
            className={chipClass(kind === value)}
            onClick={() => {
              setKind(value)
              setItemTypeId('')
            }}
          >
            {t(`leads.interestDialog.kinds.${value}`)}
            <span className="text-[var(--text-light)]">{counts[value]}</span>
          </button>
        ))}
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t('leads.interestDialog.picker.search')}
        aria-label={t('leads.interestDialog.picker.search')}
        startIcon={<Search size={16} />}
      />

      {typeChips.length > 1 && (
        <div className="flex flex-wrap gap-1.5" aria-label={t('leads.interestDialog.picker.typesLabel')}>
          <button type="button" className={chipClass(!itemTypeId)} onClick={() => setItemTypeId('')}>
            {t('leads.interestDialog.picker.allTypes')}
          </button>
          {typeChips.map((chip) => (
            <button key={chip.id} type="button" className={chipClass(itemTypeId === chip.id)} onClick={() => setItemTypeId(chip.id)}>
              {chip.id === 'none' ? t('leads.interestDialog.picker.noType') : chip.name || `#${chip.id}`}
              <span className="text-[var(--text-light)]">{chip.count}</span>
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
          {t('leads.interestDialog.picker.noResults')}
        </p>
      ) : (
        <ul className="max-h-[22rem] space-y-1.5 overflow-y-auto pe-1">
          {visible.map((product) => {
            const selected = String(product.id) === String(selectedId)
            const meta = [typeName(product.itemTypeId), product.category?.name].filter(Boolean).join(' · ')
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => onChoose(product.id)}
                  className={cn(
                    'flex w-full min-w-0 items-center gap-3 rounded-lg border p-3 text-start transition-colors',
                    selected ? 'border-[#00C2CB] bg-[var(--surface-2)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-[var(--text)]">{product.name || `#${product.id}`}</span>
                      <KindBadge kind={product.kind} />
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">
                      {meta || t('leads.interestDialog.picker.noType')}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-[var(--text)]" dir="ltr">
                    {product.price === null ? '—' : formatNumber(product.price)}
                  </span>
                  {selected && <Check size={16} className="shrink-0 text-[#00C2CB]" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
