import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings2 } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { SettingsWorkspace } from '../../features/service'

/** /service/settings/:section? — Customer Hub configuration. */
export function ServiceSettingsPage() {
  const { t } = useTranslation()
  const { section } = useParams()
  usePageHeader({ title: t('service.settings.title'), icon: Settings2 })

  return (
    <div className="p-4 lg:p-5">
      <SettingsWorkspace section={section} basePath="/service/settings" />
    </div>
  )
}

export default ServiceSettingsPage
