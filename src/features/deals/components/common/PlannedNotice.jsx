import { useTranslation } from 'react-i18next'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { isDealApiLive } from '../../constants/dealApiStatus'

/**
 * Shown next to a feature whose endpoint is still planned (DEAL_API_STATUS). Renders nothing once the
 * capability is live, so the notice disappears by itself when the backend ships.
 */
export function PlannedNotice({ capability, className }) {
  const { t } = useTranslation()
  if (isDealApiLive(capability)) return null
  return (
    <ModuleNotice tone="warning" className={className}>
      {t(`dealWorkspace.planned.${capability}`, { defaultValue: t('dealWorkspace.planned.generic') })}
    </ModuleNotice>
  )
}
