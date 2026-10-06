import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3, Eye } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ActiveBadge, KindBadge, useNumberFormat } from '../common/catalogUi'
import { ProductImage } from '../common/ProductImage'

/** DataTable columns of the products / services list. Rows come from `useCatalogRows`. */
export function useProductColumns({ showKind, onView, onEdit }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()

  return useMemo(() => [
    {
      id: 'image', header: t('catalog.columns.image'), accessor: 'image', searchable: false, sortable: false, width: 'w-16',
      render: (row) => <ProductImage src={row.image} name={row.name} />,
    },
    {
      id: 'name', header: t('catalog.columns.name'), accessor: 'name', searchable: true, sortable: true, width: 'w-48',
      render: (row) => <span className="font-semibold text-[var(--text)]">{row.name || `#${row.id}`}</span>,
    },
    ...(showKind ? [{
      id: 'kind', header: t('catalog.columns.kind'), accessor: '_kindLabel', searchable: true, sortable: true, width: 'w-24',
      render: (row) => <KindBadge kind={row.kind} />,
    }] : []),
    {
      id: 'itemType', header: t('catalog.columns.itemType'), accessor: '_itemTypeLabel', searchable: true, sortable: true, width: 'w-36',
      render: (row) => row._itemTypeLabel || <span className="text-[var(--text-muted)]">—</span>,
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
      id: 'category', header: t('catalog.columns.category'), accessor: '_categoryLabel', searchable: true, sortable: true, width: 'w-36',
      render: (row) => row._categoryLabel || <span className="text-[var(--text-muted)]">—</span>,
    },
    {
      id: 'description', header: t('catalog.columns.description'), accessor: 'description', searchable: true, sortable: false, visible: false, width: 'w-56',
    },
    {
      id: 'status', header: t('catalog.columns.status'), accessor: '_statusLabel', searchable: true, sortable: true, width: 'w-24',
      render: (row) => <ActiveBadge active={row.status} />,
    },
    {
      id: 'createdAt', header: t('catalog.columns.createdAt'), accessor: '_createdAtLabel', searchable: false, sortable: true, width: 'w-28',
    },
    {
      id: 'actions', header: t('catalog.columns.actions'), accessor: 'id', searchable: false, sortable: false, width: 'w-28',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onView(row) }} aria-label={t('catalog.common.view')}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onEdit(row) }} aria-label={t('actions.edit')}>
            <Edit3 size={16} />
          </Button>
        </div>
      ),
    },
  ], [formatNumber, onEdit, onView, showKind, t])
}
