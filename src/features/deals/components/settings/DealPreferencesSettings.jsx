import { useTranslation } from 'react-i18next'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'
import { PlannedNotice } from '../common/PlannedNotice'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'

const PLANNED = ['lostReasons', 'paymentDefaults', 'cardFields', 'notifications', 'stageRules']

/** Per-browser preferences (default pipeline view) + the workspace settings that need the backend. */
export function DealPreferencesSettings() {
  const { t } = useTranslation()
  const [view, setView] = useLocalStorage('deal-workspace:view-mode', 'kanban')
  return (
    <div className="space-y-4">
      <ModuleNotice>{t('dealWorkspace.settings.browserOnly')}</ModuleNotice>
      <FieldLabel label={t('dealWorkspace.settings.defaultView')} className="max-w-xs">
        <select className={dealInputClass} value={view} onChange={(event) => setView(event.target.value)}>
          {['kanban', 'table'].map((value) => <option key={value} value={value}>{t(`dealWorkspace.viewToggle.${value}`)}</option>)}
        </select>
      </FieldLabel>
      <PlannedNotice capability="dealSettings" />
      <ul className="grid gap-2 sm:grid-cols-2">
        {PLANNED.map((id) => <li key={id} className="rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-muted)]">{t(`dealWorkspace.settings.planned.${id}`)}</li>)}
      </ul>
    </div>
  )
}
