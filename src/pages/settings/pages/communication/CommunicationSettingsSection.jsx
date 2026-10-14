import { useTranslation } from 'react-i18next'
import { CircleDashed } from 'lucide-react'
import { ModuleNotice } from '../../../../shared/components/module-pages'

/**
 * Settings section of one Communication hub module. No settings API exists for these modules
 * yet, so it lists what the section will hold (`communication.modules.<id>.settingsItems`) and says
 * so, instead of rendering inputs that save nowhere.
 */
export function CommunicationSettingsSection({ moduleId }) {
  const { t } = useTranslation()
  const items = t(`communication.modules.${moduleId}.settingsItems`, { returnObjects: true })
  const list = items && typeof items === 'object' ? Object.values(items) : []

  return (
    <div className="space-y-3">
      <ModuleNotice tone="warning">{t('settings.communication.notConnected')}</ModuleNotice>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((item) => (
          <li key={item} className="flex items-start gap-2 rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-muted)]">
            <CircleDashed size={15} className="mt-0.5 shrink-0 text-[var(--text-light)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
