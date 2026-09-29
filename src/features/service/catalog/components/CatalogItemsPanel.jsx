import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useCatalogItems } from '../api/catalogApi'
import { CatalogItemDrawer } from './CatalogItemDrawer'

const KINDS = ['product', 'service']

/**
 * Settings section: the existing Products & Services with their service
 * configuration (type, what the sale creates, attached services). Product
 * data itself (name, price, image) is edited in Products, not here.
 */
export function CatalogItemsPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState('')
  const [open, setOpen] = useState(null)
  const debounced = useDebounce(search, 300)
  const items = useCatalogItems({ search: debounced || undefined, kind: kind || undefined })
  const list = items.data || []
  const Icon = resource.icon
  const number = (value) => new Intl.NumberFormat(i18n.language).format(value)

  return (
    <section className="grid gap-4">
      <header>
        <h1 className="flex items-center gap-2 text-lg font-bold text-[var(--text)]">
          <Icon size={18} aria-hidden="true" className="text-[var(--text-muted)]" />
          {t(`${resource.i18nKey}.title`)}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
      </header>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.catalog.searchItems')} aria-label={t('service.catalog.searchItems')} startIcon={<Search size={16} aria-hidden="true" />} />
        <Select aria-label={t('service.catalog.kind')} placeholder={t('service.catalog.allKinds')} value={kind} onChange={setKind} options={KINDS.map((value) => ({ value, label: t(`service.catalog.kinds.${value}`) }))} />
      </div>
      <ResourceState isLoading={items.isLoading} error={items.error} onRetry={items.refetch} empty={!list.length} emptyIcon={<Package size={24} />} emptyTitle={t('service.catalog.noItems')}>
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {list.map((item) => {
            const config = item.service_config || {}
            return (
              <li key={item.id}>
                <button type="button" onClick={() => setOpen(item)} className="grid w-full gap-1 px-4 py-3 text-start hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <span className="grid min-w-0 gap-0.5">
                    <span className="truncate text-sm font-medium text-[var(--text)]">{localizeLabel(item.name, i18n.language, item.id)}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {t(`service.catalog.kinds.${item.kind}`)} ·{' '}
                      {item.item_type ? localizeLabel(item.item_type.name, i18n.language, item.item_type.key) : t('service.catalog.noType')} ·{' '}
                      {t('service.catalog.createsLabel', { entity: t(`service.catalog.creates.${config.fulfillment?.creates || 'none'}`) })}
                      {config.relations?.length ? ` · ${t('service.catalog.relationsCount', { count: config.relations.length })}` : ''}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-[var(--text)]" dir="ltr">{number(item.price)} {item.currency}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </ResourceState>
      <CatalogItemDrawer item={open} items={list} onClose={() => setOpen(null)} />
    </section>
  )
}
