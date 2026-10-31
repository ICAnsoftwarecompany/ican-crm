import { CustomersPageShortcuts } from '../CustomersPageShortcuts'
import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { TableSettingsAction } from './TableSettingsAction'

export function CustomersPageActions({
  onAdd,
  onTableSettings,
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CustomersPageShortcuts />
      <TableSettingsAction onClick={onTableSettings} />
      {onAdd && <Button size="sm" onClick={onAdd}><Plus size={16} />{t('customers.pageActions.leadAction')}</Button>}
    </div>
  )
}
