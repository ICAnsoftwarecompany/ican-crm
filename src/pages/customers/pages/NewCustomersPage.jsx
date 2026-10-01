import { UserPlus } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'
import { useTranslation } from 'react-i18next'

export function NewCustomersPage() {
  const { t } = useTranslation()
  return (
    <CustomerPlaceholderPage
      title={t('customers.placeholders.newLeads.title')}
      description={t('customers.placeholders.newLeads.description')}
      icon={UserPlus}
    />
  )
}
