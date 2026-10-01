import { Copy } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'
import { useTranslation } from 'react-i18next'

export function DuplicateCustomersPage() {
  const { t } = useTranslation()
  return (
    <CustomerPlaceholderPage
      title={t('customers.placeholders.duplicates.title')}
      description={t('customers.placeholders.duplicates.description')}
      icon={Copy}
    />
  )
}
