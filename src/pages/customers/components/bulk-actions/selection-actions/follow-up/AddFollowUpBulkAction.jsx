import { Plus } from 'lucide-react'
import { Button } from '../../../../../../shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

export function AddFollowUpBulkAction({ disabled = false, onClick }) {
  const { t } = useTranslation()
  return (
    <Button
      variant="ai"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={
        disabled
          ? t('customers.bulkActions.followUpSingleOnly')
          : t('customers.bulkActions.followUpForSelected')
      }
      className="whitespace-nowrap"
    >
      <Plus size={14} />
      {t('customers.followUp.addFollowUp')}
    </Button>
  )
}
