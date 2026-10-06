import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { DataTable } from '../../../../shared/components/data-table'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { useUnitMutations, useUnits } from '../../hooks/useCatalogSetup'
import { ActiveBadge, useOptionLabel } from '../common/catalogUi'
import { ConfirmActionDialog, useConfirmAction } from '../common/ConfirmDelete'
import { UnitFormDialog } from './UnitFormDialog'

/** `/products/units` — units of measure products are sold in (2026-10-06). */
export function UnitsView() {
  const { t } = useTranslation()
  const optionLabel = useOptionLabel()
  const query = useUnits()
  const mutations = useUnitMutations()
  const [dialog, setDialog] = useState(null)
  const removeAction = useConfirmAction({
    run: (row) => mutations.remove.mutateAsync(row.id),
    successMessage: t('catalog.units.deleted'),
    failureMessage: t('catalog.common.deleteFailed'),
  })

  const rows = useMemo(() => (query.data || []).map((unit) => ({
    ...unit,
    _typeLabel: optionLabel('unitTypes', unit.type),
    _statusLabel: unit.status ? t('catalog.common.active') : t('catalog.common.inactive'),
  })), [optionLabel, query.data, t])

  const columns = useMemo(() => [
    { id: 'name', header: t('catalog.units.fields.name'), accessor: 'name', sortable: true, render: (row) => <span className="font-semibold">{row.name}</span> },
    { id: 'code', header: t('catalog.units.fields.code'), accessor: 'code', sortable: true, render: (row) => <span className="font-mono text-xs" dir="ltr">{row.code}</span> },
    { id: 'type', header: t('catalog.units.fields.type'), accessor: '_typeLabel', sortable: true },
    { id: 'decimals', header: t('catalog.units.fields.decimals'), accessor: 'decimals', sortable: true },
    { id: 'status', header: t('catalog.columns.status'), accessor: '_statusLabel', sortable: true, render: (row) => <ActiveBadge active={row.status} /> },
    {
      id: 'actions', header: t('catalog.columns.actions'), accessor: 'id', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); setDialog({ unit: row }) }} aria-label={t('actions.edit')}><Edit3 size={16} /></Button>
          <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); removeAction.ask(row) }} aria-label={t('actions.delete')}><Trash2 size={16} /></Button>
        </div>
      ),
    },
  ], [removeAction.ask, t])

  return (
    <div className="space-y-4">
      <PageToolbar title={t('catalog.units.pageTitle')} description={t('catalog.units.pageDescription')}>
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} />
          {t('catalog.common.refresh')}
        </Button>
        <Button onClick={() => setDialog({ unit: null })}><Plus size={16} />{t('catalog.units.addTitle')}</Button>
      </PageToolbar>

      <DataTable
        data={rows}
        columns={columns}
        tableId="catalog-units"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={(row) => setDialog({ unit: row })}
        emptyMessage={t('catalog.units.empty')}
      />

      <UnitFormDialog open={Boolean(dialog)} unit={dialog?.unit} onClose={() => setDialog(null)} />
      <ConfirmActionDialog
        action={removeAction}
        title={t('catalog.units.deleteTitle')}
        message={t('catalog.units.deleteMessage', { name: removeAction.target?.name || '' })}
      />
    </div>
  )
}
