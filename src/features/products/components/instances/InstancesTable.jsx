import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Ban, Edit3, RotateCcw } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Badge } from '../../../../shared/components/ui/Badge'
import { DataTable } from '../../../../shared/components/data-table'
import { daysUntil, instanceLabel } from '../../utils/catalogNormalize'
import { AvailabilityBadge, useOptionLabel } from '../common/catalogUi'

function ExpiryCell({ date }) {
  const { t } = useTranslation()
  if (!date) return <span className="text-[var(--text-muted)]">—</span>
  const days = daysUntil(date)
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span dir="ltr">{date}</span>
      {days !== null && days < 0 && <Badge variant="danger">{t('catalog.instances.expired')}</Badge>}
      {days !== null && days >= 0 && days <= 30 && <Badge variant="warning">{t('catalog.instances.expiresIn', { count: days })}</Badge>}
    </span>
  )
}

/** Instances (serial / unit / batch) with edit, void and restore. Shared by the product tab and the instances page. */
export function InstancesTable({ instances = [], showProduct = false, isLoading, error, onRetry, onEdit, onVoid, onRestore, tableId }) {
  const { t } = useTranslation()
  const optionLabel = useOptionLabel()

  const rows = useMemo(() => instances.map((instance) => ({
    ...instance,
    _label: instanceLabel(instance),
    _availabilityLabel: instance.voided ? t('catalog.instances.voided') : optionLabel('availability', instance.availability),
  })), [instances, optionLabel, t])

  const columns = useMemo(() => [
    { id: 'label', header: t('catalog.instances.fields.identifier'), accessor: '_label', sortable: true, render: (row) => <span className="font-semibold" dir="auto">{row._label}</span> },
    ...(showProduct ? [{
      id: 'product', header: t('catalog.instances.fields.product'), accessor: 'productName', sortable: true,
      render: (row) => (row.productId
        ? <Link to={`/products/${row.productId}?tab=instances`} className="hover:underline" onClick={(event) => event.stopPropagation()}>{row.productName || `#${row.productId}`}</Link>
        : '—'),
    }] : []),
    { id: 'serial', header: t('catalog.instances.fields.serialNumber'), accessor: 'serialNumber', visible: false, render: (row) => <span dir="ltr">{row.serialNumber || '—'}</span> },
    { id: 'batch', header: t('catalog.instances.fields.batchNo'), accessor: 'batchNo', render: (row) => <span dir="ltr">{row.batchNo || '—'}</span> },
    { id: 'expiry', header: t('catalog.instances.fields.expiryDate'), accessor: 'expiryDate', sortable: true, render: (row) => <ExpiryCell date={row.expiryDate} /> },
    { id: 'availability', header: t('catalog.instances.fields.availability'), accessor: '_availabilityLabel', sortable: true, render: (row) => <AvailabilityBadge status={row.availability} voided={row.voided} /> },
    {
      id: 'actions', header: t('catalog.columns.actions'), accessor: 'id', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onEdit(row) }} aria-label={t('actions.edit')}><Edit3 size={16} /></Button>
          {row.voided
            ? <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onRestore(row) }} aria-label={t('catalog.instances.restore')}><RotateCcw size={16} /></Button>
            : <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onVoid(row) }} aria-label={t('catalog.instances.void')}><Ban size={16} /></Button>}
        </div>
      ),
    },
  ], [onEdit, onRestore, onVoid, showProduct, t])

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableId={tableId}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyMessage={t('catalog.instances.empty')}
      rowClassName={(row) => (row.voided ? 'opacity-60' : '')}
    />
  )
}
