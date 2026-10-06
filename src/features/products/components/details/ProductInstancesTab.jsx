import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Select } from '../../../../shared/components/ui/Select'
import { AVAILABILITY_STATUSES } from '../../constants/catalogOptions'
import { useProductInstances } from '../../hooks/useProductResources'
import { useOptions } from '../common/catalogUi'
import { CreateInstancesDialog } from '../instances/CreateInstancesDialog'
import { InstancesTable } from '../instances/InstancesTable'
import { useInstanceActions } from '../instances/useInstanceActions'

const PER_PAGE = 200

/** Instances of one product: serial numbers, units or batches, with availability (2026-10-06). */
export function ProductInstancesTab({ product, itemType }) {
  const { t } = useTranslation()
  const [availability, setAvailability] = useState('')
  const [creating, setCreating] = useState(false)
  const availabilityOptions = useOptions('availability', AVAILABILITY_STATUSES)
  const query = useProductInstances({ product_id: product.id, availability_status: availability, per_page: PER_PAGE })
  const actions = useInstanceActions()
  const count = query.data?.length || 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full sm:w-56">
          <Select
            label={t('catalog.instances.fields.availability')}
            value={availability}
            placeholder={t('catalog.common.all')}
            options={availabilityOptions}
            onChange={setAvailability}
          />
        </div>
        <Button size="sm" onClick={() => setCreating(true)}><Plus size={14} />{t('catalog.instances.add')}</Button>
      </div>
      {count >= PER_PAGE && <p className="text-xs text-[var(--text-muted)]">{t('catalog.instances.limitNote', { count: PER_PAGE })}</p>}
      <InstancesTable
        instances={query.data || []}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        tableId="catalog-product-instances"
        onEdit={actions.onEdit}
        onVoid={actions.onVoid}
        onRestore={actions.onRestore}
      />
      {actions.dialogs}
      <CreateInstancesDialog open={creating} product={product} itemType={itemType} onClose={() => setCreating(false)} />
    </div>
  )
}
