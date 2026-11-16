import { BellRing } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'
import { useTranslation } from 'react-i18next'

export function FollowUpCustomersPage() {
  const { t } = useTranslation()
  return (
    <CustomerPlaceholderPage
      title={t('customers.placeholders.followUp.title')}
      description={t('customers.placeholders.followUp.description')}
      icon={BellRing}
    />
  )
}
