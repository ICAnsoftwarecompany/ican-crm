import { SlidersHorizontal } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

export function TableSettingsAction({ onClick }) {
  const { t } = useTranslation()
  if (!onClick) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
      title={t('customers.pageActions.tableSettingsTitle')}
      aria-label={t('customers.pageActions.tableSettingsTitle')}
    >
      <SlidersHorizontal size={15} />
      <span className="hidden sm:inline">{t('customers.tableSettings.title')}</span>
    </Button>
  )
}
