import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { useProductInstanceMutations } from '../../hooks/useProductResources'
import { buildInstancesPayload } from '../../utils/catalogForms'
import { createInstancesState, instanceModesForItemType } from '../../utils/productCreateWizard'
import { formatApiError } from '../../utils/apiErrors'
import { FormError } from '../common/catalogUi'
import { InstanceInputs } from './InstanceInputs'

const ALL_MODES = ['serial', 'unit', 'batch']

/**
 * Add instances to a product (2026-10-06): serial numbers (`serial_tracking`, checked against the item type's
 * pattern), real-estate units (`unique_unit`) or batches with expiry (`batch_lot` / `expiry`).
 */
export function CreateInstancesDialog({ open, product, itemType, onClose }) {
  const { t } = useTranslation()
  const mutations = useProductInstanceMutations()
  const allowed = instanceModesForItemType(itemType)
  const modes = allowed.length ? allowed : ALL_MODES
  const pattern = itemType?.capabilities?.find((capability) => capability.code === 'serial_tracking')?.config?.pattern
  const [value, setValue] = useState(() => createInstancesState(modes[0]))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setValue(createInstancesState(modes[0]))
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open])

  const input = value.mode === 'serial' ? value.serials : value.mode === 'unit' ? value.unitRows : value.batchRows
  const { instances, invalid } = buildInstancesPayload(value.mode, input, { pattern })

  const submit = async () => {
    if (!instances.length) return setError(t('catalog.instances.nothingToAdd'))
    if (invalid.length) return setError(t('catalog.instances.patternMismatch', { pattern, serials: invalid.join(', ') }))
    try {
      await mutations.create.mutateAsync({ productId: product.id, instances })
      toast.success(t('catalog.instances.added', { count: instances.length }))
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={mutations.create.isPending}
      size="lg"
      title={t('catalog.instances.addTitle', { name: product.name })}
      submitText={t('catalog.instances.addCount', { count: instances.length })}
    >
      <div className="space-y-4">
        <FormError message={error} />
        {!allowed.length && <ModuleNotice tone="warning">{t('catalog.instances.noInstanceCapability')}</ModuleNotice>}
        <InstanceInputs value={value} modes={modes} pattern={pattern} onChange={setValue} />
      </div>
    </FormDialog>
  )
}
