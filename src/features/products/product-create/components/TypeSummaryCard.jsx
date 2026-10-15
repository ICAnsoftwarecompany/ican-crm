import { useTranslation } from 'react-i18next'
import { Layers, PencilLine } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { CapabilityChips, useOptionLabel } from '../../components/common/catalogUi'
import { productRelationsFromType, productUnitsFromType } from '../../item-type-wizard'
import { instanceModesForItemType } from '../../utils/productCreateWizard'

/**
 * Under the item type select (2026-10-15): what the chosen type brings to this product — capabilities (= extra fields),
 * default units, attached items, the pieces it holds and what a sale creates — or, with no type, that every step is
 * filled by hand. `onQuickType` offers the quick item type dialog.
 */
export function TypeSummaryCard({ itemType, loading, onQuickType, kind = 'product' }) {
  const { t } = useTranslation()
  const optionLabel = useOptionLabel()

  if (!itemType) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-dashed border-[var(--border)] p-3">
        <p className="flex min-w-0 items-start gap-2 text-sm text-[var(--text-muted)]">
          <PencilLine size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{t(loading ? 'catalog.common.loading' : kind === 'service' ? 'productSetup.service.type.manual' : 'productSetup.type.manual')}</span>
        </p>
        {onQuickType && !loading && <Button size="sm" variant="outline" onClick={onQuickType}>{t('productSetup.quickType.open')}</Button>}
      </div>
    )
  }

  const units = productUnitsFromType(itemType)
  const relations = productRelationsFromType(itemType)
  const modes = instanceModesForItemType(itemType)
  const creates = itemType.fulfillmentConfig?.creates

  return (
    <section className="rounded-lg border border-[var(--ai-border)] bg-[var(--ai-bg)] p-3" aria-label={t('productSetup.type.summaryLabel')}>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--ai-text)]">
        <Layers size={16} aria-hidden="true" />
        {t('productSetup.type.brings', { name: itemType.name })}
      </h3>
      <CapabilityChips capabilities={itemType.capabilities} emptyText={t('catalog.itemTypes.noCapabilities')} />
      <ul className="mt-2 space-y-0.5 text-xs text-[var(--text)]">
        {/* Services: no units and no pieces (2026-10-15). */}
        {kind === 'product' && <li>{t('productSetup.type.units', { count: units.length })}</li>}
        <li>{t(kind === 'service' ? 'productSetup.service.type.relations' : 'productSetup.type.relations', { count: relations.length })}</li>
        {kind === 'product' && <li>{modes.length ? t('productSetup.type.pieces', { modes: modes.map((mode) => t(`productSetup.instanceModes.${mode}`)).join(' / ') }) : t('productSetup.type.noPieces')}</li>}
        {creates && <li>{t('productSetup.type.creates', { value: optionLabel('creates', creates) })}</li>}
      </ul>
    </section>
  )
}
