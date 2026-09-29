import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { PlanCalculator } from '../../features/service'

/** /service/billing — plan calculator now; schedules & collections join in F4b. */
export function ServiceBillingPage() {
  const { t } = useTranslation()
  usePageHeader({ title: t('service.hub.title'), icon: Wallet })
  return <PlanCalculator />
}

export default ServiceBillingPage
