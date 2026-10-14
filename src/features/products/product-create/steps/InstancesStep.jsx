import { useTranslation } from 'react-i18next'
import { Button } from '../../../../shared/components/ui/Button'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { requiresSerials } from '../../utils/productCreateWizard'
import { InstanceInputs } from '../../components/instances/InstanceInputs'

/**
 * Wizard step: the pieces of the new product — serials (`serial_tracking`), real-estate units (`unique_unit`) or
 * batches with expiry (`batch_lot` / `expiry`). Optional; they can also be added later from the product page.
 */
export function InstancesStep({ itemType, modes, value, onChange, invalid = [], count, onQuickType }) {
  const { t } = useTranslation()
  const pattern = itemType?.capabilities?.find((capability) => capability.code === 'serial_tracking')?.config?.pattern

  if (!modes.length) {
    return (
      <div className="space-y-3">
        <ModuleNotice>{itemType ? t('catalog.create.noInstancesForType') : t('catalog.create.instancesNeedType')}</ModuleNotice>
        {!itemType && onQuickType && <Button variant="outline" size="sm" onClick={onQuickType}>{t('productSetup.quickType.open')}</Button>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">{t('catalog.create.instancesHint')}</p>
      {requiresSerials(itemType) && <ModuleNotice tone="warning">{t('catalog.create.serialsRequired')}</ModuleNotice>}
      <InstanceInputs value={value} modes={modes} pattern={pattern} onChange={onChange} />
      {invalid.length > 0 && <p className="text-xs text-[#EF4444]">{t('catalog.instances.patternMismatch', { pattern, serials: invalid.join(', ') })}</p>}
      <p className="text-xs text-[var(--text-muted)]">{t('catalog.create.instancesCount', { count })}</p>
    </div>
  )
}
