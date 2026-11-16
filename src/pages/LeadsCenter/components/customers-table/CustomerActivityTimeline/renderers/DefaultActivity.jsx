import { useTranslation } from 'react-i18next'
export function DefaultActivity({ activity }) {
  const { t } = useTranslation()
  const description = activity?.description || ''

  if (!description) {
    return <p className="text-sm font-semibold text-slate-500">{t('customers.activityTimeline.noExtraDetails')}</p>
  }

  return <p className="text-sm font-semibold text-slate-700">{description}</p>
}
