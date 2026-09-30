import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarPlus, UserRoundX, Users } from 'lucide-react'
import { useCustomers } from '../hooks/useCustomers'
import { useUsers } from '../../users'
import { buildLeadsReport } from './leadsReportModel'

// The list endpoint is cursor-paginated; the report reads up to this many pages, then says so.
const MAX_PAGES = 5
const SPECIAL_KEYS = { __none__: 'reports.none', __other__: 'reports.other' }

function userName(user) {
  return user?.name || user?.full_name || user?.username || user?.email || ''
}

/** Turns countBy rows into chart rows; the folded "Other" row gets the neutral color. */
function toRows(rows, t, labelFor = (key) => key) {
  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    label: SPECIAL_KEYS[row.key] ? t(SPECIAL_KEYS[row.key]) : labelFor(row.key),
    colorIndex: row.key === '__other__' ? -1 : undefined,
  }))
}

/**
 * Everything the Leads Center "Reports" page shows (added 2026-10-01): KPI tiles + chart configs
 * for the shared ReportsPage. Data: the Leads Center list (`GET /api/tenant/customers/data`,
 * up to 5 pages) and users for assignee names.
 */
export function useLeadsCenterReport(range) {
  const { t } = useTranslation()
  const query = useCustomers({})
  const usersQuery = useUsers()
  const pages = query.data?.pages || []

  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage && pages.length < MAX_PAGES) query.fetchNextPage()
  }, [pages.length, query])

  const customers = useMemo(() => pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : [])), [pages])

  return useMemo(() => {
    const report = buildLeadsReport(customers, range)
    const users = new Map((usersQuery.data || []).map((user) => [String(user.id), userName(user)]))

    const kpis = [
      { id: 'created', icon: CalendarPlus, label: t('customers.reports.kpis.created'), value: report.created, delta: report.createdDelta },
      { id: 'unassigned', icon: UserRoundX, label: t('customers.reports.kpis.unassigned'), value: report.unassigned, positiveIsGood: false },
      { id: 'total', icon: Users, label: t('customers.reports.kpis.total'), value: report.total, hint: t('customers.reports.kpis.totalHint') },
    ]

    const charts = [
      {
        id: 'created-over-time',
        type: 'timeseries',
        size: 'wide',
        title: t('customers.reports.charts.createdOverTime'),
        data: report.dailyCreated,
        series: [{ key: 'count', label: t('customers.reports.series.created') }],
        options: { variant: 'area' },
      },
      { id: 'by-status', type: 'bar', title: t('customers.reports.charts.byStatus'), data: toRows(report.byStatus, t), valueLabel: t('customers.reports.series.leads') },
      { id: 'by-source', type: 'bar', title: t('customers.reports.charts.bySource'), data: toRows(report.bySource, t), valueLabel: t('customers.reports.series.leads') },
      {
        id: 'by-assignee',
        type: 'bar',
        size: 'wide',
        title: t('customers.reports.charts.byAssignee'),
        data: toRows(report.byAssignee, t, (key) => users.get(String(key)) || `#${key}`),
        valueLabel: t('customers.reports.series.leads'),
      },
    ]

    return {
      kpis,
      charts,
      recordCount: customers.length,
      isPartial: Boolean(query.hasNextPage),
      isLoading: query.isLoading,
      error: query.error,
      refetch: query.refetch,
    }
  }, [customers, query.error, query.hasNextPage, query.isLoading, query.refetch, range, t, usersQuery.data])
}
