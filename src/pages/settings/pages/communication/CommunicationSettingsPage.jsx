import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { getCommunicationModule } from '../../../../features/communication'
import { SettingsSectionOutlet } from '../../registry/settingsSections'

/** /settings/communication/:moduleId — the same section the module shows on /<module>/settings. */
export function CommunicationSettingsPage() {
  const { t } = useTranslation()
  const { moduleId } = useParams()
  const module = getCommunicationModule(moduleId)

  if (!module) return <Navigate to="/settings" replace />

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={module.icon}
        title={t(`communication.modules.${module.id}.title`)}
        description={t('settings.communication.sectionDescription')}
      />
      <SettingsSectionOutlet sectionId={`communication.${module.id}`} />
    </div>
  )
}
