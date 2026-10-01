import { ArrowLeftRight } from 'lucide-react'
import { CustomerPlaceholderPage } from './CustomerPlaceholderPage'
import { useTranslation } from 'react-i18next'

export function CustomerImportExportPage() {
  const { t } = useTranslation()
  return (
    <CustomerPlaceholderPage
      title={t('customers.placeholders.importExport.title')}
      description={t('customers.placeholders.importExport.description')}
      icon={ArrowLeftRight}
    />
  )
}
