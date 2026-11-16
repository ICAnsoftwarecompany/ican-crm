import { ArchiveRestore, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

export function TrashLeadsAction({ active = false, onClick, size = 'sm' }) {
  const { t } = useTranslation()
  if (!onClick) return null

  return (
    <Button
      variant={active ? 'primary' : 'outline'}
      size={size}
      onClick={onClick}
      className="gap-2"
    >
      {active ? <ArchiveRestore size={16} /> : <Trash2 size={16} />}
      {active ? t('customers.pageActions.activeRecords') : t('customers.pageActions.trash')}
    </Button>
  )
}
