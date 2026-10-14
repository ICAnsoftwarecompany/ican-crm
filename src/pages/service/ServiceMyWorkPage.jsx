import { useTranslation } from 'react-i18next'
import { ListChecks } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { MyWorkList } from '../../features/service'

/** /service/my-work — everything assigned to the signed-in user. */
export function ServiceMyWorkPage() {
  const { t } = useTranslation()
  usePageHeader({ title: t('service.myWork.title'), icon: ListChecks })

  return (
    <div className="grid gap-4 p-4 lg:p-5">
      <header>
        <h1 className="text-lg font-bold text-[var(--text)]">{t('service.myWork.title')}</h1>
        <p className="text-sm text-[var(--text-muted)]">{t('service.myWork.subtitle')}</p>
      </header>
      <MyWorkList />
    </div>
  )
}

export default ServiceMyWorkPage
