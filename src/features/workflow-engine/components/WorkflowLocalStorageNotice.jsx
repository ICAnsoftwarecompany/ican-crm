import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'

/**
 * Must be visible everywhere a workflow's saved/active status is shown.
 * There is no backend workflow API yet (see
 * docs/WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md) — "Save"/"Activate" only
 * change local state on this browser. This notice is what keeps that
 * honest instead of presenting a fake working automation. See spec
 * section 59 "Do not overbuild frontend without backend".
 */
export function WorkflowLocalStorageNotice({ className }) {
  const { t } = useTranslation()
  return null
}