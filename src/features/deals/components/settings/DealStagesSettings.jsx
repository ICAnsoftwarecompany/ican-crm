import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CircleCheckBig, CircleX } from 'lucide-react'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { getDealsHubPath } from '../../constants/dealWorkspacePages'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { isLostStage, isWonStage } from '../../utils/dealStages'

/** The deal's stages (read-only: copied from the template at creation, independent afterwards). */
export function DealStagesSettings() {
  const { t } = useTranslation()
  const { stages } = useDealWorkspace()
  return (
    <div className="space-y-3">
      <ModuleNotice>{t('dealWorkspace.settings.stagesNote')}</ModuleNotice>
      <ol className="space-y-1">
        {stages.map((stage, index) => (
          <li key={stage.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            <span className="flex items-center gap-2 text-[var(--text)]">
              <span className="w-5 text-xs text-[var(--text-muted)]" dir="ltr">{index + 1}</span>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color || 'var(--text-muted)' }} />
              {stage.label}
            </span>
            {isWonStage(stage) && <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300"><CircleCheckBig size={13} />{t('dealWorkspace.settings.wonStage')}</span>}
            {isLostStage(stage) && <span className="inline-flex items-center gap-1 text-xs text-red-700 dark:text-red-300"><CircleX size={13} />{t('dealWorkspace.settings.lostStage')}</span>}
          </li>
        ))}
      </ol>
      <Link to={getDealsHubPath('pipelines')} className="text-sm font-semibold text-[var(--brand-accent)] hover:underline">{t('dealWorkspace.settings.manageTemplates')}</Link>
    </div>
  )
}
