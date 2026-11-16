import { Tags } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'
import { useTranslation } from 'react-i18next'

export function CustomerSegmentsPage() {
  const { t } = useTranslation()
  return (
    <CustomerPlaceholderPage
      title={t('customers.placeholders.segments.title')}
      description={t('customers.placeholders.segments.description')}
      icon={Tags}
    />
  )
}
