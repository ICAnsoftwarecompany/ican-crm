import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarPlus, CheckCircle2, Percent, UserRoundX } from 'lucide-react'
import { ReportsPage, buildDailySeries, countBy, useReportRange } from '../../shared/components/reports'

// Deterministic fixture (no API) so the engine can be reviewed in light/dark, RTL/LTR.
const STATUSES = ['completed', 'scheduled', 'cancelled']
const SOURCES = ['facebook', 'whatsapp', 'website', 'referral', 'messenger', 'gmail', 'tiktok', 'walk-in', 'phone', 'event']
const DAY_MS = 24 * 60 * 60 * 1000

function buildFixture(now) {
  return Array.from({ length: 180 }, (_, index) => ({
    id: index,
    at: new Date(now.getTime() - ((index * 7) % 60) * DAY_MS - (index % 5) * 3600 * 1000),
    status: STATUSES[index % 3 === 0 ? 1 : index % 7 === 0 ? 2 : 0],
    source: SOURCES[(index * 3) % SOURCES.length],
  }))
}

/** /playground/reports — living example of every shared reports component (added 2026-10-01). */
export function ReportsDemo() {
  const { t } = useTranslation()
  const [range, setRange] = useReportRange('reports:playground')
  const now = useMemo(() => new Date(), [])
  const items = useMemo(() => buildFixture(now), [now])

  const bySource = countBy(items, (item) => item.source).map((row) => ({
    ...row,
    label: row.key === '__other__' ? t('reports.other') : row.key,
    colorIndex: row.key === '__other__' ? -1 : undefined,
  }))

  return (
    <div className="p-4 lg:p-5">
      <ReportsPage
        title={t('reports.playground.title')}
        description={t('reports.playground.description')}
        range={range}
        onRangeChange={setRange}
        kpis={[
          { id: 'created', icon: CalendarPlus, label: t('reports.playground.kpis.created'), value: 1284, delta: 12 },
          { id: 'rate', icon: Percent, label: t('reports.playground.kpis.rate'), value: '63%', delta: -4 },
          { id: 'done', icon: CheckCircle2, label: t('reports.playground.kpis.done'), value: 12900 },
          { id: 'late', icon: UserRoundX, label: t('reports.playground.kpis.late'), value: 17, delta: 8, positiveIsGood: false },
        ]}
        charts={[
          {
            id: 'trend',
            type: 'timeseries',
            size: 'wide',
            title: t('reports.playground.charts.trend'),
            data: buildDailySeries(items, (item) => item.at, { range, getSeries: (item) => item.status, seriesKeys: STATUSES }),
            series: STATUSES.map((key) => ({ key, label: t(`activities.status.${key}`) })),
          },
          { id: 'bars', type: 'bar', title: t('reports.playground.charts.bars'), data: bySource, valueLabel: t('reports.table.value') },
          { id: 'share', type: 'share', title: t('reports.playground.charts.share'), data: bySource.slice(0, 4) },
        ]}
        note={t('reports.basedOnRecords', { count: items.length })}
      />
    </div>
  )
}
