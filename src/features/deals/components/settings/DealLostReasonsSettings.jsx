import { useTranslation } from 'react-i18next'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { LostReasonsManager } from '../../../definitions'

/**
 * Lead lost reasons (2026-10-16): why ONE lead inside a deal was lost — never the whole deal. The company's list from `/definitions/lost-reasons` (create / rename / turn off / delete,
 * saved at once; LostReasonsManager brings its own title). Offered by "Mark as lost" in every deal (sent as
 * `lost_reason_id`) and by the Leads Center. Shown in the deal settings and in the creation wizard's stages step.
 */
export function DealLostReasonsSettings({ compact = false }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      <ModuleNotice>{t('dealWorkspace.lostReasons.scopeNote')}</ModuleNotice>
      {!compact && <ModuleNotice>{t('dealWorkspace.lostReasons.sharedNote')}</ModuleNotice>}
      <LostReasonsManager />
    </div>
  )
}
