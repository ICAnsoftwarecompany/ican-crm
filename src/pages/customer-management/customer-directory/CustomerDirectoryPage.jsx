import { useTranslation } from 'react-i18next'
import { UsersRound } from 'lucide-react'
import { usePageHeader } from '../../../shared/hooks/usePageHeader'
import { useDoneCustomers } from '../../../features/customers/hooks/useCustomers'
import { DirectoryWorkspace } from '../../../features/customer-management/customer-directory/shared/DirectoryWorkspace'
import { useCustomerManagementTemplate } from '../../../features/customer-management/industryTemplates'

export function CustomerDirectoryPage() {
  const { t } = useTranslation()
  const query = useDoneCustomers()
  const industry = useCustomerManagementTemplate()
  const title = t('nav.customerManagementWorkspace')

  usePageHeader({ title, icon: UsersRound })

  return (
    <main className="min-w-0 space-y-4 p-4 lg:p-5">
      <header>
        <h1 className="text-lg font-bold text-[var(--text)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t('nav.customerManagementDescription')}</p>
      </header>
      <DirectoryWorkspace query={query} template={industry.template.directory} />
    </main>
  )
}

export default CustomerDirectoryPage
