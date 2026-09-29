import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { BillingNav, CollectionsWorkspace, PlanCalculator, ScheduleDetailView, SchedulesList } from '../../features/service'

const BASE = '/service/billing'
const detailPath = (schedule) => `${BASE}/schedules/${schedule.id}`
const contractPath = (contractId) => `/service/contracts/${contractId}`
const VIEWS = ['schedules', 'collections', 'calculator']

/** /service/billing/:view? and /service/billing/schedules/:scheduleId (Payments tab of the Services hub). */
export function ServiceBillingPage() {
  const { t } = useTranslation()
  const { view, scheduleId } = useParams()
  usePageHeader({ title: t('service.hub.title'), icon: Wallet })
  if (scheduleId) return <ScheduleDetailView scheduleId={scheduleId} backTo={`${BASE}/schedules`} detailPath={detailPath} contractPath={contractPath} />
  if (!VIEWS.includes(view)) return <Navigate to={`${BASE}/schedules`} replace />
  return (
    <div className="grid gap-4">
      <BillingNav basePath={BASE} />
      {view === 'schedules' && <SchedulesList detailPath={detailPath} />}
      {view === 'collections' && <CollectionsWorkspace detailPath={detailPath} />}
      {view === 'calculator' && <PlanCalculator />}
    </div>
  )
}

export default ServiceBillingPage
