import { useTranslation } from 'react-i18next'
export function SelectedCountBadge({ selectedCount = 0 }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#007A80]">
      {t('customers.bulkActions.selectedCount', { count: selectedCount })}
    </div>
  )
}
