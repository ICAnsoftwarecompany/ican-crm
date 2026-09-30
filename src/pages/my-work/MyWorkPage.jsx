import { useTranslation } from 'react-i18next'
import { ListChecks } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { useAuthStore } from '../../store/authStore'
import { ModulePageHeader } from '../../shared/components/module-pages'
import { MyWorkBoard, MyWorkFocusTabs, MyWorkSummary, useMyWorkFocus } from '../../features/my-work'

/** /my-work — everything waiting for the signed-in user today, across Sales, Customer Hub and Communication. */
export function MyWorkPage() {
  const { t } = useTranslation()
  const [focus, setFocus] = useMyWorkFocus()
  const enabledModules = useAuthStore((state) => state.user?.modules)
  usePageHeader({ title: t('nav.myWork'), icon: ListChecks })

  return (
    <div className="space-y-4 p-4 lg:p-5">
      <ModulePageHeader
        icon={ListChecks}
        title={t('myWork.title')}
        description={t('myWork.subtitle')}
        actions={<MyWorkFocusTabs value={focus} onChange={setFocus} />}
      />
      <MyWorkSummary />
      <MyWorkBoard focus={focus} enabledModules={enabledModules} />
    </div>
  )
}

export default MyWorkPage
