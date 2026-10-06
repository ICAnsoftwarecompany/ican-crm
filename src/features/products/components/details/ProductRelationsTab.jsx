import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../../../shared/components/ui/Button'
import { Badge } from '../../../../shared/components/ui/Badge'
import { DataTable } from '../../../../shared/components/data-table'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useProductRelationMutations, useProductRelations } from '../../hooks/useProductResources'
import { KindBadge, useNumberFormat, useOptionLabel } from '../common/catalogUi'
import { ConfirmActionDialog, useConfirmAction } from '../common/ConfirmDelete'
import { RelationDialog } from './RelationDialog'

/** Attached products / services: included (added automatically, usually free) or optional (offered). */
export function ProductRelationsTab({ product }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const optionLabel = useOptionLabel()
  const query = useProductRelations(product.id)
  const mutations = useProductRelationMutations(product.id)
  const [dialog, setDialog] = useState(null)
  const catalogQuery = useCatalogProducts()
  // The relation may carry only `child_product_id`; name, kind and price then come from the catalog list.
  const relations = useMemo(() => {
    const byId = new Map((catalogQuery.data || []).map((item) => [String(item.id), item]))
    return (query.data || []).map((relation) => {
      const child = byId.get(String(relation.childProductId))
      if (!child) return relation
      return {
        ...relation,
        childName: relation.childName || child.name,
        childKind: relation.raw.child_product || relation.raw.childProduct ? relation.childKind : child.kind,
        childPrice: relation.childPrice ?? child.price,
      }
    })
  }, [catalogQuery.data, query.data])
  const removeAction = useConfirmAction({
    run: (row) => mutations.remove.mutateAsync(row.id),
    successMessage: t('catalog.relations.removed'),
    failureMessage: t('catalog.common.deleteFailed'),
  })

  const columns = useMemo(() => [
    {
      id: 'child', header: t('catalog.relations.fields.child'), accessor: 'childName', sortable: true,
      render: (row) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <Link to={`/products/${row.childProductId}`} className="font-semibold text-[var(--text)] hover:underline" onClick={(event) => event.stopPropagation()}>
            {row.childName || `#${row.childProductId}`}
          </Link>
          <KindBadge kind={row.childKind} />
        </span>
      ),
    },
    {
      id: 'inclusion', header: t('catalog.relations.fields.inclusion'), accessor: 'inclusion', sortable: true,
      render: (row) => <Badge variant={row.inclusion === 'included' ? 'success' : 'default'}>{optionLabel('inclusion', row.inclusion)}</Badge>,
    },
    { id: 'quantity', header: t('catalog.relations.fields.quantity'), accessor: 'quantity', render: (row) => <span dir="ltr">{formatNumber(row.quantity)}</span> },
    {
      id: 'price', header: t('catalog.relations.fields.priceOverride'), accessor: 'priceOverride',
      render: (row) => <span dir="ltr">{row.priceOverride === null ? formatNumber(row.childPrice) : formatNumber(row.priceOverride)}</span>,
    },
    { id: 'autoAdd', header: t('catalog.relations.fields.autoAdd'), accessor: 'autoAdd', render: (row) => (row.autoAdd ? t('catalog.common.yes') : t('catalog.common.no')) },
    { id: 'sortOrder', header: t('catalog.relations.fields.sortOrder'), accessor: 'sortOrder', sortable: true },
    {
      id: 'actions', header: t('catalog.columns.actions'), accessor: 'id', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDialog({ relation: row })} aria-label={t('actions.edit')}><Edit3 size={16} /></Button>
          <Button variant="ghost" size="icon" onClick={() => removeAction.ask(row)} aria-label={t('actions.delete')}><Trash2 size={16} /></Button>
        </div>
      ),
    },
  ], [formatNumber, optionLabel, removeAction.ask, t])

  const nextSortOrder = relations.reduce((max, relation) => Math.max(max, relation.sortOrder || 0), 0) + 1

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">{t('catalog.relations.description')}</p>
        <Button size="sm" onClick={() => setDialog({ relation: null })}><Plus size={14} />{t('catalog.relations.addTitle')}</Button>
      </div>
      <DataTable
        data={relations}
        columns={columns}
        tableId="catalog-product-relations"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyMessage={t('catalog.relations.empty')}
        enablePagination={false}
        enableExport={false}
        enableAdvancedFilters={false}
      />
      <RelationDialog open={Boolean(dialog)} product={product} relation={dialog?.relation} nextSortOrder={nextSortOrder} onClose={() => setDialog(null)} />
      <ConfirmActionDialog
        action={removeAction}
        title={t('catalog.relations.removeTitle')}
        message={t('catalog.relations.removeMessage', { name: removeAction.target?.childName || '' })}
      />
    </div>
  )
}
