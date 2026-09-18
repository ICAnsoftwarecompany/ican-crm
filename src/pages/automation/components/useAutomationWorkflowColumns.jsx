import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Edit3, Trash2 } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { WorkflowStatusBadge, getModule, getTrigger } from '../../../features/workflow-engine'

function NotAvailableCell() {
  const { t } = useTranslation()
  return <span className="text-xs text-[var(--text-muted)]">{t('workflow.metrics.notAvailable')}</span>
}

export function useAutomationWorkflowColumns({ onOpen, onDuplicate, onDelete }) {
  const { t } = useTranslation()

  return useMemo(() => [
    {
      id: 'name',
      header: t('workflow.center.columns.workflow'),
      accessor: 'name',
      searchable: true,
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (row) => <button type="button" onClick={() => onOpen(row)} className="font-bold text-[#00838A] hover:underline">{row.name || t('workflow.center.untitled')}</button>,
    },
    {
      id: 'module',
      header: t('workflow.center.columns.module'),
      accessor: 'module',
      sortable: true,
      render: (row) => <span className="text-sm">{t(getModule(row.module)?.labelKey || row.module)}</span>,
    },
    {
      id: 'trigger',
      header: t('workflow.center.columns.trigger'),
      accessor: 'trigger',
      enableFilter: false,
      render: (row) => {
        const definition = row.trigger?.definitionId ? getTrigger(row.trigger.definitionId) : null
        return <span className="text-sm text-[var(--text-muted)]">{definition ? t(definition.labelKey) : '—'}</span>
      },
    },
    {
      id: 'status',
      header: t('workflow.center.columns.status'),
      accessor: 'status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['draft', 'active', 'paused', 'archived'].map((value) => ({ value, label: t(`workflow.status.${value}`) })),
      render: (row) => <WorkflowStatusBadge status={row.status} />,
    },
    {
      id: 'lastRun',
      header: t('workflow.center.columns.lastRun'),
      accessor: 'id',
      enableFilter: false,
      sortable: false,
      render: () => <NotAvailableCell />,
    },
    {
      id: 'executions',
      header: t('workflow.center.columns.executions'),
      accessor: 'id',
      enableFilter: false,
      sortable: false,
      render: () => <NotAvailableCell />,
    },
    {
      id: 'updatedAt',
      header: t('workflow.center.columns.updated'),
      accessor: 'updatedAt',
      sortable: true,
      render: (row) => <span className="text-sm" dir="ltr">{row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—'}</span>,
    },
    {
      id: 'actions',
      header: t('workflow.center.columns.actions'),
      accessor: 'id',
      enableFilter: false,
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onOpen(row)} aria-label={t('actions.edit')}>
            <Edit3 size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDuplicate(row)} aria-label={t('workflow.builder.duplicate')}>
            <Copy size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#EF4444]" onClick={() => onDelete(row)} aria-label={t('actions.delete')}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, onOpen, onDuplicate, onDelete])
}
