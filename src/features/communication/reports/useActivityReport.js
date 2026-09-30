import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlarmClock, CheckCircle2, ListChecks, Percent } from 'lucide-react'
import {
  buildDailySeries,
  countBy,
  filterByRange,
  filterPreviousRange,
  percentChange,
  percentOf,
} from '../../../shared/components/reports'
import { isOverdueActivity, useActivities } from '../../activities'
import { toChartRows } from './reportRows'

const LIST_PARAMS = { call: { type: 'call', per_page: 200 }, meeting: { type: 'meeting', per_page: 200 } }
const STATUS_SERIES = ['completed', 'scheduled', 'in_progress', 'cancelled']
const getStart = (activity) => activity.startAt

/**
 * Calls or meetings report for the shared ReportsPage (moved to the shared engine 2026-10-01).
 * Computed in the browser from the latest 200 records of the type (see README → Known gaps).
 */
export function useActivityReport(type, range) {
  const { t } = useTranslation()
  const query = useActivities(LIST_PARAMS[type])

  return useMemo(() => {
    const all = (Array.isArray(query.data?.data) ? query.data.data : []).filter((activity) => activity.type === type)
    const inRange = filterByRange(all, getStart, range)
    const previous = filterPreviousRange(all, getStart, range)
    const completed = inRange.filter((activity) => activity.status === 'completed').length
    const overdue = inRange.filter(isOverdueActivity).length
    const statusLabel = (key) => t(`activities.status.${key}`, { defaultValue: key })

    const kpis = [
      { id: 'total', icon: ListChecks, label: t(`communication.reports.kpis.total.${type}`), value: inRange.length, delta: range === 'all' ? null : percentChange(inRange.length, previous.length) },
      { id: 'completed', icon: CheckCircle2, label: t('communication.reports.kpis.completed'), value: completed },
      { id: 'rate', icon: Percent, label: t('communication.reports.kpis.completionRate'), value: `${percentOf(completed, inRange.length)}%` },
      { id: 'overdue', icon: AlarmClock, label: t('communication.reports.kpis.overdue'), value: overdue, positiveIsGood: false },
    ]

    const charts = [
      {
        id: 'per-day',
        type: 'timeseries',
        size: 'wide',
        title: t(`communication.reports.charts.perDay.${type}`),
        data: buildDailySeries(all, getStart, { range, getSeries: (activity) => activity.status, seriesKeys: STATUS_SERIES }),
        series: STATUS_SERIES.map((key) => ({ key, label: statusLabel(key) })),
      },
      {
        id: 'by-assignee',
        type: 'bar',
        title: t('communication.reports.charts.byAssignee'),
        data: toChartRows(countBy(inRange, (activity) => activity.assignedUser?.name), t),
        valueLabel: t(`communication.reports.series.${type}`),
      },
      {
        id: 'by-priority',
        type: 'bar',
        title: t('communication.reports.charts.byPriority'),
        data: toChartRows(countBy(inRange, (activity) => activity.priority), t, (key) => t(`activities.priority.${key}`, { defaultValue: key })),
        valueLabel: t(`communication.reports.series.${type}`),
      },
      {
        id: 'by-outcome',
        type: 'share',
        size: 'wide',
        title: t('communication.reports.charts.byOutcome'),
        data: toChartRows(countBy(inRange.filter((activity) => activity.outcome), (activity) => activity.outcome), t),
        emptyText: t('communication.reports.noOutcomes'),
      },
    ]

    return { kpis, charts, recordCount: all.length, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
  }, [query.data, query.error, query.isLoading, query.refetch, range, t, type])
}
