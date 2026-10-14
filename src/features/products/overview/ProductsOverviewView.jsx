import { useTranslation } from 'react-i18next'
import { LayoutDashboard, RefreshCw } from 'lucide-react'
import { ModulePageHeader } from '../../../shared/components/module-pages'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { Skeleton } from '../../../shared/components/feedback/Skeleton'
import { KpiRow } from '../../../shared/components/reports'
import { Button } from '../../../shared/components/ui/Button'
import { formatApiError } from '../utils/apiErrors'
import { useNumberFormat } from '../components/common/catalogUi'
import { OverviewAlerts } from './components/OverviewAlerts'
import { OverviewSection } from './components/OverviewSection'
import { useProductsOverview } from './hooks/useProductsOverview'

/**
 * `/products/overview` (2026-10-15), first item of the Products & Services sub-sidebar: how many products and services
 * there are and what they are worth, then a block for each with its top categories, top item types and completeness,
 * and a warning when there is no item type yet. Explained in ./README.md.
 */
export function ProductsOverviewView() {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const query = useProductsOverview()
  const { data } = query

  const header = (
    <ModulePageHeader
      icon={LayoutDashboard}
      title={t('productOverview.title')}
      description={t('productOverview.description')}
      actions={(
        <Button variant="outline" size="sm" onClick={query.refetch} disabled={query.isFetching}>
          <RefreshCw size={14} className={query.isFetching ? 'animate-spin' : ''} />
          {t('catalog.common.refresh')}
        </Button>
      )}
    />
  )

  if (query.isLoading) {
    return <div className="space-y-4">{header}<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[1, 2, 3, 4].map((key) => <Skeleton key={key} className="h-24" />)}</div><Skeleton className="h-64 w-full" /></div>
  }
  if (query.error) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState title={t('productOverview.loadFailed')} description={formatApiError(query.error, '')} action={<Button variant="outline" onClick={query.refetch}>{t('catalog.common.retry')}</Button>} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}
      <OverviewAlerts alerts={data.alerts} />
      <KpiRow
        items={[
          { id: 'all', label: t('productOverview.total.count'), value: data.total.count },
          { id: 'value', label: t('productOverview.total.listValue'), value: formatNumber(data.total.listValue), hint: t('productOverview.total.listValueHint') },
          { id: 'products', label: t('productOverview.total.products'), value: data.product.count },
          { id: 'services', label: t('productOverview.total.services'), value: data.service.count },
        ]}
      />
      {data.total.count === 0 && <EmptyState title={t('productOverview.empty.title')} description={t('productOverview.empty.description')} />}
      {data.total.count > 0 && (
        <>
          <OverviewSection kind="product" section={data.product} />
          <OverviewSection kind="service" section={data.service} />
        </>
      )}
    </div>
  )
}
