import { useTranslation } from 'react-i18next'
import { SubSidebarLayout } from '../../../shared/components/sub-sidebar'
import { getSettingsSidebarConfig } from '../constants/settingsNavigation'

export function SettingsLayout() {
  const { t } = useTranslation()

  return (
    <SubSidebarLayout
      storageKey="settings-sidebar-collapsed"
      mobileId="settings-mobile-sidebar"
      mobileLabel={t('settings.nav.menu')}
      sidebar={getSettingsSidebarConfig(t)}
    />
  )
}
