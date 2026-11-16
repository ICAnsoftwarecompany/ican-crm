import { Settings } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'
import { useTranslation } from 'react-i18next'

export function CustomersSettingsPage() {
  const { t } = useTranslation()
  return (
    <CustomerPlaceholderPage
      title={t('customers.placeholders.settings.title')}
      description={t('customers.placeholders.settings.description')}
      icon={Settings}
    />
  )
}
