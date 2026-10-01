import { UserRoundX } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'
import { useTranslation } from 'react-i18next'

export function InactiveCustomersPage() {
  const { t } = useTranslation()
  return (
    <CustomerPlaceholderPage
      title={t('customers.placeholders.inactive.title')}
      description={t('customers.placeholders.inactive.description')}
      icon={UserRoundX}
    />
  )
}
