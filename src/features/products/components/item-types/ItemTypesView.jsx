import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Edit3, Plus, Power, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { DataTable } from '../../../../shared/components/data-table'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { useItemTypeMutations, useItemTypes } from '../../hooks/useCatalogSetup'
import { formatApiError } from '../../utils/apiErrors'
import { ActiveBadge, CapabilityChips, KindBadge, useOptionLabel } from '../common/catalogUi'
import { ConfirmActionDialog, useConfirmAction } from '../common/ConfirmDelete'
import { ItemTypeFormDrawer } from './ItemTypeFormDrawer'

/**
 * `/products/item-types` (2026-10-06). Delete is refused by the server while products use the type;
 * the failure toast says so and the row offers "deactivate" (`status: false`) instead.
 */
export function ItemTypesView() {
  const { t } = useTranslation()
  const optionLabel = useOptionLabel()
  const query = useItemTypes()
  const mutations = useItemTypeMutations()
  const [drawer, setDrawer] = useState(null)
  const removeAction = useConfirmAction({
    run: (row) => mutations.remove.mutateAsync(row.id),
    successMessage: t('catalog.itemTypes.deleted'),
    failureMessage: t('catalog.itemTypes.deleteFailed'),
  })

  const toggleStatus = async (row) => {
    try {
      await mutations.update.mutateAsync({ id: row.id, payload: { status: !row.status } })
      toast.success(t(row.status ? 'catalog.itemTypes.deactivated' : 'catalog.itemTypes.activated'))
    } catch (error) {
      toast.error(formatApiError(error, t('catalog.common.saveFailed')))
    }
  }

  const rows = useMemo(() => (query.data || []).map((itemType) => ({
    ...itemType,
    _kindLabel: optionLabel('kinds', itemType.kind),
    _statusLabel: itemType.status ? t('catalog.common.active') : t('catalog.common.inactive'),
    _capabilitiesLabel: itemType.capabilities.map((capability) => capability.code).join(' '),
  })), [optionLabel, query.data, t])

  const columns = useMemo(() => [
    { id: 'name', header: t('catalog.itemTypes.fields.name'), accessor: 'name', sortable: true, render: (row) => <span className="font-semibold">{row.name}</span> },
    { id: 'code', header: t('catalog.itemTypes.fields.code'), accessor: 'code', sortable: true, render: (row) => <span className="font-mono text-xs" dir="ltr">{row.code}</span> },
    { id: 'kind', header: t('catalog.itemTypes.fields.kind'), accessor: '_kindLabel', sortable: true, render: (row) => <KindBadge kind={row.kind} /> },
    { id: 'model', header: t('catalog.itemTypes.fields.serviceModel'), accessor: 'serviceModel', sortable: true, render: (row) => row.serviceModel || '—' },
    { id: 'capabilities', header: t('catalog.itemTypes.fields.capabilities'), accessor: '_capabilitiesLabel', render: (row) => <CapabilityChips capabilities={row.capabilities} emptyText="—" /> },
    { id: 'creates', header: t('catalog.itemTypes.fields.fulfillmentCreates'), accessor: 'fulfillmentConfig.creates', render: (row) => optionLabel('creates', row.fulfillmentConfig?.creates) || '—' },
    { id: 'status', header: t('catalog.columns.status'), accessor: '_statusLabel', sortable: true, render: (row) => <ActiveBadge active={row.status} /> },
    {
      id: 'actions', header: t('catalog.columns.actions'), accessor: 'id', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); setDrawer({ itemType: row }) }} aria-label={t('actions.edit')}><Edit3 size={16} /></Button>
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); toggleStatus(row) }} aria-label={t(row.status ? 'catalog.itemTypes.deactivate' : 'catalog.itemTypes.activate')}><Power size={16} /></Button>
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); removeAction.ask(row) }} aria-label={t('actions.delete')}><Trash2 size={16} /></Button>
        </div>
      ),
    },
    // toggleStatus is recreated each render but only reads its argument and stable mutations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [optionLabel, removeAction.ask, t])

  return (
    <div className="space-y-4">
      <PageToolbar title={t('catalog.itemTypes.pageTitle')} description={t('catalog.itemTypes.pageDescription')}>
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} />
          {t('catalog.common.refresh')}
        </Button>
        <Button onClick={() => setDrawer({ itemType: null })}><Plus size={16} />{t('catalog.itemTypes.addTitle')}</Button>
      </PageToolbar>

      <DataTable
        data={rows}
        columns={columns}
        tableId="catalog-item-types"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={(row) => setDrawer({ itemType: row })}
        emptyMessage={t('catalog.itemTypes.empty')}
      />

      <ItemTypeFormDrawer open={Boolean(drawer)} itemType={drawer?.itemType} onClose={() => setDrawer(null)} />
      <ConfirmActionDialog
        action={removeAction}
        title={t('catalog.itemTypes.deleteTitle')}
        message={t('catalog.itemTypes.deleteMessage', { name: removeAction.target?.name || '' })}
      />
    </div>
  )
}
