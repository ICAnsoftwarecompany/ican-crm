import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Badge } from '../../../../shared/components/ui/Badge'
import { DataTable } from '../../../../shared/components/data-table'
import { useProductUnitMutations, useProductUnits } from '../../hooks/useProductResources'
import { ActiveBadge, useNumberFormat } from '../common/catalogUi'
import { ConfirmActionDialog, useConfirmAction } from '../common/ConfirmDelete'
import { ProductUnitDialog } from './ProductUnitDialog'

/** Units tab: base unit (created by the server) + alternative units with factor, price and barcode. */
export function ProductUnitsTab({ product }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const query = useProductUnits(product.id)
  const mutations = useProductUnitMutations(product.id)
  const [dialog, setDialog] = useState(null)
  const removeAction = useConfirmAction({
    run: (row) => mutations.remove.mutateAsync(row.id),
    successMessage: t('catalog.productUnits.removed'),
    failureMessage: t('catalog.common.deleteFailed'),
  })

  const columns = useMemo(() => [
    {
      id: 'unit', header: t('catalog.productUnits.fields.unit'), accessor: 'unitName', sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          <span className="font-semibold">{row.unitName || `#${row.unitId}`}</span>
          {row.isBase && <Badge variant="info">{t('catalog.productUnits.base')}</Badge>}
          {row.isDefault && <Badge variant="success">{t('catalog.productUnits.default')}</Badge>}
        </span>
      ),
    },
    { id: 'factor', header: t('catalog.productUnits.fields.factor'), accessor: 'factor', sortable: true, render: (row) => <span dir="ltr">{formatNumber(row.factor)}</span> },
    { id: 'price', header: t('catalog.productUnits.fields.price'), accessor: 'price', sortable: true, render: (row) => <span dir="ltr">{formatNumber(row.price)}</span> },
    { id: 'barcode', header: t('catalog.productUnits.fields.barcode'), accessor: 'barcode', render: (row) => <span dir="ltr">{row.barcode || '—'}</span> },
    { id: 'status', header: t('catalog.columns.status'), accessor: 'status', render: (row) => <ActiveBadge active={row.status} /> },
    {
      id: 'actions', header: t('catalog.columns.actions'), accessor: 'id', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDialog({ productUnit: row })} aria-label={t('actions.edit')}><Edit3 size={16} /></Button>
          {!row.isBase && <Button variant="ghost" size="icon" onClick={() => removeAction.ask(row)} aria-label={t('actions.delete')}><Trash2 size={16} /></Button>}
        </div>
      ),
    },
  ], [formatNumber, removeAction.ask, t])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">{t('catalog.productUnits.description')}</p>
        <Button size="sm" onClick={() => setDialog({ productUnit: null })}><Plus size={14} />{t('catalog.productUnits.addTitle')}</Button>
      </div>
      <DataTable
        data={query.data || []}
        columns={columns}
        tableId="catalog-product-units"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyMessage={t('catalog.productUnits.empty')}
        enablePagination={false}
        enableExport={false}
        enableAdvancedFilters={false}
      />
      <ProductUnitDialog open={Boolean(dialog)} productId={product.id} productUnit={dialog?.productUnit} onClose={() => setDialog(null)} />
      <ConfirmActionDialog
        action={removeAction}
        title={t('catalog.productUnits.removeTitle')}
        message={t('catalog.productUnits.removeMessage', { name: removeAction.target?.unitName || '' })}
      />
    </div>
  )
}
