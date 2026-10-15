import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../../shared/utils/dateTime'
import { formatMoney, progressPercent } from '../../utils/dealMoney'
import { DealStatusBadge } from '../common/DealStatusBadge'
import { ProgressBar } from '../common/ProgressBar'
import { CompletenessMeter } from './CompletenessMeter'

const STATUSES = ['draft', 'active', 'paused', 'completed', 'cancelled']

/**
 * Every field of a deal row (2026-10-16), shared by the hub table (as columns) and the deal drawer (as a list), so
 * both always show the same data. Rows come from DealsTable (deal + quick info + completeness + pipeline / owner names).
 * `{ id, label, accessor, filterType?, filterOptions?, render(row) }`.
 */
export function useDealFields() {
  const { t, i18n } = useTranslation()
  return useMemo(() => {
    const date = (value) => (value ? <span dir="ltr">{formatDate(value, i18n.language, { dateStyle: 'medium' })}</span> : '—')
    const money = (value) => (value === null || value === undefined || value === '' ? '—' : <span dir="ltr">{formatMoney(value, i18n.language)}</span>)
    const muted = (cond, text) => <span className={cond ? 'text-amber-700 dark:text-amber-300' : ''}>{text}</span>
    return [
      { id: 'name', label: t('dealWorkspace.fields.name'), accessor: 'name', filterType: 'text', render: (row) => <span className="font-semibold text-[var(--text)]">{row.name}</span> },
      { id: 'completeness', label: t('dealWorkspace.completeness.label'), accessor: 'completenessScore', filterType: 'number', render: (row) => <CompletenessMeter completeness={row.completeness} compact /> },
      {
        id: 'status', label: t('dealWorkspace.fields.status'), accessor: 'statusValue', filterType: 'select',
        filterOptions: STATUSES.map((value) => ({ value, label: t(`dealWorkspace.options.dealStatus.${value}`) })),
        render: (row) => <DealStatusBadge status={row.status} />,
      },
      { id: 'type', label: t('dealWorkspace.fields.type'), accessor: 'typeLabel', filterType: 'text', render: (row) => row.typeLabel || '—' },
      { id: 'pipeline', label: t('dealWorkspace.fields.pipeline'), accessor: 'pipelineName', filterType: 'text', render: (row) => row.pipelineName || '—' },
      { id: 'owner', label: t('dealWorkspace.fields.owner'), accessor: 'ownerName', filterType: 'text', render: (row) => muted(!row.ownerName, row.ownerName || '—') },
      {
        id: 'leads', label: t('dealWorkspace.fields.leadsProgress'), accessor: 'leadsCount', filterType: 'number',
        render: (row) => <div className="min-w-[120px]"><ProgressBar value={progressPercent(row.leadsCount ?? 0, row.target_leads)} label={<span dir="ltr">{row.leadsCount ?? '—'} / {row.target_leads ?? '—'}</span>} /></div>,
      },
      { id: 'targetLeads', label: t('dealWorkspace.fields.targetLeads'), accessor: 'target_leads', filterType: 'number', render: (row) => (row.target_leads ?? '—') },
      { id: 'targetRevenue', label: t('dealWorkspace.fields.targetRevenue'), accessor: 'target_revenue', filterType: 'number', render: (row) => money(row.target_revenue) },
      { id: 'products', label: t('dealWorkspace.quickInfo.products'), accessor: 'productsLabel', filterType: 'text', render: (row) => muted(row.productsCount === 0, row.productsLabel) },
      { id: 'team', label: t('dealWorkspace.quickInfo.team'), accessor: 'teamLabel', filterType: 'text', render: (row) => muted(row.teamCount === 0, row.teamLabel) },
      { id: 'lastAction', label: t('dealWorkspace.quickInfo.lastAction'), accessor: 'lastActionLabel', render: (row) => <span className="text-xs text-[var(--text-muted)]">{row.lastActionLabel}</span> },
      { id: 'startDate', label: t('dealWorkspace.fields.startDate'), accessor: 'start_date', filterType: 'date', render: (row) => date(row.start_date) },
      { id: 'endDate', label: t('dealWorkspace.fields.endDate'), accessor: 'end_date', filterType: 'date', render: (row) => date(row.end_date) },
      { id: 'daysLeft', label: t('dealWorkspace.fields.daysLeft'), accessor: 'daysLeft', filterType: 'number', render: (row) => (row.daysLeft === null ? '—' : t('dealWorkspace.fields.daysValue', { count: row.daysLeft })) },
      { id: 'description', label: t('dealWorkspace.fields.description'), accessor: 'description', filterType: 'text', render: (row) => <span className="line-clamp-2 max-w-[18rem] text-xs text-[var(--text-muted)]">{row.description || '—'}</span> },
      { id: 'createdAt', label: t('dealWorkspace.fields.createdAt'), accessor: 'created_at', filterType: 'date', render: (row) => date(row.created_at) },
      { id: 'updatedAt', label: t('dealWorkspace.fields.updatedAt'), accessor: 'updated_at', filterType: 'date', render: (row) => date(row.updated_at) },
    ]
  }, [i18n.language, t])
}
