import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3, Eye, ListTodo } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ActiveBadge, CapabilityChips, KindBadge, useNumberFormat } from '../common/catalogUi'
import { ProductImage } from '../common/ProductImage'
import { CompletenessMeter } from '../../product-details/components/CompletenessMeter'

const muted = <span className="text-[var(--text-muted)]">—</span>

/**
 * DataTable columns of the products / services list (2026-10-06; every field + completeness 2026-10-15).
 * Rows come from CatalogProductsView (normalized product + `_…` labels + `_completeness`). The drawer icon next to the
 * name is added by DataTable's `onOpenRowDrawer`.
 */
export function useProductColumns({ showKind, onView, onEdit, onComplete }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()

  return useMemo(() => [
    {
      id: 'image', header: t('catalog.columns.image'), accessor: 'image', searchable: false, sortable: false, width: 'w-16',
      render: (row) => <ProductImage src={row.image} name={row.name} />,
    },
    {
      id: 'name', header: t('catalog.columns.name'), accessor: 'name', searchable: true, sortable: true, width: 'w-56', drawerTrigger: true,
      render: (row) => <span className="font-semibold text-[var(--text)]">{row.name || `#${row.id}`}</span>,
    },
    {
      id: 'completeness', header: t('productDetails.columns.completeness'), accessor: '_completenessScore', searchable: false, sortable: true, width: 'w-40',
      render: (row) => <CompletenessMeter completeness={row._completeness} compact />,
    },
    ...(showKind ? [{
      id: 'kind', header: t('catalog.columns.kind'), accessor: '_kindLabel', searchable: true, sortable: true, width: 'w-24',
      render: (row) => <KindBadge kind={row.kind} />,
    }] : []),
    {
      id: 'itemType', header: t('catalog.columns.itemType'), accessor: '_itemTypeLabel', searchable: true, sortable: true, width: 'w-36',
      render: (row) => row._itemTypeLabel || muted,
    },
    {
      id: 'capabilities', header: t('catalog.itemTypes.fields.capabilities'), accessor: '_capabilitiesLabel', searchable: true, sortable: false, width: 'w-56',
      render: (row) => <CapabilityChips capabilities={row._capabilities} emptyText="—" />,
    },
    {
      id: 'category', header: t('catalog.columns.category'), accessor: '_categoryLabel', searchable: true, sortable: true, width: 'w-44',
      render: (row) => row._categoryLabel || muted,
    },
    {
      id: 'price', header: t('catalog.columns.price'), accessor: 'price', searchable: false, sortable: true, width: 'w-28',
      render: (row) => <span className="font-semibold tabular-nums" dir="ltr">{formatNumber(row.price)}</span>,
    },
    {
      id: 'stock', header: t('catalog.columns.stock'), accessor: '_stockSort', searchable: false, sortable: true, width: 'w-24',
      render: (row) => (row.isStockTracked
        ? <span className="tabular-nums" dir="ltr">{formatNumber(row.stockQuantity)}</span>
        : <span className="text-xs text-[var(--text-muted)]">{t('catalog.product.notTracked')}</span>),
    },
    {
      id: 'baseUnit', header: t('catalog.product.fields.baseUnit'), accessor: '_baseUnitLabel', searchable: true, sortable: true, width: 'w-24',
      render: (row) => row._baseUnitLabel || muted,
    },
    {
      id: 'creates', header: t('catalog.product.fields.fulfillmentCreates'), accessor: '_createsLabel', searchable: true, sortable: true, width: 'w-28',
      render: (row) => row._createsLabel || muted,
    },
    {
      id: 'description', header: t('catalog.columns.description'), accessor: 'description', searchable: true, sortable: false, width: 'w-64',
      render: (row) => (row.description ? <span className="line-clamp-2 text-sm text-[var(--text-muted)]">{row.description}</span> : muted),
    },
    {
      id: 'status', header: t('catalog.columns.status'), accessor: '_statusLabel', searchable: true, sortable: true, width: 'w-24',
      render: (row) => <ActiveBadge active={row.status} />,
    },
    { id: 'createdAt', header: t('catalog.columns.createdAt'), accessor: '_createdAtLabel', searchable: false, sortable: true, width: 'w-28' },
    { id: 'updatedAt', header: t('catalog.columns.updatedAt'), accessor: '_updatedAtLabel', searchable: false, sortable: true, width: 'w-28' },
    {
      id: 'actions', header: t('catalog.columns.actions'), accessor: 'id', searchable: false, sortable: false, width: 'w-32',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onView(row) }} aria-label={t('catalog.common.view')}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onEdit(row) }} aria-label={t('actions.edit')}>
            <Edit3 size={16} />
          </Button>
          {row._completeness.level !== 'complete' && (
            <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onComplete(row) }} aria-label={t('productDetails.completeness.action')}>
              <ListTodo size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ], [formatNumber, onComplete, onEdit, onView, showKind, t])
}
